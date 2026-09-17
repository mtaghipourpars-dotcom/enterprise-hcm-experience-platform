CREATE TABLE IF NOT EXISTS hcm_core.person (
  id uuid PRIMARY KEY,
  pernr varchar(8),
  first_name text,
  last_name text,
  birth_date date,
  gender text,
  marital_status text,
  national_id text,
  source_system text NOT NULL,
  source_object text NOT NULL,
  source_key text NOT NULL,
  source_valid_from date,
  source_valid_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_sync_at timestamptz,
  data_status text NOT NULL DEFAULT 'VALID'
);

CREATE TABLE IF NOT EXISTS hcm_core.employee (
  id uuid PRIMARY KEY,
  person_id uuid NOT NULL REFERENCES hcm_core.person(id),
  pernr varchar(8) NOT NULL,
  employment_status text,
  hire_date date,
  termination_date date,
  company_code text,
  personnel_area text,
  personnel_subarea text,
  employee_group text,
  employee_subgroup text,
  source_system text NOT NULL,
  source_object text NOT NULL,
  source_key text NOT NULL,
  source_valid_from date,
  source_valid_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_sync_at timestamptz,
  data_status text NOT NULL DEFAULT 'VALID',
  UNIQUE(source_system, source_key, source_valid_from, source_valid_to)
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_org_assignment (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  company_code text,
  personnel_area text,
  personnel_subarea text,
  employee_group text,
  employee_subgroup text,
  cost_center text,
  position_id text,
  job_id text,
  org_unit_id text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'PA0001',
  source_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_address (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  address_type text,
  street text,
  city text,
  postal_code text,
  country text,
  phone text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'PA0006',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_family (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  relationship_type text,
  first_name text,
  last_name text,
  birth_date date,
  dependency_status text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'PA0021',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_education (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  education_level text,
  field_of_study text,
  institution text,
  completion_date date,
  valid_from date,
  valid_to date,
  source_object text NOT NULL DEFAULT 'PA0022',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_qualification (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  qualification_code text,
  qualification_name text,
  level text,
  obtained_date date,
  expiry_date date,
  source_object text,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.om_object (
  id uuid PRIMARY KEY,
  otype varchar(2) NOT NULL,
  objid varchar(8) NOT NULL,
  short_name text,
  long_name text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'HRP1000',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.om_relationship (
  id uuid PRIMARY KEY,
  source_otype varchar(2) NOT NULL,
  source_objid varchar(8) NOT NULL,
  rsign varchar(1),
  relat varchar(3),
  target_otype varchar(2),
  target_objid varchar(8),
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'HRP1001',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_work_schedule (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  schedule_code text,
  schedule_name text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'PA0007',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.time_absence (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  absence_type text,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  amount numeric(12,2),
  unit text,
  source_object text NOT NULL DEFAULT 'PA2001',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.time_attendance (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  attendance_type text,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  hours numeric(12,2),
  source_object text NOT NULL DEFAULT 'PA2002',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.time_event (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  event_timestamp timestamptz NOT NULL,
  event_type text,
  terminal_id text,
  source_object text NOT NULL,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.time_quota (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  quota_type text,
  entitlement numeric(12,2),
  consumed numeric(12,2),
  remaining numeric(12,2),
  unit text,
  valid_from date,
  valid_to date,
  source_object text NOT NULL DEFAULT 'PA2006',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.pay_basic (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  pay_scale_area text,
  pay_scale_group text,
  pay_scale_level text,
  source_object text NOT NULL DEFAULT 'PA0008',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.pay_wage_type_master (
  id uuid PRIMARY KEY,
  wage_type text NOT NULL,
  valid_from date,
  valid_to date,
  description_fa text,
  description_en text,
  source_system text,
  source_object text,
  source_key text
);

CREATE TABLE IF NOT EXISTS hcm_core.pay_recurring (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  wage_type text NOT NULL,
  amount numeric(18,2),
  currency text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'PA0014',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.pay_additional (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  wage_type text NOT NULL,
  amount numeric(18,2),
  currency text,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  source_object text NOT NULL DEFAULT 'PA0015',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_loan (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  loan_type text,
  contract_number text,
  principal_amount numeric(18,2),
  balance_amount numeric(18,2),
  currency text,
  valid_from date,
  valid_to date,
  source_object text NOT NULL DEFAULT 'PA0045',
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.payroll_period (
  id uuid PRIMARY KEY,
  fiscal_year integer NOT NULL,
  period_number integer NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.payroll_result (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  payroll_period_id uuid NOT NULL REFERENCES hcm_core.payroll_period(id),
  gross_amount numeric(18,2),
  deduction_amount numeric(18,2),
  net_amount numeric(18,2),
  currency text,
  source_object text NOT NULL,
  source_key text NOT NULL,
  source_cluster text,
  sync_run_id uuid
);

CREATE TABLE IF NOT EXISTS hcm_core.payroll_wage_type_result (
  id uuid PRIMARY KEY,
  payroll_result_id uuid NOT NULL REFERENCES hcm_core.payroll_result(id),
  wage_type text NOT NULL,
  amount numeric(18,2),
  currency text,
  category text,
  source_object text NOT NULL,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.training_course (
  id uuid PRIMARY KEY,
  source_object text,
  source_key text NOT NULL,
  course_code text,
  title text,
  description text,
  duration_hours numeric(8,2),
  status text
);

CREATE TABLE IF NOT EXISTS hcm_core.training_event (
  id uuid PRIMARY KEY,
  course_id uuid REFERENCES hcm_core.training_course(id),
  source_object text,
  source_key text NOT NULL,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  capacity integer,
  status text
);

CREATE TABLE IF NOT EXISTS hcm_core.training_booking (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  training_event_id uuid NOT NULL REFERENCES hcm_core.training_event(id),
  booking_status text,
  approval_status text,
  source_object text,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.employee_goal (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  goal_code text,
  title text,
  description text,
  weight numeric(8,2),
  status text,
  source_object text,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.performance_document (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  cycle_code text,
  document_status text,
  score numeric(8,2),
  source_object text,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.development_plan (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  action_code text,
  title text,
  target_date date,
  status text,
  source_object text,
  source_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS hcm_core.succession_candidate (
  id uuid PRIMARY KEY,
  position_source_key text,
  employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  readiness_level text,
  source_object text,
  source_key text NOT NULL
);
