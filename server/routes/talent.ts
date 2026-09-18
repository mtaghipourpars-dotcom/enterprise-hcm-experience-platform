// ============================================================================
// Enterprise HCM Experience Platform - Talent & Performance Management Routes
// Services: TM_GOALS_001, TM_IDP_001, TM_CAREER_001, TM_SELF_ASSESSMENT_001, TM_APPRAISAL_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { validateRequest, validateRequiredFields } from '../middleware/validate';
import { query, queryOne, run } from '../db/database';
import { ApiResponse, EmployeeGoalDto, IndividualDevelopmentPlanDto, CareerAspirationDto, AppraisalSummaryDto } from '../types/api';

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
// 18. TM_GOALS_001: Performance Goals
// ----------------------------------------------------------------------------
router.get(
  '/goals',
  requirePermission('talent.goals.read', {
    serviceCode: 'TM_GOALS_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT eg.id, eg.employee_id, eg.cycle_id, pc.title as cycle_name,
              eg.title, eg.description, eg.category, eg.weight, eg.progress_percent,
              eg.status, eg.target_date
       FROM employee_goal eg
       JOIN performance_cycle pc ON eg.cycle_id = pc.id
       WHERE eg.employee_id = ?
       ORDER BY eg.weight DESC`,
      [targetEmpId]
    );

    const data: EmployeeGoalDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      cycleId: r.cycle_id,
      cycleName: r.cycle_name,
      title: r.title,
      description: r.description,
      category: r.category,
      weight: r.weight,
      progressPercent: r.progress_percent,
      status: r.status,
      targetDate: r.target_date
    }));

    const response: ApiResponse<EmployeeGoalDto[]> = {
      success: true,
      serviceCode: 'TM_GOALS_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'TM_GOALS_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['employee_goal', 'performance_cycle'],
          sapSources: ['TALENT_GOAL_EXTRACT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 19. TM_IDP_001: Individual Development Plan (IDP)
// ----------------------------------------------------------------------------
router.get(
  '/idp',
  requirePermission('talent.idp.read', {
    serviceCode: 'TM_IDP_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT id, employee_id, goal_title, action_item, competency_name, target_completion_date, status
       FROM development_plan
       WHERE employee_id = ?
       ORDER BY target_completion_date ASC`,
      [targetEmpId]
    );

    const data: IndividualDevelopmentPlanDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      goalTitle: r.goal_title,
      actionItem: r.action_item,
      competencyName: r.competency_name,
      targetCompletionDate: r.target_completion_date,
      status: r.status
    }));

    const response: ApiResponse<IndividualDevelopmentPlanDto[]> = {
      success: true,
      serviceCode: 'TM_IDP_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'TM_IDP_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['development_plan', 'competency_master'],
          sapSources: ['TALENT_IDP_EXTRACT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 20. TM_CAREER_001: Career Aspirations
// ----------------------------------------------------------------------------
router.get(
  '/career',
  requirePermission('talent.career.read', {
    serviceCode: 'TM_CAREER_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT id, employee_id, target_role, timeframe_years, readiness_level, notes
       FROM career_aspiration
       WHERE employee_id = ?`,
      [targetEmpId]
    );

    const data: CareerAspirationDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      targetRole: r.target_role,
      timeframeYears: r.timeframe_years,
      readinessLevel: r.readiness_level,
      notes: r.notes || ''
    }));

    const response: ApiResponse<CareerAspirationDto[]> = {
      success: true,
      serviceCode: 'TM_CAREER_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'TM_CAREER_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['career_aspiration', 'position_detail'],
          sapSources: ['TALENT_CAREER_EXTRACT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 21. TM_SELF_ASSESSMENT_001: Submit Self-Assessment Appraisal
// ----------------------------------------------------------------------------
router.post(
  '/self-assessment',
  requirePermission('talent.selfassessment.write', {
    serviceCode: 'TM_SELF_ASSESSMENT_001'
  }),
  validateRequest('TM_SELF_ASSESSMENT_001', (req) => {
    return validateRequiredFields(req.body || {}, ['selfAssessmentText']);
  }),
  async (req: Request, res: Response) => {
    const employeeId = await resolveEmployeeId(req.body.employeeId || req.user!.id);
    const { selfAssessmentText } = req.body;
    const cycleId = req.body.cycleId || 'pc002'; // FY2026

    const docId = 'pd_' + Date.now();
    await run(
      `INSERT INTO performance_document (
        id, employee_id, cycle_id, status, self_assessment_text, overall_rating, submitted_at, source_key
      ) VALUES (?, ?, ?, 'SELF_ASSESSMENT', ?, 0.0, CURRENT_TIMESTAMP, ?)`,
      [docId, employeeId, cycleId, selfAssessmentText, 'HAP_DOC_' + docId]
    );

    const response: ApiResponse<any> = {
      success: true,
      serviceCode: 'TM_SELF_ASSESSMENT_001',
      data: {
        documentId: docId,
        employeeId,
        cycleId,
        status: 'SELF_ASSESSMENT',
        submittedAt: new Date().toISOString(),
        selfAssessmentSummary: selfAssessmentText
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'TM_SELF_ASSESSMENT_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['performance_document', 'competency_assessment'],
          sapSources: ['HAP_DOCUMENT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.status(201).json(response);
  }
);

// ----------------------------------------------------------------------------
// 22. TM_APPRAISAL_001: Performance Appraisal Summary
// ----------------------------------------------------------------------------
router.get(
  '/appraisals',
  requirePermission('talent.appraisal.read', {
    serviceCode: 'TM_APPRAISAL_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT pd.id, pd.employee_id, pd.cycle_id, pc.title as cycle_name,
              pd.status, pd.self_assessment_text, pd.manager_assessment_text,
              pd.overall_rating, pd.reviewed_at
       FROM performance_document pd
       JOIN performance_cycle pc ON pd.cycle_id = pc.id
       WHERE pd.employee_id = ?
       ORDER BY pc.year DESC`,
      [targetEmpId]
    );

    const data: AppraisalSummaryDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      cycleId: r.cycle_id,
      cycleName: r.cycle_name,
      appraisalStatus: r.status,
      overallRating: r.overall_rating,
      managerComments: r.manager_assessment_text || undefined,
      completedAt: r.reviewed_at || undefined
    }));

    const response: ApiResponse<AppraisalSummaryDto[]> = {
      success: true,
      serviceCode: 'TM_APPRAISAL_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'TM_APPRAISAL_001',
        lineage: {
          domain: 'TALENT',
          coreEntities: ['performance_document', 'performance_cycle'],
          sapSources: ['HAP_DOCUMENT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
