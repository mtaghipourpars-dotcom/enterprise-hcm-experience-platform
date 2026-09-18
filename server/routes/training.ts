// ============================================================================
// Enterprise HCM Experience Platform - Training & Event Management Routes
// Services: PE_TRAINING_CENTER_001, PE_MY_BOOKINGS_001, PE_MY_HISTORY_001, PE_MY_QUALIFICATIONS_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { validateRequest, validateRequiredFields } from '../middleware/validate';
import { query, queryOne, run } from '../db/database';
import { ApiResponse, TrainingCourseDto, TrainingBookingDto, QualificationGapDto } from '../types/api';

const router = Router();

// Helper to resolve employee UUID
async function resolveEmployeeId(idOrPernr?: string): Promise<string> {
  if (!idOrPernr) return '';
  const row = await queryOne<{ id: string }>(
    `SELECT e.id 
     FROM employee e 
     LEFT JOIN app_user u ON e.id = u.employee_id 
     WHERE e.id = ? OR e.pernr = ? OR u.id = ? OR u.username = ? LIMIT 1`,
    [idOrPernr, idOrPernr, idOrPernr, idOrPernr]
  );
  return row ? row.id : idOrPernr;
}

// ----------------------------------------------------------------------------
// 14. PE_TRAINING_CENTER_001: Course Catalog & Scheduled Events
// ----------------------------------------------------------------------------
router.get(
  '/courses',
  requirePermission('training.catalog.read', {
    serviceCode: 'PE_TRAINING_CENTER_001'
  }),
  async (req: Request, res: Response) => {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

    let sql = `SELECT id, course_code, title, description, duration_hours, delivery_method, category
               FROM training_course
               WHERE valid_to = '9999-12-31'`;
    const params: any[] = [];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY title ASC`;

    const courses = await query<any>(sql, params);

    const data: TrainingCourseDto[] = [];
    for (const c of courses) {
      const events = await query<any>(
        `SELECT id, event_code, start_date, end_date, location, max_capacity, booked_capacity, instructor
         FROM training_event
         WHERE course_id = ?
         ORDER BY start_date ASC`,
        [c.id]
      );

      data.push({
        id: c.id,
        courseCode: c.course_code,
        title: c.title,
        description: c.description,
        durationHours: c.duration_hours,
        deliveryMethod: c.delivery_method,
        category: c.category,
        upcomingEvents: events.map(e => ({
          eventId: e.id,
          startDate: e.start_date,
          endDate: e.end_date,
          location: e.location,
          availableSeats: Math.max(0, e.max_capacity - e.booked_capacity),
          instructor: e.instructor
        }))
      });
    }

    const response: ApiResponse<TrainingCourseDto[]> = {
      success: true,
      serviceCode: 'PE_TRAINING_CENTER_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PE_TRAINING_CENTER_001',
        lineage: {
          domain: 'TRAINING',
          coreEntities: ['training_course', 'training_course_group', 'training_event'],
          sapSources: ['TEM_COURSE_TYPE', 'TEM_EVENT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 15. PE_MY_BOOKINGS_001: Course Booking & Enrollment Workflow
// ----------------------------------------------------------------------------
router.post(
  '/bookings',
  requirePermission('training.booking.write', {
    serviceCode: 'PE_MY_BOOKINGS_001'
  }),
  validateRequest('PE_MY_BOOKINGS_001', (req) => {
    return validateRequiredFields(req.body || {}, ['eventId']);
  }),
  async (req: Request, res: Response) => {
    const employeeId = await resolveEmployeeId(req.body.employeeId || req.user!.id);
    const { eventId } = req.body;

    const event = await queryOne<any>(
      `SELECT te.id, te.event_code, te.start_date, te.end_date, te.max_capacity, te.booked_capacity,
              tc.course_code, tc.title as course_title
       FROM training_event te
       JOIN training_course tc ON te.course_id = tc.id
       WHERE te.id = ? LIMIT 1`,
      [eventId]
    );

    if (!event) {
      res.status(404).json({
        success: false,
        serviceCode: 'PE_MY_BOOKINGS_001',
        error: {
          code: 'EVENT_NOT_FOUND',
          message: `Training event '${eventId}' does not exist.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Check duplicate booking
    const existing = await queryOne<any>(
      `SELECT id FROM training_booking WHERE employee_id = ? AND event_id = ? AND booking_status != 'CANCELLED' LIMIT 1`,
      [employeeId, eventId]
    );

    if (existing) {
      res.status(400).json({
        success: false,
        serviceCode: 'PE_MY_BOOKINGS_001',
        error: {
          code: 'DUPLICATE_BOOKING',
          message: `Employee is already enrolled or has a pending booking for this training event.`,
          status: 400,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const bookingId = 'tb_' + Date.now();
    await run(
      `INSERT INTO training_booking (id, employee_id, event_id, booking_status, booking_date, source_key)
       VALUES (?, ?, ?, 'CONFIRMED', CURRENT_TIMESTAMP, ?)`,
      [bookingId, employeeId, eventId, 'TEM_BOOKING_' + bookingId]
    );

    // Update booked capacity
    await run('UPDATE training_event SET booked_capacity = booked_capacity + 1 WHERE id = ?', [eventId]);

    const dto: TrainingBookingDto = {
      id: bookingId,
      employeeId,
      eventId: event.id,
      courseCode: event.course_code,
      courseTitle: event.course_title,
      startDate: event.start_date,
      endDate: event.end_date,
      bookingStatus: 'CONFIRMED',
      bookingDate: new Date().toISOString()
    };

    const response: ApiResponse<TrainingBookingDto> = {
      success: true,
      serviceCode: 'PE_MY_BOOKINGS_001',
      data: dto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PE_MY_BOOKINGS_001',
        lineage: {
          domain: 'TRAINING',
          coreEntities: ['training_booking', 'training_event'],
          sapSources: ['TEM_BOOKING'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.status(201).json(response);
  }
);

// ----------------------------------------------------------------------------
// 16. PE_MY_HISTORY_001: Training Attendance History
// ----------------------------------------------------------------------------
router.get(
  '/history',
  requirePermission('training.history.read', {
    serviceCode: 'PE_MY_HISTORY_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT tb.id, tb.employee_id, tb.booking_status, tb.booking_date,
              te.id as event_id, te.start_date, te.end_date, te.location, te.instructor,
              tc.course_code, tc.title as course_title, tc.duration_hours
       FROM training_booking tb
       JOIN training_event te ON tb.event_id = te.id
       JOIN training_course tc ON te.course_id = tc.id
       WHERE tb.employee_id = ?
       ORDER BY te.start_date DESC`,
      [targetEmpId]
    );

    const data = rows.map(r => ({
      id: r.id,
      courseCode: r.course_code,
      courseTitle: r.course_title,
      durationHours: r.duration_hours,
      startDate: r.start_date,
      endDate: r.end_date,
      location: r.location,
      instructor: r.instructor,
      status: r.booking_status,
      bookingDate: r.booking_date
    }));

    const response: ApiResponse<any[]> = {
      success: true,
      serviceCode: 'PE_MY_HISTORY_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PE_MY_HISTORY_001',
        lineage: {
          domain: 'TRAINING',
          coreEntities: ['training_booking', 'training_attendance_result'],
          sapSources: ['TEM_BOOKING', 'TEM_EVENT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 17. PE_MY_QUALIFICATIONS_001: Qualifications & Competency Gaps
// ----------------------------------------------------------------------------
router.get(
  '/qualifications',
  requirePermission('qualification.read', {
    serviceCode: 'PE_MY_QUALIFICATIONS_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const qualRows = await query<any>(
      `SELECT id, qualification_code, qualification_name, proficiency_level, acquired_date, expiry_date
       FROM employee_qualification
       WHERE employee_id = ?
       ORDER BY qualification_name ASC`,
      [targetEmpId]
    );

    const gapRows = await query<any>(
      `SELECT id, qualification_code, qualification_name, required_proficiency, current_proficiency, gap_score, status
       FROM employee_qualification_gap
       WHERE employee_id = ?
       ORDER BY gap_score DESC`,
      [targetEmpId]
    );

    const data = {
      qualifications: qualRows.map(q => ({
        id: q.id,
        code: q.qualification_code,
        name: q.qualification_name,
        proficiencyLevel: q.proficiency_level,
        acquiredDate: q.acquired_date,
        expiryDate: q.expiry_date || undefined
      })),
      gaps: gapRows.map((g): QualificationGapDto => ({
        id: g.id,
        employeeId: targetEmpId,
        qualificationCode: g.qualification_code,
        qualificationName: g.qualification_name,
        requiredProficiency: g.required_proficiency,
        currentProficiency: g.current_proficiency,
        gapScore: g.gap_score,
        gap: g.gap_score,
        status: g.status as any
      }))
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      serviceCode: 'PE_MY_QUALIFICATIONS_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PE_MY_QUALIFICATIONS_001',
        lineage: {
          domain: 'TRAINING',
          coreEntities: ['employee_qualification', 'employee_qualification_gap'],
          sapSources: ['PA0024'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
