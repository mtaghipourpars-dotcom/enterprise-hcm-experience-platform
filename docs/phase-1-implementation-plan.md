# Phase 1 Implementation Plan: Database Foundation & SAP-Aligned Core Architecture

## Executive Summary
This implementation plan establishes the foundational data architecture for the **Enterprise HCM Experience Platform**. Per Phase 1 requirements, this phase strictly implements the data layer without building user interfaces or APIs.

The architecture enforces a strict two-tier data foundation:
1. **SAP-Aligned BASE Layer (`sap_raw`)**: Acts as the immutable enterprise landing contract and audit mirror of SAP S/4HANA HCM infotypes, OM cluster objects, and payroll/event extracts, preserving exact SAP table names, field keys, and effective-dating semantics.
2. **HCM Core Layer (`hcm_core`)**: The normalized, highly relational business model supporting cross-domain HCM business operations, retaining explicit lineage (`source_system`, `source_object`, `source_key`, `source_version`, `source_valid_from`, `source_valid_to`) to the SAP base.

---

## Required Domains & Scope Coverage

| Domain | SAP Base Tables (`sap_raw`) | Normalized Entities (`hcm_core` / Domain Schemas) |
|---|---|---|
| **PA (Personnel Administration)** | `pa0000`, `pa0001`, `pa0002`, `pa0006`, `pa0021`, `pa0022`, `pa0024`, `pa0041`, `pa0016`, `pa0028` | `person`, `employee`, `employment_status_history`, `employee_org_assignment`, `employee_address`, `employee_family`, `employee_education`, `employee_qualification`, `employee_date_specification`, `employee_contract`, `employee_health_profile` |
| **OM (Organizational Management)** | `hrp1000`, `hrp1001`, `hrp1002` | `om_object`, `om_relationship`, `org_unit_detail`, `position_detail`, `job_detail` |
| **PT (Time Management)** | `pa0007`, `pa2001`, `pa2002`, `pa2005`, `pa2006`, `pa2007`, `teven` | `employee_work_schedule`, `time_absence`, `time_attendance`, `time_event`, `time_quota`, `time_quota_deduction`, `monthly_time_summary` |
| **PY (Payroll)** | `pa0008`, `pa0014`, `pa0015`, `pa0045`, `py_cluster_result`, `py_cluster_rt`, `py_cluster_wagetype_trace` | `pay_basic`, `pay_wage_type_master`, `pay_recurring`, `pay_additional`, `employee_loan`, `payroll_period`, `payroll_result`, `payroll_wage_type_result`, `payroll_calculation_trace` |
| **Training & Event Management** | `tem_course_type`, `tem_event`, `tem_booking`, `tem_resource` | `training_course_group`, `training_course`, `training_event`, `training_booking`, `training_attendance_result`, `employee_qualification_gap` |
| **Talent & Performance Management** | `talent_appraisal_template`, `talent_appraisal_doc`, `talent_goal_extract`, `talent_succession_extract` | `performance_cycle`, `employee_goal`, `performance_document`, `competency_master`, `competency_assessment`, `development_plan`, `career_aspiration`, `succession_candidate` |
| **Security** | - | `hcm_security.app_user`, `hcm_security.role`, `hcm_security.permission`, `hcm_security.role_permission`, `hcm_security.user_role`, `hcm_security.structural_authorization_profile`, `hcm_security.user_structural_auth`, `hcm_security.data_access_policy` |
| **Workflow** | - | `hcm_workflow.workflow_definition`, `hcm_workflow.workflow_instance`, `hcm_workflow.workflow_task`, `hcm_workflow.workflow_audit_history` |
| **Service Catalog** | - | `hcm_service.service_definition`, `hcm_service.service_persona_assignment`, `hcm_service.service_field_catalog` |
| **Integration** | - | `hcm_integration.source_system_registry`, `hcm_integration.source_mapping_registry`, `hcm_integration.sync_job`, `hcm_integration.sync_run`, `hcm_integration.sync_checkpoint`, `hcm_integration.sync_error_log`, `hcm_integration.data_lineage_trace` |
| **Audit & Governance** | - | `hcm_audit.audit_log` |

---

## 10 Implementation Pillars

### 1. Database Schema
PostgreSQL schemas isolated by architectural responsibility:
- `sap_raw`: SAP S/4HANA HCM landing and staging contract.
- `hcm_core`: Canonical normalized HCM business entities.
- `hcm_service`: Master Service Catalog, metadata, and persona routing.
- `hcm_security`: Identity, role-based access control (RBAC), and structural authorizations.
- `hcm_workflow`: Multi-step approval state machines and task inboxes.
- `hcm_integration`: Data sync orchestration, delta checkpoints, and mapping registries.
- `hcm_audit`: Change data capture and audit trails.
- `hcm_analytics`: Authorized materialized metrics and aggregates.

