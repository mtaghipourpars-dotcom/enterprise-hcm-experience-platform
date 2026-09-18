-- ============================================================================
-- 04_security_workflow_service.sql
-- Enterprise HCM Experience Platform
-- Domains: Security (hcm_security), Workflow (hcm_workflow), Service Catalog (hcm_service)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Security (hcm_security)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hcm_security.app_user (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  employee_id uuid REFERENCES hcm_core.employee(id),
  pernr varchar(8),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by text DEFAULT 'SYSTEM',
  updated_by text DEFAULT 'SYSTEM'
);

CREATE TABLE IF NOT EXISTS hcm_security.role (
  id uuid PRIMARY KEY,
  role_code text NOT NULL UNIQUE CHECK (role_code IN ('EMPLOYEE', 'MANAGER', 'EXECUTIVE', 'HR_ADMIN', 'SYSTEM_ADMIN')),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_security.permission (
  id uuid PRIMARY KEY,
  permission_code text NOT NULL UNIQUE,
  domain text NOT NULL CHECK (domain IN ('PA', 'OM', 'PT', 'PY', 'TRAINING', 'TALENT', 'WORKFLOW', 'SECURITY', 'INTEGRATION', 'ANALYTICS')),
  action text NOT NULL CHECK (action IN ('READ', 'WRITE', 'APPROVE', 'ADMIN', 'EXECUTE')),
  description text,
  sensitivity_level text NOT NULL DEFAULT 'STANDARD' CHECK (sensitivity_level IN ('PUBLIC', 'STANDARD', 'CONFIDENTIAL', 'STRICTLY_CONFIDENTIAL')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_security.role_permission (
  id uuid PRIMARY KEY,
  role_id uuid NOT NULL REFERENCES hcm_security.role(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES hcm_security.permission(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS hcm_security.user_role (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES hcm_security.app_user(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES hcm_security.role(id) ON DELETE CASCADE,
  valid_from date NOT NULL DEFAULT '1800-01-01',
  valid_to date NOT NULL DEFAULT '9999-12-31',
  assigned_by text DEFAULT 'SYSTEM',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_role_dates CHECK (valid_from <= valid_to),
  CONSTRAINT uq_user_role_window UNIQUE (user_id, role_id, valid_from, valid_to)
);

CREATE TABLE IF NOT EXISTS hcm_security.structural_authorization_profile (
  id uuid PRIMARY KEY,
  profile_code text NOT NULL UNIQUE,
  name text NOT NULL,
  root_org_unit_id varchar(8) NOT NULL,
  max_depth integer DEFAULT 99 CHECK (max_depth >= 0),
  evaluation_path text NOT NULL DEFAULT 'O-S-P',
  valid_from date NOT NULL DEFAULT '1800-01-01',
  valid_to date NOT NULL DEFAULT '9999-12-31',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_struct_prof_dates CHECK (valid_from <= valid_to)
);

CREATE TABLE IF NOT EXISTS hcm_security.user_structural_auth (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES hcm_security.app_user(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES hcm_security.structural_authorization_profile(id) ON DELETE CASCADE,
  valid_from date NOT NULL DEFAULT '1800-01-01',
  valid_to date NOT NULL DEFAULT '9999-12-31',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_struct_dates CHECK (valid_from <= valid_to),
  CONSTRAINT uq_user_struct_window UNIQUE (user_id, profile_id, valid_from, valid_to)
);

CREATE TABLE IF NOT EXISTS hcm_security.data_access_policy (
  id uuid PRIMARY KEY,
  policy_code text NOT NULL UNIQUE,
  domain text NOT NULL,
  scope_type text NOT NULL CHECK (scope_type IN ('SELF_ONLY', 'DIRECT_REPORTS', 'ORG_TREE', 'COMPANY_CODE', 'ALL')),
  sensitivity_ceiling text NOT NULL DEFAULT 'CONFIDENTIAL' CHECK (sensitivity_ceiling IN ('PUBLIC', 'STANDARD', 'CONFIDENTIAL', 'STRICTLY_CONFIDENTIAL')),
  rls_expression text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Workflow (hcm_workflow)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hcm_workflow.workflow_definition (
  id uuid PRIMARY KEY,
  workflow_code text NOT NULL UNIQUE,
  name text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('PA', 'OM', 'PT', 'PY', 'TRAINING', 'TALENT', 'SECURITY', 'GENERAL')),
  service_code text,
  approval_levels integer NOT NULL DEFAULT 1 CHECK (approval_levels > 0),
  sla_hours integer DEFAULT 48 CHECK (sla_hours > 0),
  auto_escalate boolean NOT NULL DEFAULT false,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_workflow.workflow_instance (
  id uuid PRIMARY KEY,
  workflow_definition_id uuid NOT NULL REFERENCES hcm_workflow.workflow_definition(id),
  business_entity_type text NOT NULL,
  business_entity_id uuid NOT NULL,
  requester_employee_id uuid NOT NULL REFERENCES hcm_core.employee(id),
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED')),
  current_step integer NOT NULL DEFAULT 1 CHECK (current_step > 0),
  submission_date timestamptz NOT NULL DEFAULT now(),
  completed_date timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_workflow.workflow_task (
  id uuid PRIMARY KEY,
  workflow_instance_id uuid NOT NULL REFERENCES hcm_workflow.workflow_instance(id) ON DELETE CASCADE,
  step_number integer NOT NULL CHECK (step_number > 0),
  assigned_role text NOT NULL,
  assigned_user_id uuid REFERENCES hcm_security.app_user(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DELEGATED', 'EXPIRED')),
  decision_date timestamptz,
  comments text,
  sla_deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_workflow.workflow_audit_history (
  id uuid PRIMARY KEY,
  workflow_instance_id uuid NOT NULL REFERENCES hcm_workflow.workflow_instance(id) ON DELETE CASCADE,
  task_id uuid REFERENCES hcm_workflow.workflow_task(id),
  actor_user_id uuid REFERENCES hcm_security.app_user(id),
  action text NOT NULL CHECK (action IN ('SUBMIT', 'APPROVE', 'REJECT', 'DELEGATE', 'CANCEL', 'REASSIGN', 'COMMENT')),
  previous_status text,
  new_status text,
  action_timestamp timestamptz NOT NULL DEFAULT now(),
  comments text
);

-- ----------------------------------------------------------------------------
-- Service Catalog (hcm_service)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hcm_service.service_definition (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name_key_fa text NOT NULL,
  name_key_en text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('PA', 'OM', 'PT', 'PY', 'TRAINING', 'TALENT', 'WORKFLOW', 'ANALYTICS', 'SECURITY', 'INTEGRATION')),
  subdomain text,
  service_type text NOT NULL CHECK (service_type IN ('PROFILE', 'SEARCH', 'WORKFLOW', 'REPORT', 'ANALYTICS', 'APPROVAL', 'CONFIGURATION')),
  read_write_mode text NOT NULL DEFAULT 'READ' CHECK (read_write_mode IN ('READ', 'WRITE', 'READ_WRITE')),
  sensitivity text NOT NULL DEFAULT 'STANDARD' CHECK (sensitivity IN ('PUBLIC', 'STANDARD', 'CONFIDENTIAL', 'STRICTLY_CONFIDENTIAL')),
  ui_component text NOT NULL,
  api_endpoint text NOT NULL,
  core_entities text[] NOT NULL DEFAULT '{}',
  sap_sources text[] NOT NULL DEFAULT '{}',
  permission text NOT NULL,
  workflow_definition text,
  active_flag boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hcm_service.service_persona_assignment (
  id uuid PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES hcm_service.service_definition(id) ON DELETE CASCADE,
  persona text NOT NULL CHECK (persona IN ('EMPLOYEE', 'MANAGER', 'EXECUTIVE', 'HR_ADMIN', 'SYSTEM_ADMIN')),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_service_persona UNIQUE (service_id, persona)
);

CREATE TABLE IF NOT EXISTS hcm_service.service_field_catalog (
  id uuid PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES hcm_service.service_definition(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_label_en text NOT NULL,
  field_label_fa text,
  data_type text NOT NULL DEFAULT 'TEXT',
  sensitivity_level text NOT NULL DEFAULT 'STANDARD' CHECK (sensitivity_level IN ('PUBLIC', 'STANDARD', 'CONFIDENTIAL', 'STRICTLY_CONFIDENTIAL')),
  is_pii boolean NOT NULL DEFAULT false,
  is_filterable boolean NOT NULL DEFAULT true,
  is_sortable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_service_field UNIQUE (service_id, field_name)
);
