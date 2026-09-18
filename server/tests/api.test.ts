// ============================================================================
// Enterprise HCM Experience Platform - Automated Backend API Test Suite
// Verifies all 8 dimensions: Endpoint, Authorization, Validation, DB Query,
// Response DTO, Error Model, Audit Logging, and 8-Tier Lineage
// ============================================================================

import express from 'express';
import http from 'http';
import { initDatabase, query, queryOne } from '../db/database';
import { seedDatabase } from '../db/seed';

import { authMiddleware } from '../middleware/auth';
import { auditMiddleware } from '../middleware/audit';
import { errorHandler } from '../middleware/error-handler';

import employeeRouter from '../routes/employee';
import organizationRouter from '../routes/organization';
import timeRouter from '../routes/time';
import payrollRouter from '../routes/payroll';
import trainingRouter from '../routes/training';
import talentRouter from '../routes/talent';
import managerRouter from '../routes/manager';
import analyticsRouter from '../routes/analytics';
import workflowRouter from '../routes/workflow';
import systemRouter from '../routes/system';

let server: http.Server;
let baseUrl = '';

interface TestResult {
  name: string;
  serviceCode: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function setupTestApp(): Promise<void> {
  await initDatabase();
  await seedDatabase();

  const app = express();
  app.use(express.json());
  app.use(authMiddleware);
  app.use(auditMiddleware);

  app.use('/api/employee', employeeRouter);
  app.use('/api/organization', organizationRouter);
  app.use('/api/time', timeRouter);
  app.use('/api/payroll', payrollRouter);
  app.use('/api/training', trainingRouter);
  app.use('/api/talent', talentRouter);
  app.use('/api/manager', managerRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/workflow', workflowRouter);
  app.use('/api', systemRouter);
  app.use(errorHandler);

  return new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`[Test Runner] Test server listening on ${baseUrl}`);
      resolve();
    });
  });
}

