-- ============================================================================
-- 05_integration_audit.sql
-- Enterprise HCM Experience Platform
-- Domains: Integration (hcm_integration), Audit (hcm_audit), Analytics (hcm_analytics)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Integration (hcm_integration)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hcm_integration.source_system_registry (
  id uuid PRIMARY KEY,
  system_id text NOT NULL UNIQUE,
  system_name text NOT NULL,
  provider_type text NOT NULL CHECK (provider_type IN ('SAP_ODATA', 'SAP_RFC', 'SAP_BAPI', 'SAP_CPI', 'DATABASE', 'FLAT_FILE')),
  host_endpoint text,
  client_id text,
  system_number text,
  is_active boolean NOT NULL DEFAULT true,
  last_heartbeat_at timestamptz,
  connection_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_integration.source_mapping_registry (
  id uuid PRIMARY KEY,
  target_schema text NOT NULL,
  target_table text NOT NULL,
  target_field text NOT NULL,
  source_system text NOT NULL DEFAULT 'SAP_S4HANA',
  source_object text NOT NULL,
  source_field text NOT NULL,
  extraction_mode text NOT NULL DEFAULT 'DELTA' CHECK (extraction_mode IN ('FULL', 'DELTA', 'SNAPSHOT')),
  key_strategy text NOT NULL DEFAULT 'NATURAL_KEY',
  change_detection text NOT NULL DEFAULT 'RECORD_HASH_OR_TIMESTAMP',
  deletion_semantics text NOT NULL DEFAULT 'SOFT_DELETE' CHECK (deletion_semantics IN ('SOFT_DELETE', 'HARD_DELETE', 'DELIMIT')),
  effective_dating_behavior text NOT NULL DEFAULT 'SPLIT_AND_DELIMIT',
  verification_required boolean NOT NULL DEFAULT false,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_target_source_map UNIQUE (target_schema, target_table, target_field, source_system, source_object, source_field)
);

CREATE TABLE IF NOT EXISTS hcm_integration.sync_job (
  id uuid PRIMARY KEY,
  job_code text NOT NULL UNIQUE,
  domain text NOT NULL CHECK (domain IN ('PA', 'OM', 'PT', 'PY', 'TRAINING', 'TALENT', 'SECURITY', 'ALL')),
  source_system text NOT NULL DEFAULT 'SAP_S4HANA',
  source_object text NOT NULL,
  target_schema text NOT NULL,
  target_table text NOT NULL,
  cron_expression text NOT NULL DEFAULT '0 2 * * *',
  batch_size integer NOT NULL DEFAULT 500 CHECK (batch_size > 0),
  extraction_mode text NOT NULL DEFAULT 'DELTA' CHECK (extraction_mode IN ('FULL', 'DELTA', 'SNAPSHOT')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_integration.sync_run (
  id uuid PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES hcm_integration.sync_job(id) ON DELETE CASCADE,
  sync_run_id uuid NOT NULL UNIQUE,
  trigger_type text NOT NULL DEFAULT 'SCHEDULED' CHECK (trigger_type IN ('SCHEDULED', 'MANUAL', 'WEBHOOK', 'RETRY')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  status text NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL', 'ABORTED')),
  records_extracted integer NOT NULL DEFAULT 0 CHECK (records_extracted >= 0),
  records_inserted integer NOT NULL DEFAULT 0 CHECK (records_inserted >= 0),
  records_updated integer NOT NULL DEFAULT 0 CHECK (records_updated >= 0),
  records_failed integer NOT NULL DEFAULT 0 CHECK (records_failed >= 0),
  error_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_integration.sync_checkpoint (
  id uuid PRIMARY KEY,
  job_id uuid NOT NULL UNIQUE REFERENCES hcm_integration.sync_job(id) ON DELETE CASCADE,
  last_extract_key text,
  last_extract_ts timestamptz,
  delta_token text,
  checkpoint_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_integration.sync_error_log (
  id uuid PRIMARY KEY,
  sync_run_id uuid REFERENCES hcm_integration.sync_run(sync_run_id) ON DELETE CASCADE,
  source_object text NOT NULL,
  source_key text NOT NULL,
  error_category text NOT NULL CHECK (error_category IN ('VALIDATION_ERROR', 'TRANSFORMATION_ERROR', 'CONSTRAINT_VIOLATION', 'NETWORK_TIMEOUT', 'AUTH_ERROR')),
  error_message text NOT NULL,
  error_stack text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  resolved_flag boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_integration.data_lineage_trace (
  id uuid PRIMARY KEY,
  target_schema text NOT NULL,
  target_table text NOT NULL,
  target_id uuid NOT NULL,
  source_system text NOT NULL,
  source_object text NOT NULL,
  source_key text NOT NULL,
  sync_run_id uuid,
  verified_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_lineage_trace UNIQUE (target_schema, target_table, target_id, source_system, source_object, source_key)
);

-- ----------------------------------------------------------------------------
-- Audit (hcm_audit)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hcm_audit.audit_log (
  id uuid PRIMARY KEY,
  schema_name text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'VIEW_CONFIDENTIAL')),
  actor_id text DEFAULT 'SYSTEM',
  actor_username text,
  ip_address text,
  changed_columns text[],
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Analytics (hcm_analytics) - Authorized Views
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW hcm_analytics.vw_team_headcount_summary AS
SELECT
  oa.org_unit_id,
  oa.company_code,
  oa.personnel_area,
  COUNT(DISTINCT e.id) AS total_employees,
  COUNT(DISTINCT CASE WHEN e.employment_status = 'ACTIVE' THEN e.id END) AS active_employees,
  COUNT(DISTINCT CASE WHEN e.employment_status = 'ON_LEAVE' THEN e.id END) AS on_leave_employees
FROM hcm_core.employee e
JOIN hcm_core.employee_org_assignment oa ON e.id = oa.employee_id
WHERE CURRENT_DATE BETWEEN oa.valid_from AND oa.valid_to
  AND e.is_deleted = false
GROUP BY oa.org_unit_id, oa.company_code, oa.personnel_area;

CREATE OR REPLACE VIEW hcm_analytics.vw_payroll_cost_summary AS
SELECT
  p.fiscal_year,
  p.period_number,
  e.company_code,
  e.personnel_area,
  COUNT(DISTINCT pr.id) AS payroll_records_count,
  SUM(pr.gross_amount) AS total_gross,
  SUM(pr.net_amount) AS total_net,
  SUM(pr.total_deductions) AS total_deductions,
  SUM(pr.employer_cost) AS total_employer_cost,
  pr.currency
FROM hcm_core.payroll_result pr
JOIN hcm_core.payroll_period p ON pr.payroll_period_id = p.id
JOIN hcm_core.employee e ON pr.employee_id = e.id
WHERE pr.is_deleted = false
GROUP BY p.fiscal_year, p.period_number, e.company_code, e.personnel_area, pr.currency;

CREATE OR REPLACE VIEW hcm_analytics.vw_training_completion_metrics AS
SELECT
  c.id AS course_id,
  c.course_code,
  c.title,
  COUNT(b.id) AS total_bookings,
  COUNT(CASE WHEN r.completion_status = 'COMPLETED' OR r.completion_status = 'PASSED' THEN 1 END) AS completions,
  AVG(r.score) AS average_score
FROM hcm_core.training_course c
JOIN hcm_core.training_event e ON c.id = e.course_id
JOIN hcm_core.training_booking b ON e.id = b.training_event_id
LEFT JOIN hcm_core.training_attendance_result r ON b.id = r.booking_id
WHERE c.is_deleted = false
GROUP BY c.id, c.course_code, c.title;
