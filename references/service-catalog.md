# Service Catalog

Each service record must define:

- service_id
- code
- name_key_fa
- name_key_en
- domain
- subdomain
- persona(s)
- service_type
- read_write_mode
- sensitivity
- ui_component
- api_endpoint
- core_entities
- sap_sources
- permission
- workflow_definition
- active_flag

## Required domains

PA, OM, PT, PY, TRAINING, TALENT, WORKFLOW, ANALYTICS.

## Initial must-have services

Employee:
- PA_PROFILE_001
- OM_WHOISWHO_001
- PT_REQUEST_001
- PT_ATTENDANCE_001
- PY_PAYSLIP_001
- PY_WAGETYPE_001
- PE_TRAINING_CENTER_001
- PE_MY_BOOKINGS_001
- PE_MY_HISTORY_001
- PE_MY_QUALIFICATIONS_001
- TM_GOALS_001
- TM_IDP_001
- TM_CAREER_001
- TM_SELF_ASSESSMENT_001
- TM_APPRAISAL_001

Manager:
- MGR_TEAM_001
- MGR_APPROVAL_001
- MGR_TIME_001
- MGR_CAPABILITY_001
- MGR_TRAINING_001
- MGR_TALENT_001
- MGR_COST_001

Executive:
- EXEC_WORKFORCE_001
- EXEC_ORG_001
- EXEC_COST_001
- EXEC_TRAINING_001
- EXEC_TALENT_001
- EXEC_SUCCESSION_001