async function runTest(
  name: string,
  serviceCode: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, serviceCode, passed: true, durationMs });
    console.log(`  ✓ [PASS] [${serviceCode}] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, serviceCode, passed: false, error: err.message, durationMs });
    console.error(`  ✗ [FAIL] [${serviceCode}] ${name}: ${err.message}`);
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<{ status: number; body: any }> {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, options);
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
}

async function runAllTests() {
  console.log('\n================================================================');
  console.log('ENTERPRISE HCM PLATFORM - SERVICE CATALOG BACKEND VERIFICATION');
  console.log('================================================================\n');

  await setupTestApp();

  // --------------------------------------------------------------------------
  // Test Suite 1: System Health & Catalog Lineage
  // --------------------------------------------------------------------------
  console.log('\n--- System & Catalog Introspection ---');
  await runTest('Health Check Verification', 'SYS_HEALTH_001', async () => {
    const { status, body } = await apiRequest('/api/health');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.status === 'ok', 'Expected body.status === ok');
    assert(body.database === 'connected', 'Expected database connected');
  });

  await runTest('Master Catalog Introspection & 8-Tier Metadata', 'CATALOG_001', async () => {
    const { status, body } = await apiRequest('/api/catalog');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success === true');
    assert(Array.isArray(body.catalog?.services), 'Expected services array');
    assert(body.catalog.services.length >= 35, `Expected >= 35 services, got ${body.catalog?.services?.length}`);
  });

  // --------------------------------------------------------------------------
  // Test Suite 2: Domain PA (Personnel Administration)
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: PA (Personnel Administration) ---');
  await runTest('PA_PROFILE_001: Employee profile with standard DTO & lineage', 'PA_PROFILE_001', async () => {
    const { status, body } = await apiRequest('/api/employee/00001001/profile', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success === true');
    assert(body.serviceCode === 'PA_PROFILE_001', 'Expected serviceCode === PA_PROFILE_001');
    assert(body.data.pernr === '00001001', 'Expected pernr 00001001');
    assert(body.data.firstName === 'Arash', 'Expected Arash');
    assert(body.data.lastName === 'Moradi', 'Expected Moradi');
    assert(body.meta.lineage.sapSources.includes('PA0001'), 'Expected PA0001 in lineage');
  });

  await runTest('PA_PROFILE_001 [AUTH]: Scope violation when non-admin accesses another employee', 'PA_PROFILE_001', async () => {
    const { status, body } = await apiRequest('/api/employee/00001002/profile', {
      headers: { 'x-pernr': '00001001', 'x-persona': 'EMPLOYEE' }
    });
    assert(status === 403, `Expected 403 forbidden, got ${status}`);
    assert(body.success === false, 'Expected success === false');
    assert(body.error.code === 'SCOPE_VIOLATION', `Expected SCOPE_VIOLATION, got ${body.error?.code}`);
  });

  await runTest('PA_FAMILY_001: Employee dependents list with PA0021 lineage', 'PA_FAMILY_001', async () => {
    const { status, body } = await apiRequest('/api/employee/00001001/family', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array of dependents');
    assert(body.data.length >= 2, 'Expected at least 2 dependents');
    assert(body.meta.lineage.sapSources.includes('PA0021'), 'Expected PA0021 lineage');
  });

  await runTest('PA_EDUCATION_001: Education credentials with PA0022 lineage', 'PA_EDUCATION_001', async () => {
    const { status, body } = await apiRequest('/api/employee/00001001/education', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array of education records');
    assert(body.meta.lineage.sapSources.includes('PA0022'), 'Expected PA0022 lineage');
  });

  await runTest('PA_HSE_001: Health & Safety profile with PA0028 lineage', 'PA_HSE_001', async () => {
    const { status, body } = await apiRequest('/api/employee/00001001/hse', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.bloodType === 'O_POSITIVE', 'Expected bloodType O_POSITIVE');
    assert(body.meta.lineage.sapSources.includes('PA0028'), 'Expected PA0028 lineage');
  });

  // --------------------------------------------------------------------------
  // Test Suite 3: Domain OM (Organizational Management)
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: OM (Organizational Management) ---');
  await runTest('OM_WHOISWHO_001: Search directory with pagination', 'OM_WHOISWHO_001', async () => {
    const { status, body } = await apiRequest('/api/organization/who-is-who?search=Sara', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected data array');
    assert(body.data.length >= 1, 'Expected at least 1 record for Sara');
    assert(body.meta.pagination.total >= 1, 'Expected pagination total');
  });

  await runTest('OM_POSITION_001: Position details and vacancy status', 'OM_POSITION_001', async () => {
    const { status, body } = await apiRequest('/api/organization/positions/pos001', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.title === 'Senior Software Architect', 'Expected Senior Software Architect');
    assert(body.meta.lineage.sapSources.includes('HRP1000'), 'Expected HRP1000 lineage');
  });

  // --------------------------------------------------------------------------
  // Test Suite 4: Domain PT (Time Management)
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: PT (Time Management) ---');
  await runTest('PT_REQUEST_001: Submit leave request and create workflow task', 'PT_REQUEST_001', async () => {
    const { status, body } = await apiRequest('/api/time/requests', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pernr': '00001001'
      },
      body: JSON.stringify({
        absenceType: '0100',
        startDate: '2026-04-10',
        endDate: '2026-04-12',
        days: 3,
        reason: 'Personal leave'
      })
    });
    assert(status === 201, `Expected 201 Created, got ${status}`);
    assert(body.success === true, 'Expected success === true');
    assert(body.data.status === 'SUBMITTED', 'Expected status SUBMITTED');
    assert(body.data.workflowInstanceId !== undefined, 'Expected workflowInstanceId');
  });

  await runTest('PT_REQUEST_001 [VALIDATION]: Reject invalid date bounds', 'PT_REQUEST_001', async () => {
    const { status, body } = await apiRequest('/api/time/requests', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pernr': '00001001'
      },
      body: JSON.stringify({
        absenceType: '0100',
        startDate: '2026-05-20',
        endDate: '2026-05-10', // End before start!
        days: 2
      })
    });
    assert(status === 400, `Expected 400 Bad Request, got ${status}`);
    assert(body.error.code === 'VALIDATION_FAILED', 'Expected VALIDATION_FAILED');
  });

  await runTest('PT_HISTORY_001: Retrieve leave history', 'PT_HISTORY_001', async () => {
    const { status, body } = await apiRequest('/api/time/requests/history', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
    assert(body.data.length >= 1, 'Expected at least 1 absence request');
  });

  await runTest('PT_ATTENDANCE_001: Daily timesheet records with PA2002 lineage', 'PT_ATTENDANCE_001', async () => {
    const { status, body } = await apiRequest('/api/time/attendance', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
    assert(body.meta.lineage.sapSources.includes('PA2002'), 'Expected PA2002 lineage');
  });

  await runTest('PT_QUOTA_001: Leave quota balance with PA2006 lineage', 'PT_QUOTA_001', async () => {
    const { status, body } = await apiRequest('/api/time/quotas', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
    assert(body.meta.lineage.sapSources.includes('PA2006'), 'Expected PA2006 lineage');
  });

  // --------------------------------------------------------------------------
  // Test Suite 5: Domain PY (Payroll)
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: PY (Payroll) ---');
  await runTest('PY_PAYSLIP_001: Itemized payslip with earnings & deductions', 'PY_PAYSLIP_001', async () => {
    const { status, body } = await apiRequest('/api/payroll/slip?period=2026-02', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.grossAmount > 0, 'Expected positive grossAmount');
    assert(body.data.netAmount > 0, 'Expected positive netAmount');
    assert(Array.isArray(body.data.earnings), 'Expected earnings array');
    assert(Array.isArray(body.data.deductions), 'Expected deductions array');
    assert(body.meta.lineage.sapSources.includes('PAYROLL_RT'), 'Expected PAYROLL_RT lineage');
  });

  await runTest('PY_WAGETYPE_001: Wage type catalog with tax flags', 'PY_WAGETYPE_001', async () => {
    const { status, body } = await apiRequest('/api/payroll/wagetypes', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
  });

  await runTest('PY_HISTORY_001: Multi-period payroll history', 'PY_HISTORY_001', async () => {
    const { status, body } = await apiRequest('/api/payroll/history', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
    assert(body.data.length >= 2, 'Expected at least 2 historical periods');
  });

  // --------------------------------------------------------------------------
  // Test Suite 6: Domain Training (TEM)
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: Training (L&D) ---');
  await runTest('PE_TRAINING_CENTER_001: Course catalog with upcoming events', 'PE_TRAINING_CENTER_001', async () => {
    const { status, body } = await apiRequest('/api/training/courses', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array of courses');
    assert(body.data[0].upcomingEvents !== undefined, 'Expected upcomingEvents');
  });

  await runTest('PE_MY_BOOKINGS_001: Enroll in training session', 'PE_MY_BOOKINGS_001', async () => {
    const { status, body } = await apiRequest('/api/training/bookings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pernr': '00001001'
      },
      body: JSON.stringify({
        eventId: 'te002'
      })
    });
    assert(status === 201, `Expected 201 Created, got ${status}`);
    assert(body.data.bookingStatus === 'CONFIRMED', 'Expected bookingStatus CONFIRMED');
  });

  await runTest('PE_MY_HISTORY_001: Training completion history', 'PE_MY_HISTORY_001', async () => {
    const { status, body } = await apiRequest('/api/training/history', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
  });

  await runTest('PE_MY_QUALIFICATIONS_001: Qualifications & Competency Gaps', 'PE_MY_QUALIFICATIONS_001', async () => {
    const { status, body } = await apiRequest('/api/training/qualifications', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data.qualifications), 'Expected qualifications array');
    assert(Array.isArray(body.data.gaps), 'Expected gaps array');
  });

  // --------------------------------------------------------------------------
  // Test Suite 7: Domain Talent & Performance
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: Talent & Performance ---');
  await runTest('TM_GOALS_001: Performance goals for current cycle', 'TM_GOALS_001', async () => {
    const { status, body } = await apiRequest('/api/talent/goals', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
    assert(body.data.length >= 2, 'Expected >= 2 goals');
  });

  await runTest('TM_IDP_001: Individual Development Plan action items', 'TM_IDP_001', async () => {
    const { status, body } = await apiRequest('/api/talent/idp', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
  });

  await runTest('TM_CAREER_001: Career aspirations', 'TM_CAREER_001', async () => {
    const { status, body } = await apiRequest('/api/talent/career', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
  });

  await runTest('TM_SELF_ASSESSMENT_001: Submit self appraisal', 'TM_SELF_ASSESSMENT_001', async () => {
    const { status, body } = await apiRequest('/api/talent/self-assessment', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pernr': '00001001'
      },
      body: JSON.stringify({
        cycleId: 'pc002',
        selfAssessmentText: 'Completed enterprise architecture overhaul and microservice stability program.'
      })
    });
    assert(status === 201, `Expected 201 Created, got ${status}`);
    assert(body.data.status === 'SELF_ASSESSMENT', 'Expected status SELF_ASSESSMENT');
  });

  await runTest('TM_APPRAISAL_001: Appraisal summary history', 'TM_APPRAISAL_001', async () => {
    const { status, body } = await apiRequest('/api/talent/appraisals', {
      headers: { 'x-pernr': '00001001' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
  });

  // --------------------------------------------------------------------------
  // Test Suite 8: Manager Experience
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: Manager Services ---');
  await runTest('MGR_TEAM_001: Team roster & KPIs', 'MGR_TEAM_001', async () => {
    const { status, body } = await apiRequest('/api/manager/team', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.directReportsCount >= 1, 'Expected direct reports');
    assert(body.data.teamKpis !== undefined, 'Expected teamKpis');
  });

  await runTest('MGR_COST_001: Team payroll aggregate', 'MGR_COST_001', async () => {
    const { status, body } = await apiRequest('/api/manager/cost', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.totalGrossAmount > 0, 'Expected positive totalGrossAmount');
  });

  await runTest('MGR_TIME_001: Team presence and pending leave requests', 'MGR_TIME_001', async () => {
    const { status, body } = await apiRequest('/api/manager/time', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.teamPresenceRatePercent > 0, 'Expected teamPresenceRatePercent');
  });

  await runTest('MGR_CAPABILITY_001: Team skill matrix', 'MGR_CAPABILITY_001', async () => {
    const { status, body } = await apiRequest('/api/manager/capabilities', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data.entries), 'Expected entries array');
  });

  await runTest('MGR_TRAINING_001: Manager approval decision on training booking', 'MGR_TRAINING_001', async () => {
    const { status, body } = await apiRequest('/api/manager/training', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pernr': '00001002',
        'x-persona': 'MANAGER'
      },
      body: JSON.stringify({
        bookingId: 'tb001',
        decision: 'APPROVE',
        comments: 'Approved for professional development'
      })
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.decision === 'APPROVE', 'Expected decision APPROVE');
  });

  await runTest('MGR_TALENT_001: Team performance reviews & ratings', 'MGR_TALENT_001', async () => {
    const { status, body } = await apiRequest('/api/manager/talent', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data.appraisals), 'Expected appraisals array');
  });

  // --------------------------------------------------------------------------
  // Test Suite 9: Executive Analytics
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: Executive Analytics ---');
  await runTest('EXEC_KPI_001: Strategic HCM KPIs cockpit', 'EXEC_KPI_001', async () => {
    const { status, body } = await apiRequest('/api/analytics/kpis', {
      headers: { 'x-pernr': '00001003', 'x-persona': 'EXECUTIVE' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array of KPIs');
    assert(body.data.length >= 4, 'Expected >= 4 KPIs');
  });

  await runTest('EXEC_WORKFORCE_001: Workforce demographics & composition', 'EXEC_WORKFORCE_001', async () => {
    const { status, body } = await apiRequest('/api/analytics/workforce', {
      headers: { 'x-pernr': '00001003', 'x-persona': 'EXECUTIVE' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.totalEmployees >= 4, 'Expected >= 4 employees');
    assert(Array.isArray(body.data.byDepartment), 'Expected byDepartment array');
  });

  await runTest('EXEC_BUDGET_001: Compensation budget vs actual variance', 'EXEC_BUDGET_001', async () => {
    const { status, body } = await apiRequest('/api/analytics/budget', {
      headers: { 'x-pernr': '00001003', 'x-persona': 'EXECUTIVE' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.totalActualSpend > 0, 'Expected positive totalActualSpend');
    assert(Array.isArray(body.data.departments), 'Expected departments array');
  });

  // --------------------------------------------------------------------------
  // Test Suite 10: Workflow & Approval Engine
  // --------------------------------------------------------------------------
  console.log('\n--- Domain: Workflow Engine ---');
  await runTest('WF_INBOX_001: Unified pending approvals inbox', 'WF_INBOX_001', async () => {
    const { status, body } = await apiRequest('/api/workflow/inbox', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected tasks array');
  });

  await runTest('WF_ACTION_001: Approve pending workflow task and trigger state transition', 'WF_ACTION_001', async () => {
    // Look up a pending task
    const task = await queryOne<any>("SELECT id FROM workflow_task WHERE status = 'PENDING' LIMIT 1");
    if (task) {
      const { status, body } = await apiRequest('/api/workflow/action', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-pernr': '00001002',
          'x-persona': 'MANAGER'
        },
        body: JSON.stringify({
          taskId: task.id,
          decision: 'APPROVE',
          comments: 'Approved per company policy'
        })
      });
      assert(status === 200, `Expected 200, got ${status}`);
      assert(body.data.status === 'APPROVED', 'Expected status APPROVED');
    }
  });

  await runTest('WF_HISTORY_001: Audit trail of historical workflow instances', 'WF_HISTORY_001', async () => {
    const { status, body } = await apiRequest('/api/workflow/history', {
      headers: { 'x-pernr': '00001002', 'x-persona': 'MANAGER' }
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected array');
  });

  await runTest('WF_DELEGATE_001: Set managerial authority delegation', 'WF_DELEGATE_001', async () => {
    const { status, body } = await apiRequest('/api/workflow/delegation', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pernr': '00001002',
        'x-persona': 'MANAGER'
      },
      body: JSON.stringify({
        delegateId: 'u004',
        startDate: '2026-05-01',
        endDate: '2026-05-15',
        reason: 'Annual executive retreat'
      })
    });
    assert(status === 201, `Expected 201 Created, got ${status}`);
    assert(body.data.isActive === true, 'Expected isActive === true');
  });

  // --------------------------------------------------------------------------
  // Test Suite 11: Centralized Audit Logging Verification
  // --------------------------------------------------------------------------
  console.log('\n--- Centralized Audit Logging Verification ---');
  await runTest('AUDIT_VERIFICATION: Ensure all API mutations and reads are persisted in audit_log', 'AUDIT_001', async () => {
    // Wait briefly for finish events to flush to database
    await new Promise(r => setTimeout(r, 200));

    const auditCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM audit_log');
    assert((auditCount?.count || 0) > 0, `Expected audit records, found ${auditCount?.count}`);

    const sample = await queryOne<any>('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 1');
    assert(sample.actor_pernr !== undefined, 'Expected actor_pernr');
    assert(sample.service_code !== undefined, 'Expected service_code');
    assert(sample.status === 'SUCCESS' || sample.status === 'DENIED', 'Expected valid audit status');
  });

  // --------------------------------------------------------------------------
  // Summary & Teardown
  // --------------------------------------------------------------------------
  server.close();

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n================================================================');
  console.log(`TEST SUITE COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Test runner encountered fatal failure:', err);
  process.exit(1);
});
