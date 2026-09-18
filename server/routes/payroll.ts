// ============================================================================
// Enterprise HCM Experience Platform - PY (Payroll) Routes
// Services: PY_PAYSLIP_001, PY_WAGETYPE_001, PY_HISTORY_001
// ============================================================================

import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { query, queryOne } from '../db/database';
import { ApiResponse, PayslipDto } from '../types/api';

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
// 11. PY_PAYSLIP_001: Itemized Payslip & Compensation Statement
// ----------------------------------------------------------------------------
router.get(
  '/slip',
  requirePermission('payroll.self.read', {
    serviceCode: 'PY_PAYSLIP_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);
    const periodCode = (req.query.period as string) || '2026-02';

    const result = await queryOne<any>(
      `SELECT pr.id, pr.employee_id, pr.gross_amount, pr.net_amount, pr.total_deductions,
              pr.tax_amount, pr.insurance_amount, pr.currency,
              pp.period_code, pp.period_name, pp.payment_date
       FROM payroll_result pr
       JOIN payroll_period pp ON pr.period_id = pp.id
       WHERE pr.employee_id = ? AND pp.period_code = ?
       LIMIT 1`,
      [targetEmpId, periodCode]
    );

    if (!result) {
      res.status(404).json({
        success: false,
        serviceCode: 'PY_PAYSLIP_001',
        error: {
          code: 'PAYSLIP_NOT_FOUND',
          message: `No payroll settlement record found for employee in period '${periodCode}'.`,
          status: 404,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const wageTypeRows = await query<any>(
      `SELECT wage_type_code, wage_type_name, wage_type_category, amount
       FROM payroll_wage_type_result
       WHERE payroll_result_id = ?
       ORDER BY wage_type_code ASC`,
      [result.id]
    );

    const earnings = wageTypeRows
      .filter(w => w.wage_type_category === 'EARNING')
      .map(w => ({
        wageTypeCode: w.wage_type_code,
        name: w.wage_type_name,
        amount: w.amount
      }));

    const deductions = wageTypeRows
      .filter(w => w.wage_type_category === 'DEDUCTION')
      .map(w => ({
        wageTypeCode: w.wage_type_code,
        name: w.wage_type_name,
        amount: w.amount
      }));

    const dto: PayslipDto = {
      id: result.id,
      employeeId: result.employee_id,
      periodCode: result.period_code,
      periodName: result.period_name,
      paymentDate: result.payment_date,
      currency: result.currency,
      grossAmount: result.gross_amount,
      netAmount: result.net_amount,
      totalDeductions: result.total_deductions,
      taxAmount: result.tax_amount,
      insuranceAmount: result.insurance_amount,
      earnings,
      deductions
    };

    const response: ApiResponse<PayslipDto> = {
      success: true,
      serviceCode: 'PY_PAYSLIP_001',
      data: dto,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PY_PAYSLIP_001',
        lineage: {
          domain: 'PY',
          coreEntities: ['payroll_result', 'payroll_wage_type_result'],
          sapSources: ['PCL2', 'PAYROLL_RT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 12. PY_WAGETYPE_001: Wage Type Breakdown
// ----------------------------------------------------------------------------
router.get(
  '/wagetypes',
  requirePermission('payroll.wagetype.read', {
    serviceCode: 'PY_WAGETYPE_001'
  }),
  async (req: Request, res: Response) => {
    const rows = await query<any>(
      `SELECT id, wage_type_code, name, category, is_taxable, is_deduction
       FROM pay_wage_type_master
       ORDER BY wage_type_code ASC`
    );

    const data = rows.map(r => ({
      id: r.id,
      code: r.wage_type_code,
      name: r.name,
      category: r.category,
      isTaxable: r.is_taxable === 1,
      isDeduction: r.is_deduction === 1
    }));

    const response: ApiResponse<any[]> = {
      success: true,
      serviceCode: 'PY_WAGETYPE_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PY_WAGETYPE_001',
        lineage: {
          domain: 'PY',
          coreEntities: ['pay_wage_type_master', 'payroll_wage_type_result'],
          sapSources: ['PA0008', 'PAYROLL_RT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

// ----------------------------------------------------------------------------
// 13. PY_HISTORY_001: Multi-Period Payroll History
// ----------------------------------------------------------------------------
router.get(
  '/history',
  requirePermission('payroll.history.read', {
    serviceCode: 'PY_HISTORY_001'
  }),
  async (req: Request, res: Response) => {
    const targetEmpId = await resolveEmployeeId((req.query.employeeId as string) || req.user!.id);

    const rows = await query<any>(
      `SELECT pr.id, pr.employee_id, pr.gross_amount, pr.net_amount, pr.total_deductions,
              pr.tax_amount, pr.insurance_amount, pr.currency,
              pp.period_code, pp.period_name, pp.payment_date
       FROM payroll_result pr
       JOIN payroll_period pp ON pr.period_id = pp.id
       WHERE pr.employee_id = ?
       ORDER BY pp.start_date DESC`,
      [targetEmpId]
    );

    const data = rows.map(r => ({
      id: r.id,
      periodCode: r.period_code,
      periodName: r.period_name,
      paymentDate: r.payment_date,
      grossAmount: r.gross_amount,
      netAmount: r.net_amount,
      totalDeductions: r.total_deductions,
      taxAmount: r.tax_amount,
      insuranceAmount: r.insurance_amount,
      currency: r.currency
    }));

    const response: ApiResponse<any[]> = {
      success: true,
      serviceCode: 'PY_HISTORY_001',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Date.now(),
        serviceCode: 'PY_HISTORY_001',
        lineage: {
          domain: 'PY',
          coreEntities: ['payroll_result', 'payroll_period'],
          sapSources: ['PCL2', 'PAYROLL_RT'],
          verificationStatus: 'VERIFIED_STANDARD_ANCHOR'
        }
      }
    };

    res.json(response);
  }
);

export default router;
