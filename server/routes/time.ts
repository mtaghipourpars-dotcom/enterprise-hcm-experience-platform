// ============================================================================
// Enterprise HCM Experience Platform - PT (Time Management) Routes
// Services: PT_REQUEST_001, PT_HISTORY_001, PT_ATTENDANCE_001, PT_QUOTA_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { validateRequest, validateRequiredFields, validateDateRange } from '../middleware/validate';
import { query, queryOne, run } from '../db/database';
import { ApiResponse, TimeAbsenceDto, TimeAttendanceDto, TimeQuotaDto } from '../types/api';

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
// 7. PT_REQUEST_001: Submit Time Off Request (Workflow)
// ----------------------------------------------------------------------------
router.post(
  '/requests',
  requirePermission('time.request.write', {
    serviceCode: 'PT_REQUEST_001'
  }),
  validateRequest('PT_REQUEST_001', (req) => {
    const body = req.body || {};
    const errors = validateRequiredFields(body, ['absenceType', 'startDate', 'endDate', 'days']);
    errors.push(...validateDateRange(body.startDate, body.endDate));
    if (typeof body.days !== 'number' || body.days <= 0) {
      errors.push({ field: 'days', message: 'Requested days must be a positive number greater than 0.', code: 'INVALID_DAYS' });
    }
    return errors;
  }),
  async (req: Request, res: Response) => {
    const employeeId = await resolveEmployeeId(req.body.employeeId || req.user!.id);
    const { absenceType, startDate, endDate, days, reason } = req.body;

    // Determine absence name
    const typeNames: Record<string, string> = {
      '0100': 'Annual Vacation',
      '0200': 'Medical / Sick Leave',
      '0300': 'Maternity / Paternity Leave',
      '0400': 'Bereavement Leave',
      '0500': 'Unpaid Leave'
    };
    const absenceName = typeNames[absenceType] || 'Standard Leave';

    // Verify quota balance if annual vacation
    if (absenceType === '0100') {
      const quota = await queryOne<{ balance_days: number }>(
        "SELECT balance_days FROM time_quota WHERE employee_id = ? AND quota_type = '01' LIMIT 1",
        [employeeId]
      );
      if (quota && quota.balance_days < days) {
        res.status(400).json({
          success: false,
          serviceCode: 'PT_REQUEST_001',
          error: {
            code: 'INSUFFICIENT_QUOTA',
            message: `Requested ${days} days exceeds remaining quota balance of ${quota.balance_days} days.`,
            status: 400,
            details: { requestedDays: days, availableQuota: quota.balance_days },
            timestamp: new Date().toISOString()
          }
        });
        return;
      }
    }

    // Resolve manager for workflow task
    const org = await queryOne<{ manager_id: string }>(
      'SELECT manager_id FROM employee_org_assignment WHERE employee_id = ? ORDER BY valid_to DESC LIMIT 1',
      [employeeId]
    );

    const absenceId = 'abs_' + Date.now();
    const wfInstanceId = 'wf_' + Date.now();
    const wfTaskId = 'tk_' + Date.now();

    // Insert time absence
    await run(
      `INSERT INTO time_absence (id, employee_id, absence_type, absence_name, start_date, end_date, absence_days, status, reason, workflow_instance_id, source_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?)`,
      [absenceId, employeeId, absenceType, absenceName, startDate, endDate, days, reason || '', wfInstanceId, 'PA2001_' + absenceId]
    );

    // Create workflow instance
    await run(
      `INSERT INTO workflow_instance (id, service_code, requester_id, status, entity_name, entity_id, current_step, title, request_payload)
       VALUES (?, 'PT_REQUEST_001', ?, 'PENDING', 'time_absence', ?, 'MANAGER_APPROVAL', ?, ?)`,
      [
        wfInstanceId,
        employeeId,
        absenceId,
        `${absenceName} (${days} Days)`,
        JSON.stringify({ absenceType, startDate, endDate, days, reason })
      ]
    );

    // Create task for manager
    await run(
      `INSERT INTO workflow_task (id, instance_id, approver_id, approver_role, status, comments)
       VALUES (?, ?, ?, 'MANAGER', 'PENDING', 'Awaiting managerial sign-off')`,
      [wfTaskId, wfInstanceId, org?.manager_id || null]
    );

    const createdDto: TimeAbsenceDto = {
      id: absenceId,
      employeeId,
      absenceType,
      absenceName,
      startDate,
      endDate,
      days,
      status: 'SUBMITTED',
      reason,
      workflowInstanceId: wfInstanceId,
      createdAt: new Date().toISOString()
    };

    const response: ApiResponse<TimeAbsenceDto> = {
      success: true,
      serviceCode: 'PT_REQUEST_001',
      data: createdDto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PT_REQUEST_001',
        lineage: {
          domain: 'PT',
          coreEntities: ['time_absence', 'hcm_workflow.workflow_instance', 'hcm_workflow.workflow_task'],
          sapSources: ['PA2001'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.status(201).json(response);
  }
);

// ----------------------------------------------------------------------------
// 8. PT_HISTORY_001: Time Request History
// ----------------------------------------------------------------------------
router.get(
  '/requests/history',
  requirePermission('time.request.history.read', {
    serviceCode: 'PT_HISTORY_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT id, employee_id, absence_type, absence_name, start_date, end_date, absence_days, status, reason, workflow_instance_id, created_at
       FROM time_absence
       WHERE employee_id = ?
       ORDER BY start_date DESC`,
      [targetEmpId]
    );

    const data: TimeAbsenceDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      absenceType: r.absence_type,
      absenceName: r.absence_name,
      startDate: r.start_date,
      endDate: r.end_date,
      days: r.absence_days,
      status: r.status,
      reason: r.reason || undefined,
      workflowInstanceId: r.workflow_instance_id || undefined,
      createdAt: r.created_at
    }));

    const response: ApiResponse<TimeAbsenceDto[]> = {
      success: true,
      serviceCode: 'PT_HISTORY_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PT_HISTORY_001',
        lineage: {
          domain: 'PT',
          coreEntities: ['time_absence', 'hcm_workflow.workflow_instance'],
          sapSources: ['PA2001'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 9. PT_ATTENDANCE_001: Daily Attendance Timesheet & Clock Events
// ----------------------------------------------------------------------------
router.get(
  '/attendance',
  requirePermission('time.attendance.read', {
    serviceCode: 'PT_ATTENDANCE_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT id, employee_id, attendance_date, scheduled_hours, actual_hours, overtime_hours, check_in_time, check_out_time, status
       FROM time_attendance
       WHERE employee_id = ?
       ORDER BY attendance_date DESC`,
      [targetEmpId]
    );

    const data: TimeAttendanceDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      attendanceDate: r.attendance_date,
      scheduledHours: r.scheduled_hours,
      actualHours: r.actual_hours,
      overtimeHours: r.overtime_hours,
      checkInTime: r.check_in_time || undefined,
      checkOutTime: r.check_out_time || undefined,
      status: r.status
    }));

    const response: ApiResponse<TimeAttendanceDto[]> = {
      success: true,
      serviceCode: 'PT_ATTENDANCE_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PT_ATTENDANCE_001',
        lineage: {
          domain: 'PT',
          coreEntities: ['time_attendance', 'time_event'],
          sapSources: ['PA2002', 'TEVEN'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 10. PT_QUOTA_001: Leave Quota Balances
// ----------------------------------------------------------------------------
router.get(
  '/quotas',
  requirePermission('time.quota.read', {
    serviceCode: 'PT_QUOTA_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT id, employee_id, quota_type, quota_name, entitlement_days, used_days, balance_days, valid_from, valid_to
       FROM time_quota
       WHERE employee_id = ?
       ORDER BY quota_type ASC`,
      [targetEmpId]
    );

    const data: TimeQuotaDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      quotaType: r.quota_type,
      quotaName: r.quota_name,
      entitlementDays: r.entitlement_days,
      usedDays: r.used_days,
      balanceDays: r.balance_days,
      validFrom: r.valid_from,
      validTo: r.valid_to
    }));

    const response: ApiResponse<TimeQuotaDto[]> = {
      success: true,
      serviceCode: 'PT_QUOTA_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PT_QUOTA_001',
        lineage: {
          domain: 'PT',
          coreEntities: ['time_quota', 'time_quota_deduction'],
          sapSources: ['PA2006', 'PA2007'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
