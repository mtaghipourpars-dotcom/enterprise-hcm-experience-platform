// ============================================================================
// Enterprise HCM Experience Platform - OM (Organizational Management) Routes
// Services: OM_WHOISWHO_001, OM_POSITION_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { query, queryOne } from '../db/database';
import { ApiResponse, OrgDirectoryEntryDto, PositionDetailDto } from '../types/api';

const router = Router();

// ----------------------------------------------------------------------------
// 5. OM_WHOISWHO_001: Org Directory & Who is Who Search
// ----------------------------------------------------------------------------
router.get(
  '/who-is-who',
  requirePermission('organization.whoiswho.read', {
    serviceCode: 'OM_WHOISWHO_001'
  }),
  validateRequest('OM_WHOISWHO_001', (req) => {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return [{ field: 'limit', message: 'Query parameter limit must be between 1 and 100.', code: 'INVALID_LIMIT' }];
    }
    return [];
  }),
  async (req: Request, res: Response) => {
    const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const deptFilter = typeof req.query.department === 'string' ? req.query.department.trim() : '';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        e.id,
        e.pernr,
        p.first_name || ' ' || p.last_name as full_name,
        oa.position_title,
        oa.org_unit_name,
        e.email,
        e.phone,
        oa.manager_id,
        oa.manager_name
      FROM employee e
      JOIN person p ON e.person_id = p.id
      LEFT JOIN employee_org_assignment oa ON e.id = oa.employee_id AND oa.valid_to = '9999-12-31'
      WHERE e.employment_status = 'ACTIVE'
    `;
    const params: any[] = [];

    if (searchTerm) {
      sql += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR e.pernr LIKE ? OR oa.position_title LIKE ?)`;
      const term = `%${searchTerm}%`;
      params.push(term, term, term, term);
    }

    if (deptFilter) {
      sql += ` AND oa.org_unit_name LIKE ?`;
      params.push(`%${deptFilter}%`);
    }

    // Get count
    const countRows = await query<any>(sql, params);
    const total = countRows.length;

    sql += ` ORDER BY p.last_name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await query<any>(sql, params);

    const data: OrgDirectoryEntryDto[] = rows.map(r => ({
      id: r.id,
      pernr: r.pernr,
      fullName: r.full_name,
      positionTitle: r.position_title || 'N/A',
      orgUnitName: r.org_unit_name || 'N/A',
      email: r.email,
      phone: r.phone,
      managerName: r.manager_name || undefined
    }));

    const response: ApiResponse<OrgDirectoryEntryDto[]> = {
      success: true,
      serviceCode: 'OM_WHOISWHO_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'OM_WHOISWHO_001',
        lineage: {
          domain: 'OM',
          coreEntities: ['om_object', 'om_relationship', 'position_detail'],
          sapSources: ['HRP1000', 'HRP1001'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 6. OM_POSITION_001: Position Profile & Job Requirements
// ----------------------------------------------------------------------------
router.get(
  '/positions/:id',
  requirePermission('organization.position.read', {
    serviceCode: 'OM_POSITION_001'
  }),
  async (req: Request, res: Response) => {
    const positionId = req.params.id;

    const row = await queryOne<any>(
      `SELECT 
        pos.id,
        pos.position_id,
        pos.title,
        pos.org_unit_id,
        oud.name as org_unit_name,
        pos.job_id,
        jd.title as job_title,
        pos.is_head,
        pos.occupant_employee_id,
        p.first_name || ' ' || p.last_name as occupant_name,
        e.pernr as occupant_pernr,
        pos.valid_from,
        pos.valid_to
       FROM position_detail pos
       LEFT JOIN org_unit_detail oud ON pos.org_unit_id = oud.org_unit_id
       LEFT JOIN job_detail jd ON pos.job_id = jd.job_id
       LEFT JOIN employee e ON pos.occupant_employee_id = e.id
       LEFT JOIN person p ON e.person_id = p.id
       WHERE pos.position_id = ? OR pos.id = ?
       LIMIT 1`,
      [positionId, positionId]
    );

    if (!row) {
      res.status(404).json({
        success: false,
        serviceCode: 'OM_POSITION_001',
        error: {
          code: 'POSITION_NOT_FOUND',
          message: `Position '${positionId}' not found in organizational structure.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const dto: PositionDetailDto = {
      id: row.id,
      positionCode: row.position_id,
      title: row.title,
      orgUnitId: row.org_unit_id,
      orgUnitName: row.org_unit_name || 'N/A',
      jobCode: row.job_id,
      jobTitle: row.job_title || 'N/A',
      isHeadOfOrgUnit: row.is_head === 1,
      occupantPernr: row.occupant_pernr || undefined,
      occupantName: row.occupant_name || undefined,
      validFrom: row.valid_from,
      validTo: row.valid_to
    };

    const response: ApiResponse<PositionDetailDto> = {
      success: true,
      serviceCode: 'OM_POSITION_001',
      data: dto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'OM_POSITION_001',
        lineage: {
          domain: 'OM',
          coreEntities: ['position_detail', 'job_detail', 'org_unit_detail'],
          sapSources: ['HRP1000', 'HRP1002'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
