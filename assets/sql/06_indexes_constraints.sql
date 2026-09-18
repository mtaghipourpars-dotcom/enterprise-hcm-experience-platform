-- ============================================================================
-- 06_indexes_constraints.sql
-- Enterprise HCM Experience Platform: Indexes and Performance Optimization
-- Covers: Foreign Keys, Effective Dating, Lineage, Full-Text & Fast Lookups
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Indexes for sap_raw (Landing & Staging Performance)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_raw_pa0000_pernr ON sap_raw.pa0000 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0000_dates ON sap_raw.pa0000 (begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa0000_source ON sap_raw.pa0000 (_source_system, _source_key);

CREATE INDEX IF NOT EXISTS idx_raw_pa0001_pernr ON sap_raw.pa0001 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0001_dates ON sap_raw.pa0001 (begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa0001_source ON sap_raw.pa0001 (_source_system, _source_key);

CREATE INDEX IF NOT EXISTS idx_raw_pa0002_pernr ON sap_raw.pa0002 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0002_dates ON sap_raw.pa0002 (begda, endda);

CREATE INDEX IF NOT EXISTS idx_raw_pa0006_pernr ON sap_raw.pa0006 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0021_pernr ON sap_raw.pa0021 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0022_pernr ON sap_raw.pa0022 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0024_pernr ON sap_raw.pa0024 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0041_pernr ON sap_raw.pa0041 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0016_pernr ON sap_raw.pa0016 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa0028_pernr ON sap_raw.pa0028 (mandt, pernr);

CREATE INDEX IF NOT EXISTS idx_raw_pa0007_pernr ON sap_raw.pa0007 (mandt, pernr);
CREATE INDEX IF NOT EXISTS idx_raw_pa2001_pernr ON sap_raw.pa2001 (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa2002_pernr ON sap_raw.pa2002 (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa2006_pernr ON sap_raw.pa2006 (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_teven_pernr ON sap_raw.teven (mandt, pernr, ldate);

CREATE INDEX IF NOT EXISTS idx_raw_pa0008_pernr ON sap_raw.pa0008 (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa0014_pernr ON sap_raw.pa0014 (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa0015_pernr ON sap_raw.pa0015 (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_pa0045_pernr ON sap_raw.pa0045 (mandt, pernr, begda, endda);

CREATE INDEX IF NOT EXISTS idx_raw_py_res_pernr ON sap_raw.py_cluster_result (mandt, pernr, fpper);
CREATE INDEX IF NOT EXISTS idx_raw_py_rt_seq ON sap_raw.py_cluster_rt (mandt, pernr, seqnr);

CREATE INDEX IF NOT EXISTS idx_raw_hrp1000_obj ON sap_raw.hrp1000 (mandt, otype, objid, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_hrp1001_rel ON sap_raw.hrp1001 (mandt, otype, objid, rsign, relat, sclas, sobid);
CREATE INDEX IF NOT EXISTS idx_raw_hrp1002_obj ON sap_raw.hrp1002 (mandt, otype, objid);

CREATE INDEX IF NOT EXISTS idx_raw_tem_event_obj ON sap_raw.tem_event (mandt, objid, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_tem_booking ON sap_raw.tem_booking (mandt, eveid, parid);

CREATE INDEX IF NOT EXISTS idx_raw_talent_doc_pernr ON sap_raw.talent_appraisal_doc (mandt, pernr, begda, endda);
CREATE INDEX IF NOT EXISTS idx_raw_talent_goal_pernr ON sap_raw.talent_goal_extract (mandt, pernr, cycle_id);
CREATE INDEX IF NOT EXISTS idx_raw_talent_succ_obj ON sap_raw.talent_succession_extract (mandt, position_objid, candidate_pernr);

-- ----------------------------------------------------------------------------
-- Indexes for hcm_core (PA Domain)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_person_pernr ON hcm_core.person (pernr);
CREATE INDEX IF NOT EXISTS idx_person_source ON hcm_core.person (source_system, source_object, source_key);
CREATE INDEX IF NOT EXISTS idx_person_national_id ON hcm_core.person (national_id);

CREATE INDEX IF NOT EXISTS idx_employee_person ON hcm_core.employee (person_id);
CREATE INDEX IF NOT EXISTS idx_employee_pernr ON hcm_core.employee (pernr);
CREATE INDEX IF NOT EXISTS idx_employee_status ON hcm_core.employee (employment_status);
CREATE INDEX IF NOT EXISTS idx_employee_org_scope ON hcm_core.employee (company_code, personnel_area);
CREATE INDEX IF NOT EXISTS idx_employee_dating ON hcm_core.employee (pernr, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_employee_source ON hcm_core.employee (source_system, source_object, source_key);

CREATE INDEX IF NOT EXISTS idx_emp_status_hist_emp ON hcm_core.employment_status_history (employee_id, valid_from, valid_to);

CREATE INDEX IF NOT EXISTS idx_emp_org_assign_emp ON hcm_core.employee_org_assignment (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_org_assign_org ON hcm_core.employee_org_assignment (org_unit_id, position_id);
CREATE INDEX IF NOT EXISTS idx_emp_org_assign_company ON hcm_core.employee_org_assignment (company_code, personnel_area);

CREATE INDEX IF NOT EXISTS idx_emp_address_emp ON hcm_core.employee_address (employee_id, address_type, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_family_emp ON hcm_core.employee_family (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_education_emp ON hcm_core.employee_education (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_qual_emp ON hcm_core.employee_qualification (employee_id, qualification_code, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_datespec_emp ON hcm_core.employee_date_specification (employee_id, date_type, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_contract_emp ON hcm_core.employee_contract (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_health_emp ON hcm_core.employee_health_profile (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_discipline_emp ON hcm_core.employee_disciplinary_record (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_emp_award_emp ON hcm_core.employee_award (employee_id, valid_from, valid_to);

-- ----------------------------------------------------------------------------
-- Indexes for hcm_core (OM Domain)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_om_object_lookup ON hcm_core.om_object (otype, objid, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_om_object_status ON hcm_core.om_object (status);
CREATE INDEX IF NOT EXISTS idx_om_object_source ON hcm_core.om_object (source_system, source_object, source_key);

CREATE INDEX IF NOT EXISTS idx_om_rel_source ON hcm_core.om_relationship (source_otype, source_objid, rsign, relat);
CREATE INDEX IF NOT EXISTS idx_om_rel_target ON hcm_core.om_relationship (target_otype, target_objid, rsign, relat);
CREATE INDEX IF NOT EXISTS idx_om_rel_dates ON hcm_core.om_relationship (valid_from, valid_to);

CREATE INDEX IF NOT EXISTS idx_org_unit_parent ON hcm_core.org_unit_detail (parent_org_unit_id);
CREATE INDEX IF NOT EXISTS idx_org_unit_cost_center ON hcm_core.org_unit_detail (cost_center);

CREATE INDEX IF NOT EXISTS idx_position_org ON hcm_core.position_detail (org_unit_id);
CREATE INDEX IF NOT EXISTS idx_position_job ON hcm_core.position_detail (job_id);
CREATE INDEX IF NOT EXISTS idx_position_vacant ON hcm_core.position_detail (is_vacant);

CREATE INDEX IF NOT EXISTS idx_job_family ON hcm_core.job_detail (job_family);

-- ----------------------------------------------------------------------------
-- Indexes for hcm_core (PT Domain)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_work_sched_emp ON hcm_core.employee_work_schedule (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_absence_emp ON hcm_core.time_absence (employee_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_absence_type ON hcm_core.time_absence (absence_type);
CREATE INDEX IF NOT EXISTS idx_attendance_emp ON hcm_core.time_attendance (employee_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_attendance_type ON hcm_core.time_attendance (attendance_type);
CREATE INDEX IF NOT EXISTS idx_time_event_emp ON hcm_core.time_event (employee_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_time_quota_emp ON hcm_core.time_quota (employee_id, quota_type, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_time_quota_deduct_quota ON hcm_core.time_quota_deduction (time_quota_id);
CREATE INDEX IF NOT EXISTS idx_time_quota_deduct_abs ON hcm_core.time_quota_deduction (time_absence_id);
CREATE INDEX IF NOT EXISTS idx_time_summary_emp ON hcm_core.monthly_time_summary (employee_id, year_month);

-- ----------------------------------------------------------------------------
-- Indexes for hcm_core (PY Domain)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_pay_basic_emp ON hcm_core.pay_basic (employee_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_pay_recurring_emp ON hcm_core.pay_recurring (employee_id, wage_type, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_pay_additional_emp ON hcm_core.pay_additional (employee_id, wage_type, payment_date);
CREATE INDEX IF NOT EXISTS idx_employee_loan_emp ON hcm_core.employee_loan (employee_id, contract_number, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_payroll_result_emp ON hcm_core.payroll_result (employee_id, payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_result_source ON hcm_core.payroll_result (source_system, source_object, source_key);
CREATE INDEX IF NOT EXISTS idx_payroll_wt_res ON hcm_core.payroll_wage_type_result (payroll_result_id, wage_type);
CREATE INDEX IF NOT EXISTS idx_payroll_trace_res ON hcm_core.payroll_calculation_trace (payroll_result_id, wage_type);

-- ----------------------------------------------------------------------------
-- Indexes for hcm_core (Training & Event Management)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_course_group_parent ON hcm_core.training_course_group (parent_group_id);
CREATE INDEX IF NOT EXISTS idx_training_course_code ON hcm_core.training_course (course_code);
CREATE INDEX IF NOT EXISTS idx_training_course_group ON hcm_core.training_course (course_group_id);
CREATE INDEX IF NOT EXISTS idx_training_event_course ON hcm_core.training_event (course_id, start_at);
CREATE INDEX IF NOT EXISTS idx_training_booking_emp ON hcm_core.training_booking (employee_id);
CREATE INDEX IF NOT EXISTS idx_training_booking_event ON hcm_core.training_booking (training_event_id);
CREATE INDEX IF NOT EXISTS idx_training_attend_booking ON hcm_core.training_attendance_result (booking_id);
CREATE INDEX IF NOT EXISTS idx_training_gap_emp ON hcm_core.employee_qualification_gap (employee_id, position_id);

-- ----------------------------------------------------------------------------
-- Indexes for hcm_core (Talent & Performance)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_goal_emp_cycle ON hcm_core.employee_goal (employee_id, performance_cycle_id);
CREATE INDEX IF NOT EXISTS idx_perf_doc_emp_cycle ON hcm_core.performance_document (employee_id, performance_cycle_id);
CREATE INDEX IF NOT EXISTS idx_comp_assess_doc ON hcm_core.competency_assessment (performance_document_id);
CREATE INDEX IF NOT EXISTS idx_dev_plan_emp ON hcm_core.development_plan (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_career_asp_emp ON hcm_core.career_aspiration (employee_id);
CREATE INDEX IF NOT EXISTS idx_succession_cand_pos ON hcm_core.succession_candidate (position_source_key, readiness_level);
CREATE INDEX IF NOT EXISTS idx_succession_cand_emp ON hcm_core.succession_candidate (employee_id);

-- ----------------------------------------------------------------------------
-- Indexes for Security, Workflow, Service, Integration, and Audit
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_app_user_emp ON hcm_security.app_user (employee_id);
CREATE INDEX IF NOT EXISTS idx_app_user_pernr ON hcm_security.app_user (pernr);
CREATE INDEX IF NOT EXISTS idx_user_role_user ON hcm_security.user_role (user_id, role_id);
CREATE INDEX IF NOT EXISTS idx_user_struct_user ON hcm_security.user_structural_auth (user_id, profile_id);

CREATE INDEX IF NOT EXISTS idx_wf_instance_requester ON hcm_workflow.workflow_instance (requester_employee_id, status);
CREATE INDEX IF NOT EXISTS idx_wf_instance_entity ON hcm_workflow.workflow_instance (business_entity_type, business_entity_id);
CREATE INDEX IF NOT EXISTS idx_wf_task_assigned_user ON hcm_workflow.workflow_task (assigned_user_id, status);
CREATE INDEX IF NOT EXISTS idx_wf_task_instance ON hcm_workflow.workflow_task (workflow_instance_id);

CREATE INDEX IF NOT EXISTS idx_service_domain ON hcm_service.service_definition (domain, active_flag);
CREATE INDEX IF NOT EXISTS idx_service_persona ON hcm_service.service_persona_assignment (persona);

CREATE INDEX IF NOT EXISTS idx_sync_run_job ON hcm_integration.sync_run (job_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_err_run ON hcm_integration.sync_error_log (sync_run_id, resolved_flag);
CREATE INDEX IF NOT EXISTS idx_data_lineage ON hcm_integration.data_lineage_trace (target_schema, target_table, target_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_target ON hcm_audit.audit_log (schema_name, table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON hcm_audit.audit_log (created_at);
