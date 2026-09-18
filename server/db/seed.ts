// ============================================================================
// Enterprise HCM Experience Platform - Database Seeder
// Seeds enterprise-grade data across all 6 HCM domains, security & workflow
// ============================================================================

import { getDb } from './database';

export async function seedDatabase(): Promise<void> {
  const db = await getDb();

  // Check if already seeded
  const check = db.exec('SELECT COUNT(*) as count FROM person');
  if (check.length > 0 && (check[0].values[0][0] as number) > 0) {
    return;
  }

  db.run(`
    BEGIN TRANSACTION;

    -- ------------------------------------------------------------------------
    -- 1. PA: Person & Employee Master Data
    -- ------------------------------------------------------------------------
    INSERT INTO person (id, pernr, first_name, last_name, national_id, birth_date, gender, marital_status, valid_from, valid_to, source_key) VALUES
      ('p001', '00001001', 'Arash', 'Moradi', '0012345678', '1988-04-12', 'MALE', 'MARRIED', '1800-01-01', '9999-12-31', 'PA0002_00001001'),
      ('p002', '00001002', 'Sara', 'Tehrani', '0023456789', '1984-08-21', 'FEMALE', 'MARRIED', '1800-01-01', '9999-12-31', 'PA0002_00001002'),
      ('p003', '00001003', 'Kianoush', 'Rostami', '0034567890', '1979-11-05', 'MALE', 'MARRIED', '1800-01-01', '9999-12-31', 'PA0002_00001003'),
      ('p004', '00001004', 'Maryam', 'Alavi', '0045678901', '1990-02-18', 'FEMALE', 'SINGLE', '1800-01-01', '9999-12-31', 'PA0002_00001004'),
      ('p005', '00001005', 'Reza', 'Rahmani', '0056789012', '1992-06-30', 'MALE', 'MARRIED', '1800-01-01', '9999-12-31', 'PA0002_00001005'),
      ('p006', '00001006', 'Niloufar', 'Sadeghi', '0067890123', '1993-09-14', 'FEMALE', 'SINGLE', '1800-01-01', '9999-12-31', 'PA0002_00001006');

    INSERT INTO employee (id, person_id, pernr, employment_status, hire_date, email, phone, valid_from, valid_to, source_key) VALUES
      ('e001', 'p001', '00001001', 'ACTIVE', '2019-03-01', 'arash.moradi@enterprise-hcm.com', '+98-912-111-2233', '2019-03-01', '9999-12-31', 'PA0000_00001001'),
      ('e002', 'p002', '00001002', 'ACTIVE', '2016-01-15', 'sara.tehrani@enterprise-hcm.com', '+98-912-222-3344', '2016-01-15', '9999-12-31', 'PA0000_00001002'),
      ('e003', 'p003', '00001003', 'ACTIVE', '2012-05-10', 'kianoush.rostami@enterprise-hcm.com', '+98-912-333-4455', '2012-05-10', '9999-12-31', 'PA0000_00001003'),
      ('e004', 'p004', '00001004', 'ACTIVE', '2020-07-01', 'maryam.alavi@enterprise-hcm.com', '+98-912-444-5566', '2020-07-01', '9999-12-31', 'PA0000_00001004'),
      ('e005', 'p005', '00001005', 'ACTIVE', '2021-10-01', 'reza.rahmani@enterprise-hcm.com', '+98-912-555-6677', '2021-10-01', '9999-12-31', 'PA0000_00001005'),
      ('e006', 'p006', '00001006', 'ACTIVE', '2022-04-15', 'niloufar.sadeghi@enterprise-hcm.com', '+98-912-666-7788', '2022-04-15', '9999-12-31', 'PA0000_00001006');

    INSERT INTO employee_org_assignment (id, employee_id, org_unit_id, org_unit_name, position_id, position_title, job_code, job_title, cost_center, manager_id, manager_name, valid_from, valid_to, source_key) VALUES
      ('oa001', 'e001', '50000101', 'Software Engineering Department', '50000201', 'Senior Software Architect', 'JOB_ARCH', 'Enterprise Software Architect', 'CC_ENG_101', 'e002', 'Sara Tehrani', '2019-03-01', '9999-12-31', 'PA0001_00001001'),
      ('oa002', 'e002', '50000101', 'Software Engineering Department', '50000202', 'Engineering Director', 'JOB_DIR', 'Director of Engineering', 'CC_ENG_100', 'e003', 'Kianoush Rostami', '2016-01-15', '9999-12-31', 'PA0001_00001002'),
      ('oa003', 'e003', '50000100', 'Technology & Systems Division', '50000203', 'Vice President of Technology', 'JOB_VP', 'VP Technology', 'CC_TECH_001', NULL, NULL, '2012-05-10', '9999-12-31', 'PA0001_00001003'),
      ('oa004', 'e004', '50000102', 'HR Operations Department', '50000204', 'HR Operations Specialist', 'JOB_HR', 'HR Specialist', 'CC_HR_001', 'e003', 'Kianoush Rostami', '2020-07-01', '9999-12-31', 'PA0001_00001004'),
      ('oa005', 'e005', '50000101', 'Software Engineering Department', '50000205', 'Staff DevOps Engineer', 'JOB_DEVOPS', 'Staff Platform Engineer', 'CC_ENG_101', 'e002', 'Sara Tehrani', '2021-10-01', '9999-12-31', 'PA0001_00001005'),
      ('oa006', 'e006', '50000101', 'Software Engineering Department', '50000206', 'Product Design Lead', 'JOB_UX', 'Senior Product Designer', 'CC_ENG_101', 'e002', 'Sara Tehrani', '2022-04-15', '9999-12-31', 'PA0001_00001006');

    INSERT INTO employee_address (id, employee_id, address_type, street, city, postal_code, country, valid_from, valid_to, source_key) VALUES
      ('addr001', 'e001', 'PERMANENT', 'No. 42 Valiasr Ave, Farhang St', 'Tehran', '1987654321', 'Iran', '2019-03-01', '9999-12-31', 'PA0006_00001001'),
      ('addr002', 'e002', 'PERMANENT', 'No. 15 Saadat Abad Blvd, 7th St', 'Tehran', '1998765432', 'Iran', '2016-01-15', '9999-12-31', 'PA0006_00001002');

    INSERT INTO employee_family (id, employee_id, relation_type, first_name, last_name, birth_date, national_id, is_dependent, medical_insurance_enrolled, valid_from, valid_to, source_key) VALUES
      ('fam001', 'e001', 'SPOUSE', 'Parisa', 'Ghasemi', '1990-07-15', '0032165498', 1, 1, '2019-03-01', '9999-12-31', 'PA0021_00001001_1'),
      ('fam002', 'e001', 'CHILD', 'Danial', 'Moradi', '2021-02-10', '0043219876', 1, 1, '2021-02-10', '9999-12-31', 'PA0021_00001001_2');

    INSERT INTO employee_education (id, employee_id, degree_level, field_of_study, institution_name, graduation_year, gpa, valid_from, valid_to, source_key) VALUES
      ('edu001', 'e001', 'MASTER', 'Computer Software Engineering', 'Sharif University of Technology', 2013, 3.85, '2011-09-01', '9999-12-31', 'PA0022_00001001_1'),
      ('edu002', 'e001', 'BACHELOR', 'Computer Hardware Engineering', 'University of Tehran', 2010, 3.72, '2006-09-01', '9999-12-31', 'PA0022_00001001_2');

    INSERT INTO employee_health_profile (id, employee_id, blood_type, last_checkup_date, fitness_status, medical_restrictions, emergency_contact_name, emergency_contact_rel, emergency_contact_phone, valid_from, valid_to, source_key) VALUES
      ('hse001', 'e001', 'O_POSITIVE', '2025-11-20', 'FIT_FOR_WORK', '["None"]', 'Parisa Ghasemi', 'Spouse', '+98-912-999-8877', '2025-11-20', '9999-12-31', 'PA0028_00001001');

    INSERT INTO employee_contract (id, employee_id, contract_number, contract_type, contract_name, start_date, end_date, probation_period_months, notice_period_days, working_hours_per_week, status, legal_covenants, valid_from, valid_to, source_key) VALUES
      ('ct001', 'e001', 'CNT-2019-0442', 'PERMANENT', 'Indefinite Senior Technical Staff Contract', '2019-03-01', NULL, 3, 60, 44.0, 'ACTIVE', '["Non-Compete 12 Mo", "IP Assignment Covenant", "Confidentiality Tier 3"]', '2019-03-01', '9999-12-31', 'PA0016_00001001');

    -- ------------------------------------------------------------------------
    -- 2. OM: Organizational Structure
    -- ------------------------------------------------------------------------
    INSERT INTO om_object (id, obj_type, obj_id, short_text, long_text, valid_from, valid_to, source_key) VALUES
      ('om001', 'O', '50000100', 'TECH_DIV', 'Technology & Systems Division', '2012-01-01', '9999-12-31', 'HRP1000_O_50000100'),
      ('om002', 'O', '50000101', 'ENG_DEPT', 'Software Engineering Department', '2012-01-01', '9999-12-31', 'HRP1000_O_50000101'),
      ('om003', 'O', '50000102', 'HR_DEPT', 'HR Operations Department', '2012-01-01', '9999-12-31', 'HRP1000_O_50000102'),
      ('om004', 'S', '50000201', 'SR_ARCH', 'Senior Software Architect', '2019-01-01', '9999-12-31', 'HRP1000_S_50000201'),
      ('om005', 'S', '50000202', 'ENG_DIR', 'Engineering Director', '2016-01-01', '9999-12-31', 'HRP1000_S_50000202'),
      ('om006', 'S', '50000203', 'VP_TECH', 'Vice President of Technology', '2012-01-01', '9999-12-31', 'HRP1000_S_50000203');

    INSERT INTO om_relationship (id, source_obj_type, source_obj_id, rel_type, target_obj_type, target_obj_id, valid_from, valid_to, source_key) VALUES
      ('rel001', 'O', '50000101', 'B003', 'O', '50000100', '2012-01-01', '9999-12-31', 'HRP1001_REL_001'),
      ('rel002', 'O', '50000102', 'B003', 'O', '50000100', '2012-01-01', '9999-12-31', 'HRP1001_REL_002'),
      ('rel003', 'S', '50000202', 'A002', 'S', '50000201', '2019-01-01', '9999-12-31', 'HRP1001_REL_003'),
      ('rel004', 'S', '50000203', 'A002', 'S', '50000202', '2016-01-01', '9999-12-31', 'HRP1001_REL_004');

    INSERT INTO org_unit_detail (id, org_unit_id, name, parent_org_unit_id, manager_position_id, headcount, budget_amount, valid_from, valid_to) VALUES
      ('oud001', '50000100', 'Technology & Systems Division', NULL, '50000203', 145, 12500000000.0, '2012-01-01', '9999-12-31'),
      ('oud002', '50000101', 'Software Engineering Department', '50000100', '50000202', 48, 4800000000.0, '2012-01-01', '9999-12-31'),
      ('oud003', '50000102', 'HR Operations Department', '50000100', '50000204', 12, 1200000000.0, '2012-01-01', '9999-12-31');

    INSERT INTO position_detail (id, position_id, title, org_unit_id, job_id, is_head, occupant_employee_id, valid_from, valid_to) VALUES
      ('pos001', '50000201', 'Senior Software Architect', '50000101', 'JOB_ARCH', 0, 'e001', '2019-01-01', '9999-12-31'),
      ('pos002', '50000202', 'Engineering Director', '50000101', 'JOB_DIR', 1, 'e002', '2016-01-01', '9999-12-31'),
      ('pos003', '50000203', 'Vice President of Technology', '50000100', 'JOB_VP', 1, 'e003', '2012-01-01', '9999-12-31');

    INSERT INTO job_detail (id, job_id, title, job_family, valid_from, valid_to) VALUES
      ('job001', 'JOB_ARCH', 'Enterprise Software Architect', 'Engineering', '2012-01-01', '9999-12-31'),
      ('job002', 'JOB_DIR', 'Director of Engineering', 'Leadership', '2012-01-01', '9999-12-31'),
      ('job003', 'JOB_VP', 'VP Technology', 'Executive', '2012-01-01', '9999-12-31');

    -- ------------------------------------------------------------------------
    -- 3. PT: Time & Attendance
    -- ------------------------------------------------------------------------
    INSERT INTO time_quota (id, employee_id, quota_type, quota_name, entitlement_days, used_days, balance_days, valid_from, valid_to, source_key) VALUES
      ('q001', 'e001', '01', 'Annual Paid Leave', 26.0, 6.0, 20.0, '2026-01-01', '2026-12-31', 'PA2006_00001001_01'),
      ('q002', 'e001', '02', 'Certified Sick Leave', 15.0, 2.0, 13.0, '2026-01-01', '2026-12-31', 'PA2006_00001001_02'),
      ('q003', 'e002', '01', 'Annual Paid Leave', 30.0, 8.0, 22.0, '2026-01-01', '2026-12-31', 'PA2006_00001002_01');

    INSERT INTO time_absence (id, employee_id, absence_type, absence_name, start_date, end_date, absence_days, status, reason, source_key) VALUES
      ('abs001', 'e001', '0100', 'Annual Vacation', '2026-02-15', '2026-02-18', 3.0, 'APPROVED', 'Family travel', 'PA2001_00001001_1'),
      ('abs002', 'e001', '0200', 'Medical Leave', '2026-03-02', '2026-03-03', 2.0, 'APPROVED', 'Dental surgery recovery', 'PA2001_00001001_2'),
      ('abs003', 'e001', '0100', 'Annual Vacation', '2026-04-10', '2026-04-12', 3.0, 'SUBMITTED', 'Spring holiday', 'PA2001_00001001_3');

    INSERT INTO time_attendance (id, employee_id, attendance_date, scheduled_hours, actual_hours, overtime_hours, check_in_time, check_out_time, status, source_key) VALUES
      ('att001', 'e001', '2026-03-10', 8.0, 8.5, 0.5, '08:02:15', '16:32:40', 'PRESENT', 'PA2002_00001001_20260310'),
      ('att002', 'e001', '2026-03-11', 8.0, 8.0, 0.0, '07:58:10', '16:00:20', 'PRESENT', 'PA2002_00001001_20260311'),
      ('att003', 'e001', '2026-03-12', 8.0, 9.0, 1.0, '08:05:00', '17:05:00', 'PRESENT', 'PA2002_00001001_20260312');

    INSERT INTO overtime_claim (id, employee_id, overtime_date, start_time, end_time, hours, rate_multiplier, overtime_type, reason, status, approved_by, approved_at, source_key) VALUES
      ('ot001', 'e001', '2026-03-08', '17:00:00', '21:00:00', 4.0, 1.4, 'NORMAL_OVERTIME', 'Critical S/4HANA release deployment support', 'APPROVED', 'e002', '2026-03-09 09:15:00', 'PA2005_00001001_1'),
      ('ot002', 'e001', '2026-03-13', '09:00:00', '15:00:00', 6.0, 2.0, 'HOLIDAY_OVERTIME', 'Datacenter migration weekend standby', 'APPROVED', 'e002', '2026-03-14 10:00:00', 'PA2005_00001001_2'),
      ('ot003', 'e001', '2026-03-18', '18:00:00', '21:30:00', 3.5, 1.4, 'NORMAL_OVERTIME', 'Security audit remediation tasks', 'PENDING', NULL, NULL, 'PA2005_00001001_3');

    -- ------------------------------------------------------------------------
    -- 4. PY: Payroll & Wage Types
    -- ------------------------------------------------------------------------
    INSERT INTO payroll_period (id, period_code, period_name, start_date, end_date, payment_date, status) VALUES
      ('prd001', '2026-01', 'January 2026 Payroll', '2026-01-01', '2026-01-31', '2026-01-28', 'CLOSED'),
      ('prd002', '2026-02', 'February 2026 Payroll', '2026-02-01', '2026-02-28', '2026-02-26', 'CLOSED');

    INSERT INTO payroll_result (id, employee_id, period_id, gross_amount, net_amount, total_deductions, tax_amount, insurance_amount, currency, source_key) VALUES
      ('pyr001', 'e001', 'prd001', 450000000.0, 360000000.0, 90000000.0, 45000000.0, 45000000.0, 'IRR', 'PCL2_00001001_202601'),
      ('pyr002', 'e001', 'prd002', 450000000.0, 360000000.0, 90000000.0, 45000000.0, 45000000.0, 'IRR', 'PCL2_00001001_202602'),
      ('pyr003', 'e002', 'prd002', 650000000.0, 510000000.0, 140000000.0, 75000000.0, 65000000.0, 'IRR', 'PCL2_00001002_202602');

    INSERT INTO payroll_wage_type_result (id, payroll_result_id, wage_type_code, wage_type_name, wage_type_category, amount, source_key) VALUES
      ('wtr001', 'pyr002', '/101', 'Basic Monthly Salary', 'EARNING', 320000000.0, 'PAYROLL_RT_101'),
      ('wtr002', 'pyr002', '/102', 'Housing Allowance', 'EARNING', 60000000.0, 'PAYROLL_RT_102'),
      ('wtr003', 'pyr002', '/103', 'Technical Specialty Stipend', 'EARNING', 70000000.0, 'PAYROLL_RT_103'),
      ('wtr004', 'pyr002', '/501', 'Statutory Income Tax', 'DEDUCTION', 45000000.0, 'PAYROLL_RT_501'),
      ('wtr005', 'pyr002', '/502', 'Social Security Contribution', 'DEDUCTION', 45000000.0, 'PAYROLL_RT_502');

    INSERT INTO pay_wage_type_master (id, wage_type_code, name, category, is_taxable, is_deduction) VALUES
      ('wtm001', '/101', 'Basic Monthly Salary', 'EARNING', 1, 0),
      ('wtm002', '/102', 'Housing Allowance', 'EARNING', 1, 0),
      ('wtm003', '/103', 'Technical Specialty Stipend', 'EARNING', 1, 0),
      ('wtm004', '/501', 'Statutory Income Tax', 'DEDUCTION', 0, 1),
      ('wtm005', '/502', 'Social Security Contribution', 'DEDUCTION', 0, 1);

    INSERT INTO employee_loan (id, employee_id, loan_number, loan_type, principal_amount, repayment_amount_per_period, balance_amount, interest_rate, currency, start_date, end_date, status, valid_from, valid_to, source_key) VALUES
      ('ln001', 'e001', 'LN-2024-0089', 'HOUSING_ASSISTANCE', 600000000.0, 25000000.0, 350000000.0, 4.0, 'IRR', '2024-06-01', '2027-05-31', 'ACTIVE', '2024-06-01', '9999-12-31', 'PA0045_00001001_1'),
      ('ln002', 'e001', 'LN-2025-0142', 'CORPORATE_ADVANCE', 120000000.0, 10000000.0, 40000000.0, 0.0, 'IRR', '2025-08-01', '2026-07-31', 'ACTIVE', '2025-08-01', '9999-12-31', 'PA0045_00001001_2');

    -- ------------------------------------------------------------------------
    -- 5. Training & Event Management
    -- ------------------------------------------------------------------------
    INSERT INTO training_course_group (id, code, title, description) VALUES
      ('tcg001', 'TECH', 'Technology & Architecture', 'Software architecture, cloud, and engineering standards');

    INSERT INTO training_course (id, course_code, title, description, duration_hours, delivery_method, category, valid_from, valid_to, source_key) VALUES
      ('tc001', 'TEM-101', 'Enterprise HCM Architecture & S/4HANA Core', 'Deep dive into SAP infotypes, OM structures and modern APIs', 24.0, 'CLASSROOM', 'Architecture', '2025-01-01', '9999-12-31', 'TEM_C_101'),
      ('tc002', 'TEM-201', 'Advanced Cloud Security & Zero Trust Governance', 'Zero trust architecture, RBAC, and secret management', 16.0, 'VIRTUAL', 'Security', '2025-01-01', '9999-12-31', 'TEM_C_201'),
      ('tc003', 'TEM-301', 'Executive Leadership & Organizational Design', 'Strategic talent pipelines and organizational change management', 32.0, 'HYBRID', 'Leadership', '2025-01-01', '9999-12-31', 'TEM_C_301');

    INSERT INTO training_event (id, course_id, event_code, start_date, end_date, location, max_capacity, booked_capacity, instructor, source_key) VALUES
      ('te001', 'tc001', 'EV-2026-01', '2026-04-15', '2026-04-18', 'Tehran HQ Training Center Hall A', 25, 18, 'Dr. Hamid Hosseini', 'TEM_E_001'),
      ('te002', 'tc002', 'EV-2026-02', '2026-05-10', '2026-05-12', 'Virtual Live Classroom', 40, 22, 'Eng. Farhad Rad', 'TEM_E_002');

    INSERT INTO training_booking (id, employee_id, event_id, booking_status, booking_date, approved_by, source_key) VALUES
      ('tb001', 'e001', 'te001', 'CONFIRMED', '2026-03-01', 'e002', 'TEM_B_001'),
      ('tb002', 'e005', 'te002', 'CONFIRMED', '2026-03-05', 'e002', 'TEM_B_002');

    INSERT INTO training_attendance_result (id, employee_id, booking_id, event_id, course_title, completion_date, certificate_number, score, grade, accreditation_body, status, source_key) VALUES
      ('tar001', 'e001', 'tb001', 'te001', 'Enterprise HCM Architecture & S/4HANA Core', '2026-04-18', 'CERT-HCM-2026-0041', 94.5, 'EXCELLENT', 'SAP Training & Global Development', 'PASSED', 'TEM_RESULTS_001'),
      ('tar002', 'e001', NULL, NULL, 'Certified Cloud Security Professional (CCSP)', '2025-11-15', 'CERT-SEC-2025-1082', 88.0, 'DISTINCTION', 'International Cloud Security Consortium', 'PASSED', 'TEM_RESULTS_002');

    INSERT INTO employee_qualification (id, employee_id, qualification_code, qualification_name, proficiency_level, acquired_date, source_key) VALUES
      ('eq001', 'e001', 'QUAL_ARCH', 'Enterprise Software Architecture', 5, '2020-05-15', 'PA0024_00001001_1'),
      ('eq002', 'e001', 'QUAL_CLOUD', 'Cloud Solutions & Kubernetes', 4, '2022-09-10', 'PA0024_00001001_2');

    INSERT INTO employee_qualification_gap (id, employee_id, qualification_code, qualification_name, required_proficiency, current_proficiency, gap_score, status) VALUES
      ('qg001', 'e001', 'QUAL_LEAD', 'Executive Team Leadership', 4, 3, 1, 'GAP_IDENTIFIED'),
      ('qg002', 'e001', 'QUAL_ARCH', 'Enterprise Software Architecture', 5, 5, 0, 'COMPLIANT');

    -- ------------------------------------------------------------------------
    -- 6. Talent & Performance Management
    -- ------------------------------------------------------------------------
    INSERT INTO performance_cycle (id, cycle_code, title, year, start_date, end_date, status) VALUES
      ('pc001', 'FY2025', 'Fiscal Year 2025 Performance Cycle', 2025, '2025-01-01', '2025-12-31', 'COMPLETED'),
      ('pc002', 'FY2026', 'Fiscal Year 2026 Performance Cycle', 2026, '2026-01-01', '2026-12-31', 'ACTIVE');

    INSERT INTO employee_goal (id, employee_id, cycle_id, title, description, category, weight, progress_percent, status, target_date, source_key) VALUES
      ('eg001', 'e001', 'pc002', 'Deliver Unified HCM Service Catalog Engine', 'Design 8-tier traceability with zero-mock backend integration', 'STRATEGIC_ARCHITECTURE', 40, 85, 'IN_PROGRESS', '2026-06-30', 'TALENT_G_001'),
      ('eg002', 'e001', 'pc002', 'Establish S/4HANA Base Data Ingestion Contract', 'Implement exact SAP DDIC tables and verification registry', 'CORE_ENGINEERING', 35, 90, 'IN_PROGRESS', '2026-08-31', 'TALENT_G_002'),
      ('eg003', 'e001', 'pc002', 'Mentor Junior & Mid-level Architects', 'Conduct 12 architecture review workshops', 'PEOPLE_DEVELOPMENT', 25, 60, 'IN_PROGRESS', '2026-12-15', 'TALENT_G_003');

    INSERT INTO development_plan (id, employee_id, goal_title, action_item, competency_name, target_completion_date, status, source_key) VALUES
      ('idp001', 'e001', 'Expand Leadership Horizon', 'Complete Executive Leadership TEM-301 and co-lead quarterly budgeting', 'Executive Leadership', '2026-10-31', 'IN_PROGRESS', 'TALENT_IDP_001');

    INSERT INTO career_aspiration (id, employee_id, target_role, timeframe_years, readiness_level, notes, source_key) VALUES
      ('ca001', 'e001', 'Chief Enterprise Architect / Director of Systems', 2, 'READY_1_2_YEARS', 'Strong domain depth in SAP HCM and cloud native distributed systems', 'TALENT_CA_001');

    INSERT INTO performance_document (id, employee_id, cycle_id, status, self_assessment_text, manager_assessment_text, overall_rating, submitted_at, reviewed_at, source_key) VALUES
      ('pd001', 'e001', 'pc001', 'COMPLETED', 'Exceeded platform scalability goals and spearheaded SAP alignment strategy.', 'Outstanding technical contributions. Ready for expanded leadership responsibilities.', 4.8, '2025-12-10', '2025-12-28', 'HAP_DOC_001'),
      ('pd002', 'e001', 'pc002', 'SELF_ASSESSMENT', 'Delivered phase 1 data architecture on schedule. Driving service catalog rollout.', NULL, 0.0, '2026-03-01', NULL, 'HAP_DOC_002');

    INSERT INTO competency_assessment (id, employee_id, cycle_id, competency_code, competency_name, category, self_rating, manager_rating, target_level, feedback, evaluation_date, source_key) VALUES
      ('ca001_1', 'e001', 'pc002', 'COMP_SYS_ARCH', 'Distributed Systems & Architecture', 'TECHNICAL', 4.8, 4.7, 4.5, 'Exemplary architectural leadership across the enterprise.', '2026-03-01', 'TALENT_HAP_001'),
      ('ca001_2', 'e001', 'pc002', 'COMP_CLOUD_SEC', 'Cloud & Data Governance', 'TECHNICAL', 4.5, 4.4, 4.0, 'Maintains zero-trust compliance standards consistently.', '2026-03-01', 'TALENT_HAP_002'),
      ('ca001_3', 'e001', 'pc002', 'COMP_LEADERSHIP', 'People Coaching & Influence', 'LEADERSHIP', 4.0, 4.2, 4.0, 'Strong mentor for mid-level engineers and technical leads.', '2026-03-01', 'TALENT_HAP_003'),
      ('ca001_4', 'e001', 'pc002', 'COMP_BUSINESS_ALN', 'Strategic Business Alignment', 'LEADERSHIP', 4.3, 4.5, 4.0, 'Aligns technology roadmap closely with business ROI.', '2026-03-01', 'TALENT_HAP_004'),
      ('ca001_5', 'e001', 'pc002', 'COMP_INNOVATION', 'Execution & Continuous Innovation', 'CORE', 4.7, 4.8, 4.5, 'Delivered automated service catalog and zero-mock framework.', '2026-03-01', 'TALENT_HAP_005');

    INSERT INTO succession_candidate (id, position_id, candidate_employee_id, readiness_level, retention_risk, impact_of_loss, nominated_by, source_key) VALUES
      ('sc001', '50000202', 'e001', 'READY_NOW', 'LOW', 'HIGH', 'e003', 'TALENT_SUCC_001');

    -- ------------------------------------------------------------------------
    -- 7. Security & Users & Roles & Permissions
    -- ------------------------------------------------------------------------
    INSERT INTO app_user (id, pernr, username, email, first_name, last_name, persona, employee_id, is_active) VALUES
      ('u001', '00001001', 'arash.moradi', 'arash.moradi@enterprise-hcm.com', 'Arash', 'Moradi', 'EMPLOYEE', 'e001', 1),
      ('u002', '00001002', 'sara.tehrani', 'sara.tehrani@enterprise-hcm.com', 'Sara', 'Tehrani', 'MANAGER', 'e002', 1),
      ('u003', '00001003', 'kianoush.rostami', 'kianoush.rostami@enterprise-hcm.com', 'Kianoush', 'Rostami', 'EXECUTIVE', 'e003', 1),
      ('u004', '00001004', 'maryam.alavi', 'maryam.alavi@enterprise-hcm.com', 'Maryam', 'Alavi', 'HR_ADMIN', 'e004', 1);

    INSERT INTO role (id, role_code, role_name) VALUES
      ('r_emp', 'ROLE_EMPLOYEE', 'Standard Employee Role'),
      ('r_mgr', 'ROLE_MANAGER', 'People Manager Role'),
      ('r_exec', 'ROLE_EXECUTIVE', 'Executive Leadership Role'),
      ('r_hr', 'ROLE_HR_ADMIN', 'HR Administrator Role');

    INSERT INTO permission (id, permission_code, description) VALUES
      ('p_prof_r', 'employee.profile.read', 'Read employee master profile'),
      ('p_fam_r', 'employee.family.read', 'Read employee family data'),
      ('p_edu_r', 'employee.education.read', 'Read employee education credentials'),
      ('p_hse_r', 'employee.hse.read', 'Read employee health & safety record'),
      ('p_who_r', 'organization.whoiswho.read', 'Search organization hierarchy'),
      ('p_pos_r', 'organization.position.read', 'Read position details'),
      ('p_time_w', 'time.request.write', 'Submit time off requests'),
      ('p_time_hr', 'time.request.history.read', 'Read time off history'),
      ('p_att_r', 'time.attendance.read', 'Read attendance timesheet'),
      ('p_qta_r', 'time.quota.read', 'Read leave quota balances'),
      ('p_pay_r', 'payroll.self.read', 'Read personal payslips'),
      ('p_wt_r', 'payroll.wagetype.read', 'Read wage type breakdown'),
      ('p_pay_h', 'payroll.history.read', 'Read multi-period payroll history'),
      ('p_tr_cat', 'training.catalog.read', 'Browse training catalog courses'),
      ('p_tr_bk', 'training.booking.write', 'Book training events'),
      ('p_tr_h', 'training.history.read', 'Read training attendance history'),
      ('p_ql_r', 'qualification.read', 'Read qualification gap analysis'),
      ('p_gl_r', 'talent.goals.read', 'Read and manage performance goals'),
      ('p_idp_r', 'talent.idp.read', 'Read development plan'),
      ('p_car_r', 'talent.career.read', 'Read career aspirations'),
      ('p_sa_w', 'talent.selfassessment.write', 'Submit self assessment appraisal'),
      ('p_ap_r', 'talent.appraisal.read', 'Read performance appraisal doc'),
      ('p_mgr_team', 'manager.team.read', 'Read direct reports team list'),
      ('p_wf_appr', 'workflow.approve', 'Approve or reject workflow items'),
      ('p_mgr_cost', 'manager.cost.aggregate.read', 'Read team payroll cost metrics'),
      ('p_mgr_time', 'manager.time.read', 'Read team time attendance metrics'),
      ('p_mgr_cap', 'manager.capability.read', 'Read team skill matrix'),
      ('p_mgr_tr', 'manager.training.write', 'Approve team training enrollment'),
      ('p_mgr_tal', 'manager.talent.read', 'Read team talent review ratings'),
      ('p_ex_kpi', 'executive.kpi.read', 'Read strategic executive HCM KPIs'),
      ('p_ex_wf', 'executive.workforce.read', 'Read enterprise workforce metrics'),
      ('p_ex_bgt', 'executive.budget.read', 'Read enterprise compensation budget variance'),
      ('p_ex_cst', 'executive.cost.read', 'Read enterprise HCM payroll analytics'),
      ('p_ex_tr', 'executive.training.read', 'Read enterprise training metrics'),
      ('p_ex_tal', 'executive.talent.read', 'Read enterprise talent metrics'),
      ('p_ex_org', 'executive.org.read', 'Read org structure analytics'),
      ('p_ex_succ', 'executive.succession.read', 'Read succession coverage analytics'),
      ('p_ex_ret', 'executive.retention.read', 'Read executive retention risk analytics and HCROI'),
      ('p_pa_contract', 'employee.contract.read', 'Read employee contract and legal terms'),
      ('p_pt_overtime', 'time.overtime.read', 'Read and submit overtime claims'),
      ('p_py_loan', 'payroll.loan.read', 'Read personal loans and installment schedule'),
      ('p_pe_cert', 'training.certificate.read', 'Read certified course completion credentials'),
      ('p_tm_comp', 'talent.competency.read', 'Read 360 competency evaluation radar'),
      ('p_wf_inbox', 'workflow.inbox.read', 'Read unified approval inbox'),
      ('p_wf_act', 'workflow.action.write', 'Execute approval actions'),
      ('p_wf_hist', 'workflow.history.read', 'Read workflow audit trail'),
      ('p_wf_del', 'workflow.delegation.write', 'Set approval authority delegation');

    -- Assign roles to users
    INSERT INTO user_role (user_id, role_id) VALUES
      ('u001', 'r_emp'),
      ('u002', 'r_emp'),
      ('u002', 'r_mgr'),
      ('u003', 'r_emp'),
      ('u003', 'r_mgr'),
      ('u003', 'r_exec'),
      ('u004', 'r_emp'),
      ('u004', 'r_hr');

    -- Assign permissions to Employee role (Self-service)
    INSERT INTO role_permission (role_id, permission_id) VALUES
      ('r_emp', 'p_prof_r'), ('r_emp', 'p_fam_r'), ('r_emp', 'p_edu_r'),
      ('r_emp', 'p_hse_r'),
      ('r_emp', 'p_who_r'), ('r_emp', 'p_pos_r'), ('r_emp', 'p_time_w'),
      ('r_emp', 'p_time_hr'), ('r_emp', 'p_att_r'), ('r_emp', 'p_qta_r'),
      ('r_emp', 'p_pay_r'), ('r_emp', 'p_wt_r'), ('r_emp', 'p_pay_h'),
      ('r_emp', 'p_tr_cat'), ('r_emp', 'p_tr_bk'), ('r_emp', 'p_tr_h'),
      ('r_emp', 'p_ql_r'), ('r_emp', 'p_gl_r'), ('r_emp', 'p_idp_r'),
      ('r_emp', 'p_car_r'), ('r_emp', 'p_sa_w'), ('r_emp', 'p_ap_r'),
      ('r_emp', 'p_pa_contract'), ('r_emp', 'p_pt_overtime'), ('r_emp', 'p_py_loan'),
      ('r_emp', 'p_pe_cert'), ('r_emp', 'p_tm_comp');

    -- Assign permissions to Manager role
    INSERT INTO role_permission (role_id, permission_id) VALUES
      ('r_mgr', 'p_mgr_team'), ('r_mgr', 'p_wf_appr'), ('r_mgr', 'p_mgr_cost'),
      ('r_mgr', 'p_mgr_time'), ('r_mgr', 'p_mgr_cap'), ('r_mgr', 'p_mgr_tr'),
      ('r_mgr', 'p_mgr_tal'), ('r_mgr', 'p_wf_inbox'), ('r_mgr', 'p_wf_act'),
      ('r_mgr', 'p_wf_hist'), ('r_mgr', 'p_wf_del'),
      ('r_mgr', 'p_pa_contract'), ('r_mgr', 'p_pt_overtime'),
      ('r_mgr', 'p_pe_cert'), ('r_mgr', 'p_tm_comp');

    -- Assign permissions to Executive role
    INSERT INTO role_permission (role_id, permission_id) VALUES
      ('r_exec', 'p_ex_kpi'), ('r_exec', 'p_ex_wf'), ('r_exec', 'p_ex_bgt'),
      ('r_exec', 'p_ex_cst'), ('r_exec', 'p_ex_tr'), ('r_exec', 'p_ex_tal'),
      ('r_exec', 'p_ex_org'), ('r_exec', 'p_ex_succ'), ('r_exec', 'p_ex_ret'),
      ('r_exec', 'p_wf_appr'), ('r_exec', 'p_wf_inbox'), ('r_exec', 'p_wf_act'),
      ('r_exec', 'p_wf_hist'), ('r_exec', 'p_pe_cert'), ('r_exec', 'p_tm_comp');

    -- Assign permissions to HR Admin role
    INSERT INTO role_permission (role_id, permission_id) VALUES
      ('r_hr', 'p_hse_r'), ('r_hr', 'p_wf_appr'), ('r_hr', 'p_wf_inbox'),
      ('r_hr', 'p_wf_act'), ('r_hr', 'p_wf_hist'), ('r_hr', 'p_wf_del'),
      ('r_hr', 'p_pa_contract'), ('r_hr', 'p_py_loan');

    -- ------------------------------------------------------------------------
    -- 8. Workflow Instances & Tasks
    -- ------------------------------------------------------------------------
    INSERT INTO workflow_instance (id, service_code, requester_id, status, entity_name, entity_id, current_step, title, request_payload) VALUES
      ('wf001', 'PT_REQUEST_001', 'e001', 'PENDING', 'time_absence', 'abs003', 'MANAGER_APPROVAL', 'Annual Vacation Request (3 Days)', '{"absenceType":"0100","startDate":"2026-04-10","endDate":"2026-04-12","days":3}'),
      ('wf002', 'PE_MY_BOOKINGS_001', 'e005', 'PENDING', 'training_booking', 'tb002', 'MANAGER_APPROVAL', 'Course Enrollment: TEM-201 Cloud Security', '{"courseCode":"TEM-201","eventId":"te002"}');

    INSERT INTO workflow_task (id, instance_id, approver_id, approver_role, status, comments) VALUES
      ('tk001', 'wf001', 'e002', 'MANAGER', 'PENDING', 'Awaiting managerial review'),
      ('tk002', 'wf002', 'e002', 'MANAGER', 'PENDING', 'Awaiting training budget approval');

    -- ------------------------------------------------------------------------
    -- 9. Initial Audit Trail
    -- ------------------------------------------------------------------------
    INSERT INTO audit_log (id, actor_user_id, actor_pernr, actor_persona, service_code, action, endpoint, method, target_id, status, http_status, ip_address, duration_ms, metadata) VALUES
      ('aud001', 'u001', '00001001', 'EMPLOYEE', 'PA_PROFILE_001', 'READ', '/api/employee/e001/profile', 'GET', 'e001', 'SUCCESS', 200, '127.0.0.1', 12, '{"source":"INIT_SEED"}');

    COMMIT;
  `);
}
