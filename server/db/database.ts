// ============================================================================
// Enterprise HCM Experience Platform - Database Layer
// In-Memory SQLite powered by sql.js with complete relational schema & lineage
// ============================================================================

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL_ENGINE: SqlJsStatic | null = null;
let DB_INSTANCE: Database | null = null;
let isInitialized = false;

export async function getDb(): Promise<Database> {
  if (DB_INSTANCE && isInitialized) {
    return DB_INSTANCE;
  }

  if (!SQL_ENGINE) {
    SQL_ENGINE = await initSqlJs();
  }

  DB_INSTANCE = new SQL_ENGINE.Database();
  initializeSchema(DB_INSTANCE);
  isInitialized = true;
  return DB_INSTANCE;
}

export async function initDatabase(): Promise<Database> {
  return getDb();
}

function initializeSchema(db: Database): void {
  db.run(`
    PRAGMA foreign_keys = ON;

    -- ========================================================================
    -- 1. PA (Personnel Administration)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS person (
      id TEXT PRIMARY KEY,
      pernr TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      national_id TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      gender TEXT NOT NULL,
      marital_status TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0002',
      source_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL REFERENCES person(id),
      pernr TEXT UNIQUE NOT NULL,
      employment_status TEXT NOT NULL,
      hire_date TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0000',
      source_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee_org_assignment (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      org_unit_id TEXT NOT NULL,
      org_unit_name TEXT NOT NULL,
      position_id TEXT NOT NULL,
      position_title TEXT NOT NULL,
      job_code TEXT NOT NULL,
      job_title TEXT NOT NULL,
      cost_center TEXT NOT NULL,
      manager_id TEXT,
      manager_name TEXT,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0001',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_address (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      address_type TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0006',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_family (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      relation_type TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      national_id TEXT NOT NULL,
      is_dependent INTEGER NOT NULL DEFAULT 1,
      medical_insurance_enrolled INTEGER NOT NULL DEFAULT 1,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0021',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_education (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      degree_level TEXT NOT NULL,
      field_of_study TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      graduation_year INTEGER NOT NULL,
      gpa REAL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0022',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_health_profile (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      blood_type TEXT NOT NULL,
      last_checkup_date TEXT NOT NULL,
      fitness_status TEXT NOT NULL,
      medical_restrictions TEXT NOT NULL DEFAULT '[]',
      emergency_contact_name TEXT NOT NULL,
      emergency_contact_rel TEXT NOT NULL,
      emergency_contact_phone TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0028',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_contract (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      contract_number TEXT UNIQUE NOT NULL,
      contract_type TEXT NOT NULL,
      contract_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      probation_period_months INTEGER NOT NULL DEFAULT 3,
      notice_period_days INTEGER NOT NULL DEFAULT 30,
      working_hours_per_week REAL NOT NULL DEFAULT 44.0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      legal_covenants TEXT NOT NULL DEFAULT '[]',
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0016',
      source_key TEXT NOT NULL
    );

    -- ========================================================================
    -- 2. OM (Organizational Management)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS om_object (
      id TEXT PRIMARY KEY,
      obj_type TEXT NOT NULL, -- 'O'=Org Unit, 'S'=Position, 'C'=Job
      obj_id TEXT UNIQUE NOT NULL,
      short_text TEXT NOT NULL,
      long_text TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'HRP1000',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS om_relationship (
      id TEXT PRIMARY KEY,
      source_obj_type TEXT NOT NULL,
      source_obj_id TEXT NOT NULL,
      rel_type TEXT NOT NULL, -- 'B002'=Is line manager of, 'B003'=Belongs to org unit
      target_obj_type TEXT NOT NULL,
      target_obj_id TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'HRP1001',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS org_unit_detail (
      id TEXT PRIMARY KEY,
      org_unit_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      parent_org_unit_id TEXT,
      manager_position_id TEXT,
      headcount INTEGER NOT NULL DEFAULT 0,
      budget_amount REAL NOT NULL DEFAULT 0,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS position_detail (
      id TEXT PRIMARY KEY,
      position_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      org_unit_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      is_head INTEGER NOT NULL DEFAULT 0,
      occupant_employee_id TEXT,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_detail (
      id TEXT PRIMARY KEY,
      job_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      job_family TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL
    );

    -- ========================================================================
    -- 3. PT (Time Management)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS time_absence (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      absence_type TEXT NOT NULL,
      absence_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      absence_days REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'SUBMITTED',
      reason TEXT,
      workflow_instance_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA2001',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      attendance_date TEXT NOT NULL,
      scheduled_hours REAL NOT NULL DEFAULT 8.0,
      actual_hours REAL NOT NULL,
      overtime_hours REAL NOT NULL DEFAULT 0.0,
      check_in_time TEXT,
      check_out_time TEXT,
      status TEXT NOT NULL DEFAULT 'PRESENT',
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA2002',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_quota (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      quota_type TEXT NOT NULL,
      quota_name TEXT NOT NULL,
      entitlement_days REAL NOT NULL,
      used_days REAL NOT NULL DEFAULT 0.0,
      balance_days REAL NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA2006',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS overtime_claim (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      overtime_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      hours REAL NOT NULL,
      rate_multiplier REAL NOT NULL DEFAULT 1.4,
      overtime_type TEXT NOT NULL DEFAULT 'NORMAL_OVERTIME',
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      approved_by TEXT,
      approved_at TEXT,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA2005',
      source_key TEXT NOT NULL
    );

    -- ========================================================================
    -- 4. PY (Payroll)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS payroll_period (
      id TEXT PRIMARY KEY,
      period_code TEXT UNIQUE NOT NULL,
      period_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'CLOSED'
    );

    CREATE TABLE IF NOT EXISTS payroll_result (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      period_id TEXT NOT NULL REFERENCES payroll_period(id),
      gross_amount REAL NOT NULL,
      net_amount REAL NOT NULL,
      total_deductions REAL NOT NULL,
      tax_amount REAL NOT NULL,
      insurance_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'IRR',
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PCL2_CLUSTER_PAYROLL',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payroll_wage_type_result (
      id TEXT PRIMARY KEY,
      payroll_result_id TEXT NOT NULL REFERENCES payroll_result(id),
      wage_type_code TEXT NOT NULL,
      wage_type_name TEXT NOT NULL,
      wage_type_category TEXT NOT NULL, -- 'EARNING' or 'DEDUCTION'
      amount REAL NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PAYROLL_RT',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pay_wage_type_master (
      id TEXT PRIMARY KEY,
      wage_type_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      is_taxable INTEGER NOT NULL DEFAULT 1,
      is_deduction INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS employee_loan (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      loan_number TEXT UNIQUE NOT NULL,
      loan_type TEXT NOT NULL,
      principal_amount REAL NOT NULL,
      repayment_amount_per_period REAL NOT NULL,
      balance_amount REAL NOT NULL,
      interest_rate REAL NOT NULL DEFAULT 0.0,
      currency TEXT NOT NULL DEFAULT 'EUR',
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0045',
      source_key TEXT NOT NULL
    );

    -- ========================================================================
    -- 5. Training & Event Management
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS training_course_group (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS training_course (
      id TEXT PRIMARY KEY,
      course_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_hours REAL NOT NULL,
      delivery_method TEXT NOT NULL,
      category TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TEM_COURSE_TYPE',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_event (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES training_course(id),
      event_code TEXT UNIQUE NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      location TEXT NOT NULL,
      max_capacity INTEGER NOT NULL,
      booked_capacity INTEGER NOT NULL DEFAULT 0,
      instructor TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TEM_EVENT',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_booking (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      event_id TEXT NOT NULL REFERENCES training_event(id),
      booking_status TEXT NOT NULL DEFAULT 'CONFIRMED',
      booking_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_by TEXT,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TEM_BOOKING',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_attendance_result (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      booking_id TEXT REFERENCES training_booking(id),
      event_id TEXT REFERENCES training_event(id),
      course_title TEXT NOT NULL,
      completion_date TEXT NOT NULL,
      certificate_number TEXT UNIQUE NOT NULL,
      score REAL NOT NULL,
      grade TEXT NOT NULL,
      accreditation_body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PASSED',
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TEM_RESULTS',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_qualification (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      qualification_code TEXT NOT NULL,
      qualification_name TEXT NOT NULL,
      proficiency_level INTEGER NOT NULL,
      acquired_date TEXT NOT NULL,
      expiry_date TEXT,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'PA0024',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_qualification_gap (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      qualification_code TEXT NOT NULL,
      qualification_name TEXT NOT NULL,
      required_proficiency INTEGER NOT NULL,
      current_proficiency INTEGER NOT NULL,
      gap_score INTEGER NOT NULL,
      status TEXT NOT NULL
    );

    -- ========================================================================
    -- 6. Talent & Performance Management
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS performance_cycle (
      id TEXT PRIMARY KEY,
      cycle_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS employee_goal (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      cycle_id TEXT NOT NULL REFERENCES performance_cycle(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      weight INTEGER NOT NULL,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
      target_date TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TALENT_GOAL_EXTRACT',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS development_plan (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      goal_title TEXT NOT NULL,
      action_item TEXT NOT NULL,
      competency_name TEXT NOT NULL,
      target_completion_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TALENT_IDP_EXTRACT',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS career_aspiration (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      target_role TEXT NOT NULL,
      timeframe_years INTEGER NOT NULL,
      readiness_level TEXT NOT NULL,
      notes TEXT,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TALENT_CAREER_EXTRACT',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS performance_document (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      cycle_id TEXT NOT NULL REFERENCES performance_cycle(id),
      status TEXT NOT NULL DEFAULT 'SELF_ASSESSMENT',
      self_assessment_text TEXT,
      manager_assessment_text TEXT,
      overall_rating REAL NOT NULL DEFAULT 0,
      submitted_at TEXT,
      reviewed_at TEXT,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'HAP_DOCUMENT',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS competency_assessment (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      cycle_id TEXT REFERENCES performance_cycle(id),
      competency_code TEXT NOT NULL,
      competency_name TEXT NOT NULL,
      category TEXT NOT NULL,
      self_rating REAL NOT NULL,
      manager_rating REAL NOT NULL,
      target_level REAL NOT NULL,
      feedback TEXT,
      evaluation_date TEXT NOT NULL,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TALENT_APPRAISAL_DOC',
      source_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS succession_candidate (
      id TEXT PRIMARY KEY,
      position_id TEXT NOT NULL,
      candidate_employee_id TEXT NOT NULL REFERENCES employee(id),
      readiness_level TEXT NOT NULL,
      retention_risk TEXT NOT NULL,
      impact_of_loss TEXT NOT NULL,
      nominated_by TEXT,
      source_system TEXT NOT NULL DEFAULT 'SAP_S4HANA_PRD',
      source_object TEXT NOT NULL DEFAULT 'TALENT_SUCCESSION_EXTRACT',
      source_key TEXT NOT NULL
    );

    -- ========================================================================
    -- 7. Security, Workflow & Audit
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS app_user (
      id TEXT PRIMARY KEY,
      pernr TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      persona TEXT NOT NULL,
      employee_id TEXT NOT NULL REFERENCES employee(id),
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS role (
      id TEXT PRIMARY KEY,
      role_code TEXT UNIQUE NOT NULL,
      role_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permission (
      id TEXT PRIMARY KEY,
      permission_code TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_role (
      user_id TEXT NOT NULL REFERENCES app_user(id),
      role_id TEXT NOT NULL REFERENCES role(id),
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS role_permission (
      role_id TEXT NOT NULL REFERENCES role(id),
      permission_id TEXT NOT NULL REFERENCES permission(id),
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS workflow_instance (
      id TEXT PRIMARY KEY,
      service_code TEXT NOT NULL,
      requester_id TEXT NOT NULL REFERENCES employee(id),
      status TEXT NOT NULL DEFAULT 'PENDING',
      entity_name TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      current_step TEXT NOT NULL,
      title TEXT NOT NULL,
      request_payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workflow_task (
      id TEXT PRIMARY KEY,
      instance_id TEXT NOT NULL REFERENCES workflow_instance(id),
      approver_id TEXT,
      approver_role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      action_taken TEXT,
      action_date TEXT,
      comments TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workflow_delegation (
      id TEXT PRIMARY KEY,
      delegator_id TEXT NOT NULL,
      delegate_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      actor_user_id TEXT NOT NULL,
      actor_pernr TEXT NOT NULL,
      actor_persona TEXT NOT NULL,
      service_code TEXT NOT NULL,
      action TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      target_id TEXT,
      status TEXT NOT NULL,
      http_status INTEGER NOT NULL,
      ip_address TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      metadata TEXT
    );
  `);
}

// ----------------------------------------------------------------------------
// Database Query Execution Utilities
// ----------------------------------------------------------------------------

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    return results;
  } finally {
    stmt.free();
  }
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function run(sql: string, params: any[] = []): Promise<{ changes: number }> {
  const db = await getDb();
  db.run(sql, params);
  return { changes: db.getRowsModified() };
}

export async function exec(sql: string): Promise<void> {
  const db = await getDb();
  db.run(sql);
}