### 2. SAP-Aligned BASE Layer (`sap_raw`)
Preserves exact SAP column names, uppercase types, and infotype key structures:
- Primary key composite structure matching SAP DDIC (`MANDT`, `PERNR`, `SUBTY`, `OBJPS`, `SPRPS`, `BEGDA`, `ENDDA`).
- Standard ingestion wrapper columns on every table:
  `_source_system`, `_source_client`, `_source_table`, `_source_key`, `_extract_ts`, `_load_ts`, `_record_hash`, `_sync_run_id`, `_valid_record`, `_payload`.
- Release-specific or cluster data (Payroll RT, TEM bookings, Talent forms) uses structured raw payload models with verification flags rather than fabricated transparent tables.

### 3. HCM Core Layer (`hcm_core`)
Normalized relational model with clean domain abstractions:
- Every table has a UUID primary key `id`.
- Granular domain models for PA, OM, PT, PY, Training, and Talent.

### 4. Relationships & Referential Integrity
- Complete Foreign Key constraints (`REFERENCES`) linking `person` -> `employee` -> org assignments, time absences, time quotas, payroll results, training bookings, performance appraisals, workflow instances, and tasks.
- Cascade and restrict semantics appropriately defined to prevent dangling child records.

### 5. Constraints
- **Range & Value Integrity**:
  - Date ordering: `CHECK (valid_from <= valid_to)` on all temporal tables.
  - Positive numeric quantities: `CHECK (amount >= 0)`, `CHECK (hours >= 0)`, `CHECK (entitlement >= 0)`.
  - Percentage bounds: `CHECK (weight >= 0 AND weight <= 100)`, `CHECK (empct >= 0 AND empct <= 100)`.
  - Status enumerations: Controlled vocabulary checks across employment, workflow, booking, and appraisal statuses.
- **Unique Constraints**: Unique composite constraints on natural keys and temporal slices.

### 6. Indexes & Performance
- B-Tree indexes on every foreign key column (`employee_id`, `person_id`, `course_id`, `period_id`).
- Composite temporal indexes for effective dating point-in-time and range queries: `(employee_id, valid_from, valid_to)`.
- Identity lookup indexes: `(source_system, source_object, source_key)`.
- Status and operational indexes for workflow task queues and active records.

### 7. Effective Dating
- Unified date range columns: `valid_from DATE NOT NULL` and `valid_to DATE NOT NULL`.
- Support for SAP high-date standard (`9999-12-31`) and low-date standard (`1800-01-01`).
- Temporal point-in-time querying pattern (`WHERE target_date BETWEEN valid_from AND valid_to`).

### 8. Audit Fields & Lineage
- Core record audit columns on all normalized tables:
  `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `created_by TEXT`,
  `updated_by TEXT`,
  `data_status TEXT NOT NULL DEFAULT 'VALID'`,
  `is_deleted BOOLEAN NOT NULL DEFAULT false`.
- Central `hcm_audit.audit_log` tracking table-level mutations and lineage.

### 9. Source-System Fields
- Standard source attribution on all normalized entities:
  `source_system TEXT NOT NULL`,
  `source_object TEXT NOT NULL`,
  `source_key TEXT NOT NULL`,
  `source_version TEXT`,
  `source_valid_from DATE`,
  `source_valid_to DATE`.

### 10. Synchronization Fields & Operations
- Synchronization tracking columns:
  `last_sync_at TIMESTAMPTZ`,
  `sync_status TEXT NOT NULL DEFAULT 'SYNCED'`,
  `sync_run_id UUID`.
- Full operational tables in `hcm_integration`: `source_system_registry`, `source_mapping_registry`, `sync_job`, `sync_run`, `sync_checkpoint`, `sync_error_log`, `data_lineage_trace`.

---

## Verification & Validation Suite
1. **Schema & DDL Syntax Validation**: Comprehensive parser testing all DDL definitions across all schemas.
2. **Domain Coverage Verification**: Verification that all 10 required domains are represented.
3. **Pillars Check**: Structural validation confirming all 10 pillars (effective dating, audit fields, source-system fields, sync fields, relationships, constraints, indexes).
4. **Relational & Constraint Execution Test**: Live DDL and DML execution test running DDL creation, referential integrity insertion, constraint violation handling, and temporal point-in-time queries.
5. **Traceability Matrix Validation**: Full population and validation of `assets/templates/traceability-template.csv` matching all 29 services in `service-catalog.master.json`.
6. **Platform Validation Scripts**: Successful pass of `scripts/validate_skill.py`, `scripts/validate_catalog.py`, `scripts/validate_traceability.py`, and `scripts/validate_database.py`.
