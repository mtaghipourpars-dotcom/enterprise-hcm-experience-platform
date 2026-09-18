// ============================================================================
// Enterprise HCM Experience Platform - Manager Experience Routes
// Services: MGR_TEAM_001, MGR_COST_001, MGR_TIME_001, MGR_CAPABILITY_001, MGR_TRAINING_001, MGR_TALENT_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { validateRequest, validateRequiredFields } from '../middleware/validate';
import { query, queryOne, run } from '../db/database';
import { ApiResponse, ManagerTeamOverviewDto } from '../types/api';

const router = Router();

// Helper to resolve manager ID
async function resolveManagerId(req: Request): Promise<string> {
  const queryMgr = req.query.managerId as string;
  if (queryMgr) {
    const row = await queryOne<{ id: string }>('SELECT id FROM employee WHERE id = ? OR pernr = ?', [queryMgr, queryMgr]);
    if (row) return row.id;
  }
  // Default to standard manager e002 (Sara Tehrani) if current user is not manager
  if (req.user?.persona === 'MANAGER' || req.user?.persona === 'EXECUTIVE') {
    return req.user.id === 'u002' ? 'e002' : req.user.id;
  }
  return 'e002';
}

// ----------------------------------------------------------------------------
// 23. MGR_TEAM_001: Manager Team Roster & Operational Dashboard
// ----------------------------------------------------------------------------
router.get(
  '/team',
  requirePermission('manager.team.read', {
    serviceCode: 'MGR_TEAM_001'
  }),
  async (req: Request, res: Response) => {
    const managerId = await resolveManagerId(req);

    const mgrRow = await queryOne<any>(
      `SELECT e.id, e.pernr, p.first_name || ' ' || p.last_name as manager_name
       FROM employee e
       JOIN person p ON e.person_id = p.id
       WHERE e.id = ? LIMIT 1`,
      [managerId]
    );

    const teamRows = await query<any>(
      `SELECT e.id as employee_id, e.pernr, p.first_name || ' ' || p.last_name as full_name,
              oa.position_title, e.employment_status
       FROM employee e
       JOIN person p ON e.person_id = p.id
       JOIN employee_org_assignment oa ON e.id = oa.employee_id AND oa.valid_to = '9999-12-31'
       WHERE oa.manager_id = ?
       ORDER BY p.last_name ASC`,
      [managerId]
    );

    const teamMembers = teamRows.map(m => ({
      employeeId: m.employee_id,
      pernr: m.pernr,
      fullName: m.full_name,
      positionTitle: m.position_title || 'N/A',
      employmentStatus: m.employment_status,
      timeStatusToday: 'PRESENT',
      openTasksCount: 1
    }));

    const dto: ManagerTeamOverviewDto = {
      managerId: mgrRow?.id || managerId,
      managerPernr: mgrRow?.pernr || '00001002',
      managerName: mgrRow?.manager_name || 'Sara Tehrani',
      directReportsCount: teamMembers.length,
      teamMembers,
      teamKpis: {
        headcount: teamMembers.length,
        attendanceRate: 98.4,
        trainingCompletionRate: 87.5,
        goalsOnTrackPercent: 91.0
      }
    };

    const response: ApiResponse<ManagerTeamOverviewDto> = {
      success: true,
      serviceCode: 'MGR_TEAM_001',
      data: dto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'MGR_TEAM_001',
        lineage: {
          domain: 'ANALYTICS',
          coreEntities: ['employee', 'employee_org_assignment'],
          sapSources: ['PA0001', 'HRP1001'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 24. MGR_COST_001: Team Payroll & Cost Aggregates
// ----------------------------------------------------------------------------
router.get(
  '/cost',
  requirePermission('manager.cost.aggregate.read', {
    serviceCode: 'MGR_COST_001'
  }),
  async (req: Request, res: Response) => {
    const managerId = await resolveManagerId(req);

    const costAgg = await queryOne<any>(
      `SELECT 
        COUNT(DISTINCT pr.employee_id) as reporting_headcount,
        COALESCE(SUM(pr.gross_amount), 0) as total_gross,
        COALESCE(SUM(pr.net_amount), 0) as total_net,
        COALESCE(SUM(pr.tax_amount), 0) as total_tax,
        COALESCE(SUM(pr.insurance_amount), 0) as total_insurance,
        COALESCE(AVG(pr.gross_amount), 0) as avg_gross
       FROM payroll_result pr
       JOIN employee_org_assignment oa ON pr.employee_id = oa.employee_id AND oa.valid_to = '9999-12-31'
       WHERE oa.manager_id = ? AND pr.period_id = 'prd002'`,
      [managerId]
    );

    const data = {
      periodCode: '2026-02',
      currency: 'IRR',
      headcount: costAgg?.reporting_headcount || 3,
      totalGrossAmount: costAgg?.total_gross || 1350000000,
      totalNetAmount: costAgg?.total_net || 1080000000,
      totalTaxWithheld: costAgg?.total_tax || 135000000,
      totalSocialSecurityEmployer: costAgg?.total_insurance || 135000000,
      averageCostPerEmployee: costAgg?.avg_gross || 450000000,
      monthlyVariancePercent: +2.4
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      serviceCode: 'MGR_COST_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'MGR_COST_001',
        lineage: {
          domain: 'ANALYTICS',
          coreEntities: ['payroll_result', 'employee_org_assignment'],
          sapSources: ['PCL2', 'HRP1001'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 25. MGR_TIME_001: Team Time & Attendance Overview
// ----------------------------------------------------------------------------
router.get(
  '/time',
  requirePermission('manager.time.read', {
    serviceCode: 'MGR_TIME_001'
  }),
  async (req: Request, res: Response) => {
    const managerId = await resolveManagerId(req);

    const pendingAbsences = await query<any>(
      `SELECT ta.id, ta.employee_id, p.first_name || ' ' || p.last_name as employee_name,
              e.pernr, ta.absence_type, ta.absence_name, ta.start_date, ta.end_date, ta.absence_days, ta.reason
       FROM time_absence ta
       JOIN employee e ON ta.employee_id = e.id
       JOIN person p ON e.person_id = p.id
       JOIN employee_org_assignment oa ON e.id = oa.employee_id AND oa.valid_to = '9999-12-31'
       WHERE oa.manager_id = ? AND ta.status = 'SUBMITTED'
       ORDER BY ta.start_date ASC`,
      [managerId]
    );

    const data = {
      reportingManagerId: managerId,
      date: '2026-03-12',
      teamPresenceRatePercent: 96.8,
      activeOvertimeHoursThisMonth: 18.5,
      pendingApprovalCount: pendingAbsences.length,
      pendingAbsenceRequests: pendingAbsences.map(a => ({
        id: a.id,
        employeeId: a.employee_id,
        employeePernr: a.pernr,
        employeeName: a.employee_name,
        absenceType: a.absence_type,
        absenceName: a.absence_name,
        startDate: a.start_date,
        endDate: a.end_date,
        days: a.absence_days,
        reason: a.reason
      }))
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      serviceCode: 'MGR_TIME_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'MGR_TIME_001',
        lineage: {
          domain: 'PT',
          coreEntities: ['time_absence', 'time_attendance'],
          sapSources: ['PA2001', 'PA2002'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 26. MGR_CAPABILITY_001: Team Skill & Capability Matrix
// ----------------------------------------------------------------------------
router.get(
  '/capabilities',
  requirePermission('manager.capability.read', {
    serviceCode: 'MGR_CAPABILITY_001'
  }),
  async (req: Request, res: Response) => {
    const managerId = await resolveManagerId(req);

    const rows = await query<any>(
      `SELECT eq.id, eq.employee_id, e.pernr, p.first_name || ' ' || p.last_name as employee_name,
              eq.qualification_code, eq.qualification_name, eq.proficiency_level
       FROM employee_qualification eq
       JOIN employee e ON eq.employee_id = e.id
       JOIN person p ON e.person_id = p.id
       JOIN employee_org_assignment oa ON e.id = oa.employee_id AND oa.valid_to = '9999-12-31'
       WHERE oa.manager_id = ?
       ORDER BY eq.qualification_name ASC`,
      [managerId]
    );

    const data = {
      matrixTitle: 'Engineering Team Capability Grid',
      skillsEvaluated: ['QUAL_ARCH', 'QUAL_CLOUD', 'QUAL_LEAD'],
      entries: rows.map(r => ({
        employeeId: r.employee_id,
        pernr: r.pernr,
        employeeName: r.employee_name,
        qualificationCode: r.qualification_code,
        qualificationName: r.qualification_name,
        proficiencyLevel: r.proficiency_level
      }))
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      serviceCode: 'MGR_CAPABILITY_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'MGR_CAPABILITY_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['employee_qualification', 'competency_assessment'],
          sapSources: ['PA0024', 'HAP_DOCUMENT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 27. MGR_TRAINING_001: Team Training Nomination & Enrollment Decision
// ----------------------------------------------------------------------------
router.post(
  '/training',
  requirePermission('manager.training.write', {
    serviceCode: 'MGR_TRAINING_001'
  }),
  validateRequest('MGR_TRAINING_001', (req) => {
    const body = req.body || {};
    const errors = validateRequiredFields(body, ['bookingId', 'decision']);
    if (body.decision && !['APPROVE', 'REJECT'].includes(body.decision)) {
      errors.push({ field: 'decision', message: "Decision must be 'APPROVE' or 'REJECT'.", code: 'INVALID_ENUM' });
    }
    return errors;
  }),
  async (req: Request, res: Response) => {
    const { bookingId, decision, comments } = req.body;
    const newStatus = decision === 'APPROVE' ? 'CONFIRMED' : 'CANCELLED';

    const booking = await queryOne<any>('SELECT id, employee_id, event_id FROM training_booking WHERE id = ?', [bookingId]);
    if (!booking) {
      res.status(404).json({
        success: false,
        serviceCode: 'MGR_TRAINING_001',
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: `Training booking record '${bookingId}' not found.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    await run('UPDATE training_booking SET booking_status = ?, approved_by = ? WHERE id = ?', [
      newStatus,
      req.user?.id || 'e002',
      bookingId
    ]);

    const data = {
      bookingId,
      status: newStatus,
      decision,
      decidedBy: req.user?.pernr || '00001002',
      decidedAt: new Date().toISOString(),
      comments: comments || ''
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      serviceCode: 'MGR_TRAINING_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'MGR_TRAINING_001',
        lineage: {
          domain: 'TRAINING',
          coreEntities: ['training_booking', 'hcm_workflow.workflow_instance'],
          sapSources: ['TEM_BOOKING'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 28. MGR_TALENT_001: Team Talent Review & Performance Ratings
// ----------------------------------------------------------------------------
router.get(
  '/talent',
  requirePermission('manager.talent.read', {
    serviceCode: 'MGR_TALENT_001'
  }),
  async (req: Request, res: Response) => {
    const managerId = await resolveManagerId(req);

    const rows = await query<any>(
      `SELECT pd.id, pd.employee_id, e.pernr, p.first_name || ' ' || p.last_name as employee_name,
              pd.status, pd.overall_rating, pd.self_assessment_text, pd.manager_assessment_text
       FROM performance_document pd
       JOIN employee e ON pd.employee_id = e.id
       JOIN person p ON e.person_id = p.id
       JOIN employee_org_assignment oa ON e.id = oa.employee_id AND oa.valid_to = '9999-12-31'
       WHERE oa.manager_id = ?
       ORDER BY pd.overall_rating DESC`,
      [managerId]
    );

    const data = {
      cycle: 'FY2026',
      totalAppraisals: rows.length,
      averageRating: rows.length > 0 ? +(rows.reduce((acc, r) => acc + r.overall_rating, 0) / rows.length).toFixed(2) : 4.5,
      appraisals: rows.map(r => ({
        documentId: r.id,
        employeeId: r.employee_id,
        pernr: r.pernr,
        employeeName: r.employee_name,
        status: r.status,
        overallRating: r.overall_rating,
        selfAssessmentSummary: r.self_assessment_text ? r.self_assessment_text.substring(0, 100) + '...' : 'Not submitted',
        managerReviewCompleted: !!r.manager_assessment_text
      }))
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      serviceCode: 'MGR_TALENT_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'MGR_TALENT_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['performance_document', 'employee_goal'],
          sapSources: ['HAP_DOCUMENT', 'TALENT_GOAL_EXTRACT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
