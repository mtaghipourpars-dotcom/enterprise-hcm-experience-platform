// ============================================================================
// Enterprise HCM Experience Platform - PA (Personnel Administration) Routes
// Services: PA_PROFILE_001, PA_FAMILY_001, PA_EDUCATION_001, PA_HSE_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { query, queryOne } from '../db/database';
import { ApiResponse, EmployeeProfileDto, FamilyMemberDto, EducationRecordDto, HseProfileDto } from '../types/api';

const router = Router();

// Helper to resolve employee UUID from either UUID, PERNR, or user ID
async function resolveEmployeeId(idOrPernr: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `SELECT e.id 
     FROM employee e 
     LEFT JOIN app_user u ON e.id = u.employee_id 
     WHERE e.id = ? OR e.pernr = ? OR u.id = ? OR u.username = ? LIMIT 1`,
    [idOrPernr, idOrPernr, idOrPernr, idOrPernr]
  );
  return row ? row.id : null;
}

// ----------------------------------------------------------------------------
// 1. PA_PROFILE_001: Comprehensive Employee Profile
// ----------------------------------------------------------------------------
router.get(
  '/:id/profile',
  requirePermission('employee.profile.read', {
    serviceCode: 'PA_PROFILE_001',
    allowSelfScope: true,
    targetIdParam: 'id'
  }),
  validateRequest('PA_PROFILE_001', (req) => {
    const id = req.params.id;
    if (!id || id.trim().length === 0) {
      return [{ field: 'id', message: 'Employee ID or PERNR parameter is required.', code: 'REQUIRED_PARAM' }];
    }
    return [];
  }),
  async (req: Request, res: Response) => {
    const targetId = req.params.id === 'me' || req.params.id === 'self'
      ? req.user!.pernr
      : req.params.id;

    const empId = await resolveEmployeeId(targetId);
    if (!empId) {
      res.status(404).json({
        success: false,
        serviceCode: 'PA_PROFILE_001',
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: `Employee master record not found for identifier '${targetId}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const row = await queryOne<any>(
      `SELECT 
        e.id as employee_id,
        e.pernr,
        p.first_name,
        p.last_name,
        p.national_id,
        p.birth_date,
        p.gender,
        p.marital_status,
        e.employment_status,
        e.hire_date,
        e.email,
        e.phone,
        oa.org_unit_id,
        oa.org_unit_name,
        oa.position_id,
        oa.position_title,
        oa.job_code,
        oa.job_title,
        oa.cost_center,
        oa.manager_id,
        oa.manager_name,
        a.street,
        a.city,
        a.postal_code,
        a.country,
        oa.valid_from as oa_valid_from,
        oa.valid_to as oa_valid_to
      FROM employee e
      JOIN person p ON e.person_id = p.id
      LEFT JOIN employee_org_assignment oa ON e.id = oa.employee_id AND oa.valid_to = '9999-12-31'
      LEFT JOIN employee_address a ON e.id = a.employee_id AND a.valid_to = '9999-12-31'
      WHERE e.id = ? LIMIT 1`,
      [empId]
    );

    if (!row) {
      res.status(404).json({
        success: false,
        serviceCode: 'PA_PROFILE_001',
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: `Employee details could not be resolved for ID '${empId}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const dto: EmployeeProfileDto = {
      id: row.employee_id,
      pernr: row.pernr,
      firstName: row.first_name,
      lastName: row.last_name,
      nationalId: row.national_id,
      birthDate: row.birth_date,
      gender: row.gender,
      maritalStatus: row.marital_status,
      employmentStatus: row.employment_status,
      hireDate: row.hire_date,
      orgUnitId: row.org_unit_id || '',
      orgUnitName: row.org_unit_name || 'N/A',
      positionId: row.position_id || '',
      positionTitle: row.position_title || 'N/A',
      jobCode: row.job_code || '',
      jobTitle: row.job_title || 'N/A',
      costCenter: row.cost_center || '',
      managerId: row.manager_id || '',
      managerName: row.manager_name || 'None',
      email: row.email,
      phone: row.phone,
      address: {
        street: row.street || '',
        city: row.city || '',
        postalCode: row.postal_code || '',
        country: row.country || ''
      },
      effectiveDates: {
        validFrom: row.oa_valid_from || row.hire_date,
        validTo: row.oa_valid_to || '9999-12-31'
      }
    };

    const response: ApiResponse<EmployeeProfileDto> = {
      success: true,
      serviceCode: 'PA_PROFILE_001',
      data: dto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PA_PROFILE_001',
        lineage: {
          domain: 'PA',
          coreEntities: ['person', 'employee', 'employee_org_assignment', 'employee_address'],
          sapSources: ['PA0001', 'PA0002', 'PA0006'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 2. PA_FAMILY_001: Family & Dependents
// ----------------------------------------------------------------------------
router.get(
  '/:id/family',
  requirePermission('employee.family.read', {
    serviceCode: 'PA_FAMILY_001',
    allowSelfScope: true,
    targetIdParam: 'id'
  }),
  async (req: Request, res: Response) => {
    const targetId = req.params.id === 'me' || req.params.id === 'self'
      ? req.user!.pernr
      : req.params.id;

    const empId = await resolveEmployeeId(targetId);
    if (!empId) {
      res.status(404).json({
        success: false,
        serviceCode: 'PA_FAMILY_001',
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: `Employee not found for identifier '${targetId}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const rows = await query<any>(
      `SELECT id, employee_id, relation_type, first_name, last_name, birth_date, national_id, is_dependent, medical_insurance_enrolled
       FROM employee_family
       WHERE employee_id = ? AND valid_to = '9999-12-31'
       ORDER BY birth_date ASC`,
      [empId]
    );

    const data: FamilyMemberDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      relationType: r.relation_type,
      firstName: r.first_name,
      lastName: r.last_name,
      birthDate: r.birth_date,
      nationalId: r.national_id,
      isDependent: r.is_dependent === 1,
      medicalInsuranceEnrolled: r.medical_insurance_enrolled === 1
    }));

    const response: ApiResponse<FamilyMemberDto[]> = {
      success: true,
      serviceCode: 'PA_FAMILY_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PA_FAMILY_001',
        lineage: {
          domain: 'PA',
          coreEntities: ['employee_family'],
          sapSources: ['PA0021'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 3. PA_EDUCATION_001: Education Credentials
// ----------------------------------------------------------------------------
router.get(
  '/:id/education',
  requirePermission('employee.education.read', {
    serviceCode: 'PA_EDUCATION_001',
    allowSelfScope: true,
    targetIdParam: 'id'
  }),
  async (req: Request, res: Response) => {
    const targetId = req.params.id === 'me' || req.params.id === 'self'
      ? req.user!.pernr
      : req.params.id;

    const empId = await resolveEmployeeId(targetId);
    if (!empId) {
      res.status(404).json({
        success: false,
        serviceCode: 'PA_EDUCATION_001',
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: `Employee not found for identifier '${targetId}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const rows = await query<any>(
      `SELECT id, employee_id, degree_level, field_of_study, institution_name, graduation_year, gpa
       FROM employee_education
       WHERE employee_id = ?
       ORDER BY graduation_year DESC`,
      [empId]
    );

    const data: EducationRecordDto[] = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      degreeLevel: r.degree_level,
      fieldOfStudy: r.field_of_study,
      institutionName: r.institution_name,
      graduationYear: r.graduation_year,
      gpa: r.gpa || undefined
    }));

    const response: ApiResponse<EducationRecordDto[]> = {
      success: true,
      serviceCode: 'PA_EDUCATION_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PA_EDUCATION_001',
        lineage: {
          domain: 'PA',
          coreEntities: ['employee_education'],
          sapSources: ['PA0022'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 4. PA_HSE_001: Health, Safety & Medical Profile
// ----------------------------------------------------------------------------
router.get(
  '/:id/hse',
  requirePermission('employee.hse.read', {
    serviceCode: 'PA_HSE_001',
    allowSelfScope: true,
    targetIdParam: 'id'
  }),
  async (req: Request, res: Response) => {
    const targetId = req.params.id === 'me' || req.params.id === 'self'
      ? req.user!.pernr
      : req.params.id;

    const empId = await resolveEmployeeId(targetId);
    if (!empId) {
      res.status(404).json({
        success: false,
        serviceCode: 'PA_HSE_001',
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: `Employee not found for identifier '${targetId}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const row = await queryOne<any>(
      `SELECT id, employee_id, blood_type, last_checkup_date, fitness_status, medical_restrictions, emergency_contact_name, emergency_contact_rel, emergency_contact_phone
       FROM employee_health_profile
       WHERE employee_id = ? AND valid_to = '9999-12-31'
       LIMIT 1`,
      [empId]
    );

    if (!row) {
      res.status(404).json({
        success: false,
        serviceCode: 'PA_HSE_001',
        error: {
          code: 'HSE_RECORD_NOT_FOUND',
          message: `Health & Safety record not found for employee '${empId}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    let restrictions: string[] = [];
    try {
      restrictions = JSON.parse(row.medical_restrictions || '[]');
    } catch {
      restrictions = [row.medical_restrictions];
    }

    const dto: HseProfileDto = {
      id: row.id,
      employeeId: row.employee_id,
      bloodType: row.blood_type,
      lastCheckupDate: row.last_checkup_date,
      fitnessStatus: row.fitness_status,
      medicalRestrictions: restrictions,
      emergencyContact: {
        name: row.emergency_contact_name,
        relationship: row.emergency_contact_rel,
        phone: row.emergency_contact_phone
      }
    };

    const response: ApiResponse<HseProfileDto> = {
      success: true,
      serviceCode: 'PA_HSE_001',
      data: dto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PA_HSE_001',
        lineage: {
          domain: 'PA',
          coreEntities: ['employee_health_profile'],
          sapSources: ['PA0028'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
