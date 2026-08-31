-- Example data for ContractType
INSERT INTO contract_type (name)
SELECT 'Full Time'
WHERE NOT EXISTS (SELECT 1 FROM contract_type WHERE name = 'Full Time');

INSERT INTO contract_type (name)
SELECT 'Part Time'
WHERE NOT EXISTS (SELECT 1 FROM contract_type WHERE name = 'Part Time');

INSERT INTO contract_type (name)
SELECT 'Fixed Term'
WHERE NOT EXISTS (SELECT 1 FROM contract_type WHERE name = 'Fixed Term');

INSERT INTO contract_type (name)
SELECT 'Internship'
WHERE NOT EXISTS (SELECT 1 FROM contract_type WHERE name = 'Internship');

INSERT INTO contract_type (name)
SELECT 'Consulting'
WHERE NOT EXISTS (SELECT 1 FROM contract_type WHERE name = 'Consulting');

-- Example data for Country
INSERT INTO country (name) SELECT 'United States' WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'United States');
INSERT INTO country (name) SELECT 'France'       WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'France');
INSERT INTO country (name) SELECT 'Germany'      WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'Germany');
INSERT INTO country (name) SELECT 'United Kingdom' WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'United Kingdom');
INSERT INTO country (name) SELECT 'Canada'       WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'Canada');
INSERT INTO country (name) SELECT 'Australia'    WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'Australia');
INSERT INTO country (name) SELECT 'Singapore'    WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'Singapore');
INSERT INTO country (name) SELECT 'Japan'        WHERE NOT EXISTS (SELECT 1 FROM country WHERE name = 'Japan');

-- Example data for Departement
INSERT INTO departement (name, manager)
SELECT 'HR', 'John Doe'
WHERE NOT EXISTS (SELECT 1 FROM departement WHERE name = 'HR');

INSERT INTO departement (name, manager)
SELECT 'IT', 'Jane Smith'
WHERE NOT EXISTS (SELECT 1 FROM departement WHERE name = 'IT');

INSERT INTO departement (name, manager)
SELECT 'Finance', 'Olivia Chen'
WHERE NOT EXISTS (SELECT 1 FROM departement WHERE name = 'Finance');

INSERT INTO departement (name, manager)
SELECT 'Operations', 'Marcus Reid'
WHERE NOT EXISTS (SELECT 1 FROM departement WHERE name = 'Operations');

INSERT INTO departement (name, manager)
SELECT 'People Success', 'Elena Rossi'
WHERE NOT EXISTS (SELECT 1 FROM departement WHERE name = 'People Success');

-- Example data for Designation
INSERT INTO designation (name, departement_id)
SELECT 'HR Operations Manager', (SELECT MIN(id) FROM departement WHERE name = 'HR')
WHERE NOT EXISTS (SELECT 1 FROM designation WHERE name = 'HR Operations Manager');

INSERT INTO designation (name, departement_id)
SELECT 'Talent Acquisition Specialist', (SELECT MIN(id) FROM departement WHERE name = 'HR')
WHERE NOT EXISTS (SELECT 1 FROM designation WHERE name = 'Talent Acquisition Specialist');

INSERT INTO designation (name, departement_id)
SELECT 'People Data Analyst', (SELECT MIN(id) FROM departement WHERE name = 'IT')
WHERE NOT EXISTS (SELECT 1 FROM designation WHERE name = 'People Data Analyst');

INSERT INTO designation (name, departement_id)
SELECT 'Infrastructure Support Lead', (SELECT MIN(id) FROM departement WHERE name = 'IT')
WHERE NOT EXISTS (SELECT 1 FROM designation WHERE name = 'Infrastructure Support Lead');

INSERT INTO designation (name, departement_id)
SELECT 'Finance Business Partner', (SELECT MIN(id) FROM departement WHERE name = 'Finance')
WHERE NOT EXISTS (SELECT 1 FROM designation WHERE name = 'Finance Business Partner');

INSERT INTO designation (name, departement_id)
SELECT 'Learning and Development Partner', (SELECT MIN(id) FROM departement WHERE name = 'People Success')
WHERE NOT EXISTS (SELECT 1 FROM designation WHERE name = 'Learning and Development Partner');

-- Example data for Role
INSERT INTO roles (name) SELECT 'Admin'     WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin');
INSERT INTO roles (name) SELECT 'User'      WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'User');
INSERT INTO roles (name) SELECT 'Manager'   WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Manager');
INSERT INTO roles (name) SELECT 'HR'        WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'HR');
INSERT INTO roles (name) SELECT 'Recruiter' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Recruiter');

-- Example data for JobPosition
INSERT INTO job_positions (title, description, location, open) SELECT 'Software Engineer', 'Design, develop and maintain production software systems.', 'Remote', true WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Software Engineer');
INSERT INTO job_positions (title, description, location, open) SELECT 'HR Manager', 'Oversee HR operations, policies, recruitment and employee relations.', 'Hybrid', true WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'HR Manager');
INSERT INTO job_positions (title, description, location, open) SELECT 'Finance Analyst', 'Budgeting, forecasting and financial reporting.', 'Onsite', true WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Finance Analyst');
INSERT INTO job_positions (title, description, location, open) SELECT 'Operations Lead', 'Coordinate cross-functional operations and process improvements.', 'Onsite', false WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Operations Lead');

-- Example data for Skill
INSERT INTO skills (name, proficiency_level) SELECT 'Java',             'Expert'       WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Java');
INSERT INTO skills (name, proficiency_level) SELECT 'SQL',              'Intermediate' WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'SQL');
INSERT INTO skills (name, proficiency_level) SELECT 'Python',           'Advanced'     WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Python');
INSERT INTO skills (name, proficiency_level) SELECT 'JavaScript',       'Advanced'     WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'JavaScript');
INSERT INTO skills (name, proficiency_level) SELECT 'Project Management','Intermediate' WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Project Management');
INSERT INTO skills (name, proficiency_level) SELECT 'HR Compliance',     'Expert'       WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'HR Compliance');
INSERT INTO skills (name, proficiency_level) SELECT 'Excel',             'Advanced'     WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Excel');
INSERT INTO skills (name, proficiency_level) SELECT 'Payroll Management','Intermediate' WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Payroll Management');

-- Example data for Employee
INSERT INTO employees (
	full_name,
	phone,
	birth_day,
	gender,
	present_address,
	permanent_address,
	photo,
	note,
	department_id,
	joining_date,
	emergency_contact_number,
	contact_number,
	contact_note,
	resume,
	offer_letter,
	joining_letter,
	contract_agreement,
	identity_proof,
	contract_type_id,
	marital_status,
	number_of_children
)
SELECT
	'Nadia Rahman',
	'555-0101',
	'1990-04-12',
	'Female',
	'12 Cedar Avenue, Brooklyn',
	'12 Cedar Avenue, Brooklyn',
	'/files/employees/nadia-rahman.jpg',
	'Leads daily HR operations and keeps payroll coordination on schedule.',
	(SELECT MIN(id) FROM departement WHERE name = 'HR'),
	'2023-02-15',
	'555-2101',
	'555-3101',
	'Primary contact available on weekdays between 9am and 5pm.',
	'/files/employees/nadia-rahman-resume.pdf',
	'/files/employees/nadia-rahman-offer.pdf',
	'/files/employees/nadia-rahman-joining.pdf',
	'/files/employees/nadia-rahman-contract.pdf',
	'Passport',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'Married',
	2
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE full_name = 'Nadia Rahman');

INSERT INTO employees (
	full_name,
	phone,
	birth_day,
	gender,
	present_address,
	permanent_address,
	photo,
	note,
	department_id,
	joining_date,
	emergency_contact_number,
	contact_number,
	contact_note,
	resume,
	offer_letter,
	joining_letter,
	contract_agreement,
	identity_proof,
	contract_type_id,
	marital_status,
	number_of_children
)
SELECT
	'Daniel Kim',
	'555-0102',
	'1992-09-03',
	'Male',
	'48 River Road, Austin',
	'48 River Road, Austin',
	'/files/employees/daniel-kim.jpg',
	'Builds workforce reports and helps leadership track people metrics.',
	(SELECT MIN(id) FROM departement WHERE name = 'IT'),
	'2022-11-07',
	'555-2102',
	'555-3102',
	'Best reached by mobile for urgent reporting requests.',
	'/files/employees/daniel-kim-resume.pdf',
	'/files/employees/daniel-kim-offer.pdf',
	'/files/employees/daniel-kim-joining.pdf',
	'/files/employees/daniel-kim-contract.pdf',
	'National ID',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'Single',
	0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE full_name = 'Daniel Kim');

INSERT INTO employees (
	full_name,
	phone,
	birth_day,
	gender,
	present_address,
	permanent_address,
	photo,
	note,
	department_id,
	joining_date,
	emergency_contact_number,
	contact_number,
	contact_note,
	resume,
	offer_letter,
	joining_letter,
	contract_agreement,
	identity_proof,
	contract_type_id,
	marital_status,
	number_of_children
)
SELECT
	'Priya Nair',
	'555-0103',
	'1994-01-19',
	'Female',
	'77 Palm Street, Miami',
	'77 Palm Street, Miami',
	'/files/employees/priya-nair.jpg',
	'Coordinates hiring pipelines, candidate handoffs, and interview scheduling.',
	(SELECT MIN(id) FROM departement WHERE name = 'HR'),
	'2024-01-08',
	'555-2103',
	'555-3103',
	'Available for recruiting escalations and onboarding coordination.',
	'/files/employees/priya-nair-resume.pdf',
	'/files/employees/priya-nair-offer.pdf',
	'/files/employees/priya-nair-joining.pdf',
	'/files/employees/priya-nair-contract.pdf',
	'Driver License',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Part Time'),
	'Single',
	0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE full_name = 'Priya Nair');

INSERT INTO employees (
	full_name,
	phone,
	birth_day,
	gender,
	present_address,
	permanent_address,
	photo,
	note,
	department_id,
	joining_date,
	emergency_contact_number,
	contact_number,
	contact_note,
	resume,
	offer_letter,
	joining_letter,
	contract_agreement,
	identity_proof,
	contract_type_id,
	marital_status,
	number_of_children
)
SELECT
	'Lucas Moreau',
	'555-0104',
	'1988-06-27',
	'Male',
	'9 Rue du Centre, Lyon',
	'9 Rue du Centre, Lyon',
	'/files/employees/lucas-moreau.jpg',
	'Supports employee relations cases and documents policy-sensitive conversations.',
	(SELECT MIN(id) FROM departement WHERE name = 'HR'),
	'2021-06-21',
	'555-2104',
	'555-3104',
	'Use direct line for urgent employee relations follow-up.',
	'/files/employees/lucas-moreau-resume.pdf',
	'/files/employees/lucas-moreau-offer.pdf',
	'/files/employees/lucas-moreau-joining.pdf',
	'/files/employees/lucas-moreau-contract.pdf',
	'Passport',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'Married',
	1
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE full_name = 'Lucas Moreau');

INSERT INTO employees (
	full_name,
	phone,
	birth_day,
	gender,
	present_address,
	permanent_address,
	photo,
	note,
	department_id,
	joining_date,
	emergency_contact_number,
	contact_number,
	contact_note,
	resume,
	offer_letter,
	joining_letter,
	contract_agreement,
	identity_proof,
	contract_type_id,
	marital_status,
	number_of_children
)
SELECT
	'Hannah Ortiz',
	'555-0105',
	'1991-12-08',
	'Female',
	'205 Willow Park, Seattle',
	'205 Willow Park, Seattle',
	'/files/employees/hannah-ortiz.jpg',
	'Runs learning calendars, training follow-through, and skills development programs.',
	(SELECT MIN(id) FROM departement WHERE name = 'IT'),
	'2023-07-10',
	'555-2105',
	'555-3105',
	'Training and workshop requests are routed through this contact.',
	'/files/employees/hannah-ortiz-resume.pdf',
	'/files/employees/hannah-ortiz-offer.pdf',
	'/files/employees/hannah-ortiz-joining.pdf',
	'/files/employees/hannah-ortiz-contract.pdf',
	'National ID',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'Single',
	0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE full_name = 'Hannah Ortiz');

-- Add more INSERTs for other tables/entities as needed

-- Example data for Attendance
INSERT INTO attendances (
	date,
	check_in_time,
	check_out_time,
	employee_id,
	source,
	notes,
	attendance_status,
	approval_status,
	reviewed_by,
	reviewed_at
)
SELECT
	'2025-07-01',
	'08:00:00',
	'17:00:00',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	'manual',
	'Legacy seeded attendance record.',
	'Present',
	'Approved',
	'Administrator',
	'2025-07-01T18:00:00'
WHERE NOT EXISTS (
	SELECT 1
	FROM attendances
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
		AND date = '2025-07-01'
);

INSERT INTO attendances (
	date,
	check_in_time,
	check_out_time,
	employee_id,
	source,
	notes,
	attendance_status,
	approval_status,
	reviewed_by,
	reviewed_at
)
SELECT
	'2026-04-18',
	'08:52:00',
	'18:14:00',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	'self-service',
	'Approved shift with overtime ready for payroll linkage.',
	'Present',
	'Approved',
	'Administrator',
	'2026-04-18T18:30:00'
WHERE NOT EXISTS (
	SELECT 1
	FROM attendances
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
		AND date = '2026-04-18'
);

INSERT INTO attendances (
	date,
	check_in_time,
	check_out_time,
	employee_id,
	source,
	notes,
	attendance_status,
	approval_status,
	reviewed_by,
	reviewed_at
)
SELECT
	'2026-04-19',
	NULL,
	NULL,
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	'manual',
	'Approved leave day recorded by HR.',
	'On leave',
	'Approved',
	'Administrator',
	'2026-04-19T09:15:00'
WHERE NOT EXISTS (
	SELECT 1
	FROM attendances
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
		AND date = '2026-04-19'
);

INSERT INTO attendances (
	date,
	check_in_time,
	check_out_time,
	employee_id,
	source,
	notes,
	attendance_status,
	approval_status,
	reviewed_by,
	reviewed_at
)
SELECT
	'2026-04-21',
	'09:24:00',
	'17:02:00',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair'),
	'biometric',
	'Awaiting approval because of a late arrival exception.',
	'Present',
	'Pending',
	NULL,
	NULL
WHERE NOT EXISTS (
	SELECT 1
	FROM attendances
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair')
		AND date = '2026-04-21'
);

-- Example data for Announcement
INSERT INTO announcement (title, start_date, end_date, attachment, summary, description)
SELECT 'Welcome', '2025-07-01', '2025-07-02', '/files/announcement.pdf', 'Welcome summary', 'Welcome to the company!'
WHERE NOT EXISTS (SELECT 1 FROM announcement WHERE title = 'Welcome');

INSERT INTO announcement (title, departement_id, start_date, end_date, attachment, summary, description)
SELECT 'Benefits enrollment opens',
	(SELECT MIN(id) FROM departement WHERE name = 'HR'),
	'2025-08-15',
	'2025-08-22',
	'/files/benefits-guide.pdf',
	'Review plan changes before enrollment starts.',
	'Operations and support teams should confirm dependents, compare options, and submit selections before the enrollment window closes.'
WHERE NOT EXISTS (SELECT 1 FROM announcement WHERE title = 'Benefits enrollment opens');

-- Example data for AdvanceSalary
INSERT INTO advance_salary (reason, employee_id, amount, date, remarks)
SELECT
	'Medical',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair'),
	'500',
	'2025-07-01',
	'Advance for medical expenses'
WHERE NOT EXISTS (
	SELECT 1
	FROM advance_salary
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair')
		AND date = '2025-07-01'
		AND reason = 'Medical'
);

-- Example data for Award

-- Ensure type_award exists before award for FK constraint
INSERT INTO type_award (name)
SELECT 'Best Employee'
WHERE NOT EXISTS (SELECT 1 FROM type_award WHERE name = 'Best Employee');

INSERT INTO type_award (name)
SELECT 'Innovation Champion'
WHERE NOT EXISTS (SELECT 1 FROM type_award WHERE name = 'Innovation Champion');

INSERT INTO award (employee_id, type_award_id, award_date, description)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	(SELECT MIN(id) FROM type_award WHERE name = 'Best Employee'),
	'2025-07-01',
	'Employee of the Month'
WHERE NOT EXISTS (SELECT 1 FROM award WHERE description = 'Employee of the Month');

INSERT INTO award (employee_id, type_award_id, award_date, description)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	(SELECT MIN(id) FROM type_award WHERE name = 'Innovation Champion'),
	'2025-08-12',
	'Recognized for shipping the new onboarding workflow ahead of schedule.'
WHERE NOT EXISTS (
	SELECT 1 FROM award WHERE description = 'Recognized for shipping the new onboarding workflow ahead of schedule.'
);

-- Example data for Candidate
--INSERT INTO candidates (name, email, phone) VALUES ('Charlie Candidate', 'charlie@example.com', '555-1234');

-- Example data for Bonus
--INSERT INTO bonus (employee_id, amount, bonus_date, description) VALUES (1, '1000', '2025-07-01', 'Performance Bonus');

-- Example data for Benefit
INSERT INTO benefits (benefit_type, description, start_date, end_date, employee_id)
SELECT 'Health Insurance', 'Comprehensive medical, dental and vision cover via corporate group plan.', '2025-01-01', '2025-12-31',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM benefits WHERE benefit_type = 'Health Insurance'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for Certification
--INSERT INTO certification (name, employee_id, date_obtained) VALUES ('Java Cert', 1, '2025-06-01');

-- Example data for CitizenShip
--INSERT INTO citizenship (country, employee_id) VALUES ('USA', 1);

-- Example data for City
-- INSERT INTO city (name, country_id) VALUES ('New York', 1);

-- Example data for Clearance
-- INSERT INTO clearance (employee_id, clearance_type, date_issued) VALUES (1, 'Security', '2025-07-01');

-- Example data for CompensationHistory
-- INSERT INTO compensation_history (employee_id, amount, change_date) VALUES (1, '5000', '2025-07-01');

-- Example data for Complain
-- INSERT INTO complain (complain_by_id, complain_against_id, complain_title, complain_date, description) VALUES (1, 2, 'Harassment', '2025-07-01', 'Complaint details');

-- Example data for Contract
-- INSERT INTO contract (employee_id, subject, contract_value, contract_type_id, start_date, end_date, description, status) VALUES (1, 'Employment', '10000', 1, '2025-01-01', '2025-12-31', 'Annual contract', 'Active');

-- Example data for Course
INSERT INTO courses (title, description, start_date, end_date)
SELECT 'Leadership Foundations', 'Core leadership principles covering situational leadership, coaching and team motivation.', '2025-07-01', '2025-07-31'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Leadership Foundations');
INSERT INTO courses (title, description, start_date, end_date)
SELECT 'Payroll Compliance Masterclass', 'End-to-end payroll regulations, statutory deductions, year-end filings and compliance reporting.', '2025-08-01', '2025-08-31'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Payroll Compliance Masterclass');

-- Example data for Deduction
INSERT INTO deductions (type, amount, deduction_date, employee_id)
SELECT 'Income Tax Withholding', 620.00, '2025-07-31',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM deductions WHERE type = 'Income Tax Withholding' AND deduction_date = '2025-07-31'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for Document
INSERT INTO documents (document_name, document_type, file_path, employee_id, uploaded_at)
SELECT 'Employment Contract 2025', 'PDF', '/files/documents/nadia-contract-2025.pdf',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'), '2025-02-15T09:00:00'
WHERE NOT EXISTS (
	SELECT 1 FROM documents WHERE document_name = 'Employment Contract 2025'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for EducationLevel
INSERT INTO education_level (name, years, certificate_level, fieldof_study, school)
SELECT 'Bachelor', '4', 'BSc', 'Computer Science', 'MIT'
WHERE NOT EXISTS (
	SELECT 1 FROM education_level WHERE name = 'Bachelor' AND school = 'MIT'
);

INSERT INTO education_level (name, years, certificate_level, fieldof_study, school)
SELECT 'Master', '2', 'MSc', 'Human Resources', 'University of Michigan'
WHERE NOT EXISTS (
	SELECT 1 FROM education_level WHERE name = 'Master' AND school = 'University of Michigan'
);

INSERT INTO education_level (name, years, certificate_level, fieldof_study, school)
SELECT 'Diploma', '2', 'Professional Diploma', 'Payroll Administration', 'London Business Academy'
WHERE NOT EXISTS (
	SELECT 1 FROM education_level WHERE name = 'Diploma' AND school = 'London Business Academy'
);

INSERT INTO education_level (name, years, certificate_level, fieldof_study, school)
SELECT 'Doctorate', '5', 'PhD', 'Organizational Psychology', 'Stanford University'
WHERE NOT EXISTS (
	SELECT 1 FROM education_level WHERE name = 'Doctorate' AND school = 'Stanford University'
);

INSERT INTO education_level (name, years, certificate_level, fieldof_study, school)
SELECT 'Certification', '1', 'SHRM-CP', 'People Operations', 'SHRM Institute'
WHERE NOT EXISTS (
	SELECT 1 FROM education_level WHERE name = 'Certification' AND school = 'SHRM Institute'
);

-- Example data for Emergency
INSERT INTO emergency (emergency_contact, emergency_phone)
SELECT 'Rachel Rahman (Spouse)', '+1-555-0199'
WHERE NOT EXISTS (SELECT 1 FROM emergency WHERE emergency_phone = '+1-555-0199');

-- Example data for Enrollment
INSERT INTO enrollments (enrollment_date, status, employee_id)
SELECT '2025-07-15', 'ENROLLED',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM enrollments WHERE enrollment_date = '2025-07-15'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for Event
INSERT INTO event (event_title, event_date_time, event_note)
SELECT 'All-Hands Q3 Company Meeting', '2025-07-10 10:00', 'Quarterly strategy review, financial update and departmental spotlights presented by leadership.'
WHERE NOT EXISTS (SELECT 1 FROM event WHERE event_title = 'All-Hands Q3 Company Meeting');
INSERT INTO event (event_title, event_date_time, event_note)
SELECT 'Leadership Workshop – Coaching Skills', '2025-09-04 14:00', 'Cross-functional planning session for team leads and HR partners on building high-performance coaching habits.'
WHERE NOT EXISTS (SELECT 1 FROM event WHERE event_title = 'Leadership Workshop – Coaching Skills');

-- Example data for ExitInterview
INSERT INTO exit_interviews (interview_date, interviewer_name, feedback, suggestions, employee_id)
SELECT '2025-07-15', 'Elena Rossi',
	'Open about reasons for leaving; highlighted growth ceiling and better external opportunity. Spoke positively about team culture.',
	'Consider structured career-pathing conversations at 12-month mark for high performers.',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau')
WHERE NOT EXISTS (
	SELECT 1 FROM exit_interviews WHERE interview_date = '2025-07-15'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau')
);

-- Example data for ExitRequest
INSERT INTO exit_requests (request_date, last_working_day, status)
SELECT '2025-06-30', '2025-07-31', 'APPROVED'
WHERE NOT EXISTS (SELECT 1 FROM exit_requests WHERE request_date = '2025-06-30' AND last_working_day = '2025-07-31');

-- Example data for ExpenseClaim
INSERT INTO expense_claims (claim_type, description, amount, claim_date, status)
SELECT 'Travel', 'Return flights and ground transport for HR Leaders Summit 2025 – Chicago.', 840.00, '2025-07-22', 'PENDING'
WHERE NOT EXISTS (SELECT 1 FROM expense_claims WHERE description = 'Return flights and ground transport for HR Leaders Summit 2025 – Chicago.');

-- Example data for Feedback
INSERT INTO feedbacks (comment, given_by, given_at, type)
SELECT 'Delivered the Q2 payroll cycle flawlessly under tight deadlines and proactively flagged a tax calculation discrepancy before finalisation.', 'Marcus Reid', '2025-07-05T09:00:00', 'POSITIVE'
WHERE NOT EXISTS (SELECT 1 FROM feedbacks WHERE given_by = 'Marcus Reid' AND given_at = '2025-07-05T09:00:00');

-- Example data for FinalSettlement
INSERT INTO final_settlements (settlement_date, total_amount, remarks, employee_id)
SELECT '2025-07-31', 8450.00, 'Includes accrued leave payout, notice-period salary and final expense reimbursement. Cleared by finance on 2025-08-01.',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau')
WHERE NOT EXISTS (
	SELECT 1 FROM final_settlements WHERE settlement_date = '2025-07-31'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau')
);

-- Example data for Holiday
INSERT INTO holidays (name, date, is_recurring)
SELECT 'Christmas', '2025-12-25', true
WHERE NOT EXISTS (
	SELECT 1 FROM holidays WHERE name = 'Christmas' AND date = '2025-12-25'
);

INSERT INTO holidays (name, date, is_recurring)
SELECT 'Founders Day', '2025-09-16', false
WHERE NOT EXISTS (
	SELECT 1 FROM holidays WHERE name = 'Founders Day' AND date = '2025-09-16'
);

-- Example data for InsurancePlan
INSERT INTO insurance_plans (provider_name, policy_number, coverage_details, start_date, end_date, employee_id)
SELECT 'AXA Health', 'AXA-GRP-2025-001', 'Full medical, dental, optical and mental-health cover with worldwide emergency assistance.', '2025-01-01', '2025-12-31',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM insurance_plans WHERE policy_number = 'AXA-GRP-2025-001'
);

-- Example data for Interview
INSERT INTO interviews (scheduled_at, location, interviewer_name, status)
SELECT '2025-08-12T14:00:00', 'Video Call – Google Meet', 'Elena Rossi, HR Director', 'SCHEDULED'
WHERE NOT EXISTS (SELECT 1 FROM interviews WHERE scheduled_at = '2025-08-12T14:00:00');

-- Example data for JobApplication
INSERT INTO job_application (position_id, name, email, phone, applied_on, status)
SELECT (SELECT MIN(id) FROM job WHERE name = 'HR Operations Manager'), 'David Osei', 'david.osei@gmail.com', '+44-7700-900145', '2025-07-28', 'UNDER_REVIEW'
WHERE NOT EXISTS (SELECT 1 FROM job_application WHERE email = 'david.osei@gmail.com');

-- Example data for Job
INSERT INTO job (name, description)
SELECT 'Senior Payroll Analyst', 'Own monthly payroll processing, reconcile variances, coordinate with finance, and maintain payroll accuracy across all active employees.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'Senior Payroll Analyst');

INSERT INTO job (name, description)
SELECT 'HR Operations Manager', 'Lead HR operations, standardize people processes, supervise compliance workflows, and improve service delivery across the employee lifecycle.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'HR Operations Manager');

INSERT INTO job (name, description)
SELECT 'Talent Acquisition Specialist', 'Manage sourcing, screening, interview coordination, and candidate communication to keep the recruiting pipeline active and organized.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'Talent Acquisition Specialist');

INSERT INTO job (name, description)
SELECT 'Compensation and Benefits Specialist', 'Maintain salary structures, benefits administration, compensation reporting, and policy alignment for workforce planning and retention.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'Compensation and Benefits Specialist');

INSERT INTO job (name, description)
SELECT 'Learning and Development Partner', 'Design learning programs, coordinate training calendars, measure participation, and support capability growth across departments.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'Learning and Development Partner');

INSERT INTO job (name, description)
SELECT 'Employee Relations Officer', 'Handle employee concerns, support investigations, document case outcomes, and promote healthy workplace relations and policy adherence.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'Employee Relations Officer');

INSERT INTO job (name, description)
SELECT 'People Data Analyst', 'Analyze workforce metrics, build HR reports, surface trends, and support leadership decisions with accurate people data insights.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'People Data Analyst');

INSERT INTO job (name, description)
SELECT 'HR Business Partner', 'Partner with department leads on headcount planning, performance alignment, employee engagement, and organizational change initiatives.'
WHERE NOT EXISTS (SELECT 1 FROM job WHERE name = 'HR Business Partner');

-- Example data for LearningMaterial
INSERT INTO learning_materials (title, description, material_type, file_path, uploaded_at, course_id)
SELECT 'Module 1: Understanding Leadership Styles',
	'Video lecture covering situational, transformational and servant leadership models with real-world case studies.',
	'Video', '/files/courses/leadership-foundations/module-1.mp4', '2025-06-20T08:00:00',
	(SELECT MIN(id) FROM courses WHERE title = 'Leadership Foundations')
WHERE NOT EXISTS (SELECT 1 FROM learning_materials WHERE title = 'Module 1: Understanding Leadership Styles');

-- Example data for Leave
INSERT INTO type_leave (name, days)
SELECT 'Annual', '30'
WHERE NOT EXISTS (SELECT 1 FROM type_leave WHERE name = 'Annual');

INSERT INTO type_leave (name, days)
SELECT 'Sick', '10'
WHERE NOT EXISTS (SELECT 1 FROM type_leave WHERE name = 'Sick');

INSERT INTO type_leave (name, days)
SELECT 'Personal', '5'
WHERE NOT EXISTS (SELECT 1 FROM type_leave WHERE name = 'Personal');

INSERT INTO leave (type_leave_id, employee_id, start_date, end_date, attachment, remarks, reason)
SELECT
	(SELECT MIN(id) FROM type_leave WHERE name = 'Annual'),
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	'2025-08-18',
	'2025-08-22',
	'/files/leaves/nadia-annual-leave.pdf',
	'Payroll coverage aligned with Priya before the leave window.',
	'Family vacation planned after the mid-quarter payroll cycle.'
WHERE NOT EXISTS (
	SELECT 1
	FROM leave
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
		AND start_date = '2025-08-18'
		AND end_date = '2025-08-22'
);

INSERT INTO leave (type_leave_id, employee_id, start_date, end_date, attachment, remarks, reason)
SELECT
	(SELECT MIN(id) FROM type_leave WHERE name = 'Sick'),
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	'2025-09-03',
	'2025-09-05',
	'/files/leaves/daniel-sick-note.pdf',
	'Reporting dashboard ownership shifted to Nadia during recovery.',
	'Recovery time recommended after a medical procedure.'
WHERE NOT EXISTS (
	SELECT 1
	FROM leave
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
		AND start_date = '2025-09-03'
		AND end_date = '2025-09-05'
);

-- Example data for LeaveRequest
INSERT INTO leave_requests (start_date, end_date, status)
SELECT '2025-08-18', '2025-08-22', 'APPROVED'
WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE start_date = '2025-08-18' AND end_date = '2025-08-22');

-- Example data for LegalCompliance
INSERT INTO legal_compliances (compliance_type, description, effective_date, expiry_date, is_compliant, remarks)
SELECT 'GDPR', 'General Data Protection Regulation – EU employee and candidate data handling, consent management and breach notification procedures.', '2025-01-01', '2025-12-31', true, 'Full compliance confirmed by external audit dated 2025-03-15.'
WHERE NOT EXISTS (SELECT 1 FROM legal_compliances WHERE compliance_type = 'GDPR' AND effective_date = '2025-01-01');

-- Example data for Loan
INSERT INTO loan (loan_name, receive_type, employee_id, interest_percentage, loan_amount, apply_date, remarks)
SELECT
	'Car Loan',
	'Bank',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	'5',
	'10000',
	'2025-07-01',
	'For new car'
WHERE NOT EXISTS (
	SELECT 1
	FROM loan
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
		AND apply_date = '2025-07-01'
		AND loan_name = 'Car Loan'
);

-- Example data for Location
-- INSERT INTO location (name, address, city_id, state, zipcode, country_id) VALUES ('Main Office', '1 Main St', 1, 'NY', '10001', 1);

-- Example data for Manager
INSERT INTO managers (first_name, last_name, email, phone)
SELECT 'Sarah', 'Mitchell', 'sarah.mitchell@humant.io', '+1-555-0101'
WHERE NOT EXISTS (SELECT 1 FROM managers WHERE email = 'sarah.mitchell@humant.io');

-- Example data for Meeting
INSERT INTO meeting (title, date_time, room, note)
SELECT 'Q3 Workforce Planning', '2025-08-05 10:00', 'Conference Room A', 'Headcount review, attrition forecast and open role prioritisation for Q3.'
WHERE NOT EXISTS (SELECT 1 FROM meeting WHERE title = 'Q3 Workforce Planning');

-- Example data for Mentorship
INSERT INTO mentorships (mentor_id, mentee_id, start_date, end_date, status)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	'2025-07-01', '2025-12-31', 'Active'
WHERE NOT EXISTS (
	SELECT 1 FROM mentorships
	WHERE mentor_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
	  AND mentee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
);

-- Example data for Notice
INSERT INTO notice (notice_title, start_date, end_date, notice_note)
SELECT 'Holiday Notice', '2025-12-20', '2025-12-27', 'Office closed for the year-end holiday period and support requests will resume on the next business day.'
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE notice_title = 'Holiday Notice');

INSERT INTO notice (notice_title, start_date, end_date, notice_note)
SELECT 'Benefits Enrollment Window', '2025-08-15', '2025-08-25', 'Review plan changes, confirm dependents, and submit benefits selections before the enrollment window closes.'
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE notice_title = 'Benefits Enrollment Window');

-- Example data for Objective
INSERT INTO objectives (title, description, start_date, end_date, status)
SELECT 'Launch', 'Product launch', '2025-08-01', '2025-08-31', 'NOT_STARTED'
WHERE NOT EXISTS (SELECT 1 FROM objectives WHERE title = 'Launch');

INSERT INTO objectives (title, description, start_date, end_date, status, employee_id)
SELECT
	'Onboarding launch plan',
	'Coordinate welcome kits, training checkpoints, and manager handoffs for the next hiring wave.',
	'2025-08-05',
	'2025-08-30',
	'IN_PROGRESS',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (SELECT 1 FROM objectives WHERE title = 'Onboarding launch plan');

INSERT INTO objectives (title, description, start_date, end_date, status, employee_id)
SELECT
	'Offboarding transition plan',
	'Standardize account shutdown, equipment return, and handoff timing for exits.',
	'2025-09-01',
	'2025-09-20',
	'NOT_STARTED',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
WHERE NOT EXISTS (SELECT 1 FROM objectives WHERE title = 'Offboarding transition plan');

-- Example data for OfferLetter
--INSERT INTO offer_letters (issue_date, position_offered, salary_offered, terms_and_conditions, file_path, candidate_id) VALUES ('2025-07-01', 'Dev', '5000', 'Standard', '/files/offer.pdf', 1);

-- Example data for OnboardingChecklist
INSERT INTO onboarding_checklists (task_name, completed, employee_id)
SELECT 'Set up corporate email and communication accounts', true,
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM onboarding_checklists WHERE task_name = 'Set up corporate email and communication accounts'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);
INSERT INTO onboarding_checklists (task_name, completed, employee_id)
SELECT 'Complete IT security and data privacy training', false,
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM onboarding_checklists WHERE task_name = 'Complete IT security and data privacy training'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for Payroll
INSERT INTO payrolls (payroll_date, basic_salary, bonus, deductions, net_salary, employee_id)
SELECT '2025-07-31', 5000, 500, 100, 5400,
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM payrolls WHERE payroll_date = '2025-07-31'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for PaySlip
INSERT INTO payslips (issue_date, basic_salary, bonus, deductions, net_salary, employee_id, remarks)
SELECT
	'2025-07-31',
	5000,
	500,
	100,
	5400,
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	'July salary'
WHERE NOT EXISTS (
	SELECT 1
	FROM payslips
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
		AND issue_date = '2025-07-31'
);

	INSERT INTO payslips (issue_date, basic_salary, bonus, deductions, net_salary, employee_id, remarks)
	SELECT
		'2026-04-30',
		5000,
		350,
		100,
		5250,
		(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
		'April payroll linked to approved attendance and overtime.'
	WHERE NOT EXISTS (
		SELECT 1
		FROM payslips
		WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
			AND issue_date = '2026-04-30'
	);

	INSERT INTO payslips (issue_date, basic_salary, bonus, deductions, net_salary, employee_id, remarks)
	SELECT
		'2026-04-30',
		4700,
		0,
		220,
		4480,
		(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
		'April payroll after approved leave-day review.'
	WHERE NOT EXISTS (
		SELECT 1
		FROM payslips
		WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
			AND issue_date = '2026-04-30'
	);

-- Example data for PerformanceReview
INSERT INTO performance_reviews (reviewer_name, review_date, feedback, rating, employee_id)
SELECT 'Elena Rossi', '2025-07-01', 'Consistently delivers quality work, proactively identifies process gaps and mentors junior team members effectively.', 5,
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM performance_reviews
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman') AND review_date = '2025-07-01'
);

-- Example data for Policy
INSERT INTO policies (title, description, effective_date, expiry_date, document_path)
SELECT 'Annual Leave Policy', 'Governs employee entitlement to paid annual leave, accrual rules, carry-over limits and approval workflow.', '2025-01-01', '2025-12-31', '/files/policies/annual-leave-policy.pdf'
WHERE NOT EXISTS (SELECT 1 FROM policies WHERE title = 'Annual Leave Policy');
INSERT INTO policies (title, description, effective_date, expiry_date, document_path)
SELECT 'Remote Work Policy', 'Defines eligibility, equipment allowances, security requirements and productivity expectations for remote employees.', '2025-01-01', '2025-12-31', '/files/policies/remote-work-policy.pdf'
WHERE NOT EXISTS (SELECT 1 FROM policies WHERE title = 'Remote Work Policy');

-- Example data for Position
INSERT INTO position (name) SELECT 'Software Engineer' WHERE NOT EXISTS (SELECT 1 FROM position WHERE name = 'Software Engineer');
INSERT INTO position (name) SELECT 'HR Specialist'    WHERE NOT EXISTS (SELECT 1 FROM position WHERE name = 'HR Specialist');
INSERT INTO position (name) SELECT 'Finance Analyst'  WHERE NOT EXISTS (SELECT 1 FROM position WHERE name = 'Finance Analyst');

-- Example data for Project
INSERT INTO projects (name, description, start_date, end_date, project_manager_id)
SELECT 'Workforce Digitalisation 2025', 'Migrate manual HR workflows to the platform: onboarding, leave, payroll approval and performance cycles.', '2025-07-01', '2025-12-31',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Workforce Digitalisation 2025');
INSERT INTO projects (name, description, start_date, end_date, project_manager_id)
SELECT 'Talent Retention Initiative', 'Design and roll out a structured career-pathing programme targeting the top 20% performers.', '2025-08-01', '2025-11-30',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Talent Retention Initiative');

-- Example data for Referral
--INSERT INTO referrals (candidate_name, candidate_email, candidate_phone, referral_date, status) VALUES ('Eve', 'eve@example.com', '555-2222', '2025-07-01', 'PENDING');

-- Example data for Reimbursement
INSERT INTO reimbursements (description, amount, reimbursement_date, employee_id)
SELECT 'Business travel – HR conference attendance, flights and hotel', 485.00, '2025-07-15',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM reimbursements
	WHERE description = 'Business travel – HR conference attendance, flights and hotel'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for Resignation
INSERT INTO resignation (employee_id, departement_id, resignation_date, resignation_reason)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau'),
	(SELECT MIN(id) FROM departement WHERE name = 'HR'),
	'2025-07-01',
	'Personal'
WHERE NOT EXISTS (
	SELECT 1
	FROM resignation
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau')
		AND resignation_date = '2025-07-01'
);

-- Example data for Salary
INSERT INTO salary (salary_name, basic_salary, total_salary, medical_allowance, conveyance_allowance)
SELECT 'Base', '3000', '3500', '200', '300'
WHERE NOT EXISTS (SELECT 1 FROM salary WHERE salary_name = 'Base');

-- Complete seeded employee assignments once jobs and salary rows exist
UPDATE employees
SET job_id = COALESCE(job_id, (SELECT MIN(id) FROM job WHERE name = 'HR Operations Manager')),
	salary_id = COALESCE(salary_id, (SELECT MIN(id) FROM salary WHERE salary_name = 'Base'))
WHERE full_name = 'Nadia Rahman';

UPDATE employees
SET job_id = COALESCE(job_id, (SELECT MIN(id) FROM job WHERE name = 'People Data Analyst')),
	salary_id = COALESCE(salary_id, (SELECT MIN(id) FROM salary WHERE salary_name = 'Base'))
WHERE full_name = 'Daniel Kim';

UPDATE employees
SET job_id = COALESCE(job_id, (SELECT MIN(id) FROM job WHERE name = 'Talent Acquisition Specialist')),
	salary_id = COALESCE(salary_id, (SELECT MIN(id) FROM salary WHERE salary_name = 'Base'))
WHERE full_name = 'Priya Nair';

UPDATE employees
SET job_id = COALESCE(job_id, (SELECT MIN(id) FROM job WHERE name = 'Employee Relations Officer')),
	salary_id = COALESCE(salary_id, (SELECT MIN(id) FROM salary WHERE salary_name = 'Base'))
WHERE full_name = 'Lucas Moreau';

UPDATE employees
SET job_id = COALESCE(job_id, (SELECT MIN(id) FROM job WHERE name = 'Learning and Development Partner')),
	salary_id = COALESCE(salary_id, (SELECT MIN(id) FROM salary WHERE salary_name = 'Base'))
WHERE full_name = 'Hannah Ortiz';

-- Example data for Contract
INSERT INTO contract (
	employee_id,
	subject,
	contract_value,
	contract_type_id,
	start_date,
	end_date,
	description,
	status,
	job,
	departement,
	salary_structure_type,
	working_schedule
)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	'Nadia Rahman Employment Agreement',
	'92000',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'2023-02-15',
	'2026-12-31',
	'Annual leadership agreement covering HR operations governance, payroll coordination, and policy execution.',
	'Active',
	'HR Operations Manager',
	'HR',
	'Base + Benefits',
	'Hybrid 9-5'
WHERE NOT EXISTS (
	SELECT 1 FROM contract WHERE subject = 'Nadia Rahman Employment Agreement'
);

INSERT INTO contract (
	employee_id,
	subject,
	contract_value,
	contract_type_id,
	start_date,
	end_date,
	description,
	status,
	job,
	departement,
	salary_structure_type,
	working_schedule
)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	'Daniel Kim Workforce Analytics Contract',
	'84000',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'2022-11-07',
	'2026-11-06',
	'Performance and workforce analytics contract focused on reporting cadence, data quality, and leadership dashboards.',
	'Active',
	'People Data Analyst',
	'IT',
	'Base + Reporting Bonus',
	'Remote First'
WHERE NOT EXISTS (
	SELECT 1 FROM contract WHERE subject = 'Daniel Kim Workforce Analytics Contract'
);

INSERT INTO contract (
	employee_id,
	subject,
	contract_value,
	contract_type_id,
	start_date,
	end_date,
	description,
	status,
	job,
	departement,
	salary_structure_type,
	working_schedule
)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair'),
	'Priya Nair Talent Acquisition Contract',
	'56000',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Part Time'),
	'2024-01-08',
	'2026-01-07',
	'Recruitment operations agreement covering sourcing, interview logistics, candidate care, and onboarding handoffs.',
	'Probation',
	'Talent Acquisition Specialist',
	'HR',
	'Base + Hiring Incentive',
	'Flexible 30 Hours'
WHERE NOT EXISTS (
	SELECT 1 FROM contract WHERE subject = 'Priya Nair Talent Acquisition Contract'
);

INSERT INTO contract (
	employee_id,
	subject,
	contract_value,
	contract_type_id,
	start_date,
	end_date,
	description,
	status,
	job,
	departement,
	salary_structure_type,
	working_schedule
)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Lucas Moreau'),
	'Lucas Moreau Employee Relations Agreement',
	'78000',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Fixed Term'),
	'2021-06-21',
	'2026-06-20',
	'Employee relations agreement focused on investigations, case notes, workplace policy guidance, and sensitive follow-up.',
	'Active',
	'Employee Relations Officer',
	'HR',
	'Base + Case Premium',
	'Onsite Core Hours'
WHERE NOT EXISTS (
	SELECT 1 FROM contract WHERE subject = 'Lucas Moreau Employee Relations Agreement'
);

INSERT INTO contract (
	employee_id,
	subject,
	contract_value,
	contract_type_id,
	start_date,
	end_date,
	description,
	status,
	job,
	departement,
	salary_structure_type,
	working_schedule
)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Hannah Ortiz'),
	'Hannah Ortiz Learning Partnership Contract',
	'73000',
	(SELECT MIN(id) FROM contract_type WHERE name = 'Full Time'),
	'2023-07-10',
	'2026-07-09',
	'Learning and development agreement covering program design, facilitator coordination, completion tracking, and capability reporting.',
	'Active',
	'Learning and Development Partner',
	'People Success',
	'Base + Program Bonus',
	'Hybrid Learning Calendar'
WHERE NOT EXISTS (
	SELECT 1 FROM contract WHERE subject = 'Hannah Ortiz Learning Partnership Contract'
);

-- Example data for SalaryStructure
INSERT INTO salary_structures (structure_name, basic_salary, hra, medical_allowance, travel_allowance, other_allowances, deductions)
SELECT 'Standard', 3000, 500, 200, 100, 50, 100
WHERE NOT EXISTS (SELECT 1 FROM salary_structures WHERE structure_name = 'Standard');

-- Example data for Schedule
INSERT INTO schedule (working_hours) SELECT '09:00 – 17:00' WHERE NOT EXISTS (SELECT 1 FROM schedule WHERE working_hours = '09:00 – 17:00');
INSERT INTO schedule (working_hours) SELECT '08:00 – 16:00' WHERE NOT EXISTS (SELECT 1 FROM schedule WHERE working_hours = '08:00 – 16:00');

-- Example data for Shift
--INSERT INTO shifts (name, start_time, end_time, work_schedule_id) VALUES ('Morning', '08:00:00', '16:00:00', 1);

-- Example data for Skill-Employee join table
INSERT INTO employee_skills (employee_id, skill_id)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	(SELECT MIN(id) FROM skills WHERE name = 'HR Compliance')
WHERE EXISTS (SELECT 1 FROM employees WHERE full_name = 'Nadia Rahman')
  AND EXISTS (SELECT 1 FROM skills WHERE name = 'HR Compliance')
  AND NOT EXISTS (SELECT 1 FROM employee_skills WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman') AND skill_id = (SELECT MIN(id) FROM skills WHERE name = 'HR Compliance'));
INSERT INTO employee_skills (employee_id, skill_id)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	(SELECT MIN(id) FROM skills WHERE name = 'Python')
WHERE EXISTS (SELECT 1 FROM employees WHERE full_name = 'Daniel Kim')
  AND EXISTS (SELECT 1 FROM skills WHERE name = 'Python')
  AND NOT EXISTS (SELECT 1 FROM employee_skills WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim') AND skill_id = (SELECT MIN(id) FROM skills WHERE name = 'Python'));

-- Example data for Structure
--INSERT INTO structure (structure_name, type_employee, country, scheduled_pay) VALUES ('Corp', 'Full Time', 'USA', 'Monthly');

-- Example data for Task
INSERT INTO tasks (title, description, due_date, status, assigned_to_id, assigned_by_id)
SELECT
	'Prepare Q3 Headcount Report',
	'Compile headcount data, attrition breakdown and open-role aging from the HR platform for the Q3 leadership review.',
	'2025-08-15', 'PENDING',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Prepare Q3 Headcount Report');

-- Example data for Tax
INSERT INTO taxes (tax_type, amount, tax_date, employee_id)
SELECT 'Income Tax', 620.00, '2025-07-31',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (
	SELECT 1 FROM taxes WHERE tax_type = 'Income Tax' AND tax_date = '2025-07-31'
	  AND employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
);

-- Example data for Team
INSERT INTO teams (name, description, manager_id)
SELECT 'People & Culture',
	'Drives recruitment, onboarding, engagement and HR policy across the organisation.',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'People & Culture');
INSERT INTO teams (name, description, manager_id)
SELECT 'Engineering',
	'Builds and maintains platform infrastructure, internal tooling and customer-facing products.',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Engineering');

-- Example data for Termination
INSERT INTO termination (type_termination, reason, employee_id, notice_date, termination_date, description)
SELECT
	'Layoff',
	'Budget',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Hannah Ortiz'),
	'2025-07-01',
	'2025-07-15',
	'Downsizing'
WHERE NOT EXISTS (
	SELECT 1
	FROM termination
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Hannah Ortiz')
		AND termination_date = '2025-07-15'
);

-- Example data for Timeoff
--INSERT INTO timeoff (description, from_date, to_date, duration, mode) VALUES ('Sick leave', '2025-07-01', '2025-07-07', 7, 'By employee');

-- Example data for Timesheet
--INSERT INTO timesheets (date, start_time, end_time, task_description, employee_id) VALUES ('2025-07-01', '08:00:00', '17:00:00', 'Worked on project', 1);

-- Example data for Trainer
INSERT INTO trainer (first_name, last_name, contact_number, email, company, expertise, education_level_id, address)
SELECT 'Marcus', 'Reid', '+1-415-555-0200', 'marcus.reid@learncraft.io', 'LearnCraft Consulting',
	'Leadership Development, Change Management and Executive Coaching',
	(SELECT MIN(id) FROM education_level LIMIT 1),
	'288 Harbour Drive, San Francisco, CA 94105'
WHERE NOT EXISTS (SELECT 1 FROM trainer WHERE email = 'marcus.reid@learncraft.io');

-- Example data for Training
INSERT INTO type_training (name)
SELECT 'Leadership'
WHERE NOT EXISTS (SELECT 1 FROM type_training WHERE name = 'Leadership');

INSERT INTO type_training (name)
SELECT 'Compliance'
WHERE NOT EXISTS (SELECT 1 FROM type_training WHERE name = 'Compliance');

INSERT INTO type_training (name)
SELECT 'Technical'
WHERE NOT EXISTS (SELECT 1 FROM type_training WHERE name = 'Technical');

INSERT INTO training (type_training_id, name, employee_id, start_date, end_date, description)
SELECT
	(SELECT MIN(id) FROM type_training WHERE name = 'Leadership'),
	'Leadership Accelerator',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	'2025-08-05',
	'2025-08-12',
	'Focused management cohort covering coaching, performance conversations, and team planning.'
WHERE NOT EXISTS (SELECT 1 FROM training WHERE name = 'Leadership Accelerator');

INSERT INTO training (type_training_id, name, employee_id, start_date, end_date, description)
SELECT
	(SELECT MIN(id) FROM type_training WHERE name = 'Compliance'),
	'Workplace Safety Refresh',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	'2025-09-02',
	'2025-09-03',
	'Required compliance refresher for new site procedures and reporting expectations.'
WHERE NOT EXISTS (SELECT 1 FROM training WHERE name = 'Workplace Safety Refresh');

-- Example data for TrainingSession
--INSERT INTO trainings (topic, trainer_name, start_date, end_date, location) VALUES ('Spring Boot', 'Jane Trainer', '2025-07-01', '2025-07-05', 'HQ');

-- Example data for Transfer
INSERT INTO transfer (departement_from_id, employee_id, departement_to_id, designation, notice_date, transfer_date, description)
SELECT
	(SELECT MIN(id) FROM departement WHERE name = 'HR'),
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman'),
	(SELECT MIN(id) FROM departement WHERE name = 'People Success'),
	'People Success Lead',
	'2025-09-01',
	'2025-09-15',
	'Temporary transfer to stabilize the learning operations backlog and improve manager onboarding support.'
WHERE NOT EXISTS (
	SELECT 1
	FROM transfer
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
		AND transfer_date = '2025-09-15'
);

INSERT INTO transfer (departement_from_id, employee_id, departement_to_id, designation, notice_date, transfer_date, description)
SELECT
	(SELECT MIN(id) FROM departement WHERE name = 'IT'),
	(SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim'),
	(SELECT MIN(id) FROM departement WHERE name = 'Operations'),
	'Operations Analyst',
	'2025-10-03',
	'2025-10-17',
	'Realignment to operations analytics so reporting can support workforce planning and service delivery dashboards.'
WHERE NOT EXISTS (
	SELECT 1
	FROM transfer
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Daniel Kim')
		AND transfer_date = '2025-10-17'
);

-- Example data for TypeAward
INSERT INTO type_award (name)
SELECT 'Service Milestone'
WHERE NOT EXISTS (SELECT 1 FROM type_award WHERE name = 'Service Milestone');

-- Example data for TypeLeave
-- Seeded earlier with duplicate-safe inserts before leave records.

-- Example data for TypeTermination
INSERT INTO type_termination (name) SELECT 'Resignation'      WHERE NOT EXISTS (SELECT 1 FROM type_termination WHERE name = 'Resignation');
INSERT INTO type_termination (name) SELECT 'Redundancy'       WHERE NOT EXISTS (SELECT 1 FROM type_termination WHERE name = 'Redundancy');
INSERT INTO type_termination (name) SELECT 'Retirement'       WHERE NOT EXISTS (SELECT 1 FROM type_termination WHERE name = 'Retirement');
INSERT INTO type_termination (name) SELECT 'Contract Expiry'  WHERE NOT EXISTS (SELECT 1 FROM type_termination WHERE name = 'Contract Expiry');
INSERT INTO type_termination (name) SELECT 'Dismissal'        WHERE NOT EXISTS (SELECT 1 FROM type_termination WHERE name = 'Dismissal');

-- Example data for TypeTraining
-- Seeded earlier to satisfy training foreign keys.

-- Example data for User
--INSERT INTO user (username, password) VALUES ('admin', 'admin123');

-- Example data for Visa
INSERT INTO visas (visa_type, visa_number, issue_date, expiry_date, employee_id)
SELECT 'Work Permit', 'WP-2025-NR001', '2025-02-01', '2027-01-31',
	(SELECT MIN(id) FROM employees WHERE full_name = 'Nadia Rahman')
WHERE NOT EXISTS (SELECT 1 FROM visas WHERE visa_number = 'WP-2025-NR001');

-- Example data for Warning
INSERT INTO warning (employee_id, warning_title, warning_date, description)
SELECT
	(SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair'),
	'Late',
	'2025-07-01',
	'Late to work'
WHERE NOT EXISTS (
	SELECT 1
	FROM warning
	WHERE employee_id = (SELECT MIN(id) FROM employees WHERE full_name = 'Priya Nair')
		AND warning_date = '2025-07-01'
		AND warning_title = 'Late'
);

-- Example data for WorkEntry
--INSERT INTO work_entry (from_date, to_date, period, hours) VALUES ('2025-07-01', '2025-07-31', 'July', '160');

-- Example data for WorkingLocation
INSERT INTO working_location (work_address, work_location, homeworkingdistance)
SELECT '350 Fifth Avenue, New York, NY 10118', 'Head Office', '0 km'
WHERE NOT EXISTS (SELECT 1 FROM working_location WHERE work_address = '350 Fifth Avenue, New York, NY 10118');
INSERT INTO working_location (work_address, work_location, homeworkingdistance)
SELECT 'Remote – Home Office', 'Remote', '25 km'
WHERE NOT EXISTS (SELECT 1 FROM working_location WHERE work_address = 'Remote – Home Office');

-- Example data for WorkPermit
INSERT INTO work_permit (visa_no, work_permit_no, visa_expire_date, work_permit_expiration_date, work_permit)
SELECT 'WP-2025-NR001', 'WPNO-2025-001', '2027-01-31', '2027-01-31', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM work_permit WHERE visa_no = 'WP-2025-NR001');

-- Example data for WorkSchedule
--INSERT INTO work_schedules (name) VALUES ('Regular 9-5');

-- ── Candidates ───────────────────────────────────────────────────────────
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'David','Osei','david.osei@gmail.com','+44-7700-900145','INTERVIEW','2025-07-28','/files/resumes/david-osei-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='HR Manager')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='david.osei@gmail.com');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Sofia','Müller','sofia.muller@outlook.de','+49-172-5500001','SCREENING','2025-08-01','/files/resumes/sofia-muller-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='HR Manager')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='sofia.muller@outlook.de');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'James','Whitfield','james.whitfield@protonmail.com','+1-617-555-0182','OFFER','2025-07-15','/files/resumes/james-whitfield-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Finance Analyst')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='james.whitfield@protonmail.com');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Amara','Diallo','amara.diallo@gmail.com','+33-6-12345678','APPLIED','2025-08-05','/files/resumes/amara-diallo-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Finance Analyst')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='amara.diallo@gmail.com');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Kenji','Tanaka','kenji.tanaka@corp.jp','+81-90-1234-5678','REJECTED','2025-07-10','/files/resumes/kenji-tanaka-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Software Engineer')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='kenji.tanaka@corp.jp');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Priya','Sharma','priya.sharma@techfirm.in','+91-98765-43210','INTERVIEW','2025-08-03','/files/resumes/priya-sharma-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='HR Manager')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='priya.sharma@techfirm.in');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Lucas','Bernard','lucas.bernard@yahoo.fr','+33-7-98765432','SCREENING','2025-08-07','/files/resumes/lucas-bernard-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Finance Analyst')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='lucas.bernard@yahoo.fr');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Mei','Chen','mei.chen@linkedin-apply.com','+65-9123-4567','OFFER','2025-07-20','/files/resumes/mei-chen-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Operations Lead')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='mei.chen@linkedin-apply.com');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Elias','Khoury','elias.khoury@gmail.com','+961-70-123456','APPLIED','2025-08-09','/files/resumes/elias-khoury-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Finance Analyst')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='elias.khoury@gmail.com');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Fatima','Al-Rashid','fatima.alrashid@email.ae','+971-50-9876543','HIRED','2025-06-25','/files/resumes/fatima-alrashid-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='HR Manager')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='fatima.alrashid@email.ae');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Oliver','Hansen','oliver.hansen@maersk-applicant.dk','+45-20123456','INTERVIEW','2025-07-30','/files/resumes/oliver-hansen-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='HR Manager')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='oliver.hansen@maersk-applicant.dk');
INSERT INTO candidates (first_name, last_name, email, phone, status, application_date, resume_path, job_position_id)
SELECT 'Yasmin','Torres','yasmin.torres@hotmail.mx','+52-55-5678-9012','SCREENING','2025-08-04','/files/resumes/yasmin-torres-cv.pdf',(SELECT MIN(id) FROM job_positions WHERE title='Finance Analyst')
WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email='yasmin.torres@hotmail.mx');

-- ── Offer Letters ─────────────────────────────────────────────────────────
INSERT INTO offer_letters (issue_date, position_offered, salary_offered, terms_and_conditions, file_path, candidate_id)
SELECT '2025-07-25','Senior Payroll Analyst','72,000 USD per annum + 10% performance bonus','Standard employment terms. 3-month probation. 25 days annual leave. Health and dental insurance included from day one.','/files/offer-letters/james-whitfield-offer.pdf',(SELECT MIN(id) FROM candidates WHERE email='james.whitfield@protonmail.com')
WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='james.whitfield@protonmail.com'));
INSERT INTO offer_letters (issue_date, position_offered, salary_offered, terms_and_conditions, file_path, candidate_id)
SELECT '2025-07-28','Operations Lead','68,500 SGD per annum + relocation allowance of 5,000 SGD','Full-time hybrid role. 30 days annual leave. Comprehensive medical cover. 6-month notice period after probation.','/files/offer-letters/mei-chen-offer.pdf',(SELECT MIN(id) FROM candidates WHERE email='mei.chen@linkedin-apply.com')
WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='mei.chen@linkedin-apply.com'));
INSERT INTO offer_letters (issue_date, position_offered, salary_offered, terms_and_conditions, file_path, candidate_id)
SELECT '2025-07-05','HR Manager','58,000 AED per annum + housing allowance of 12,000 AED','Standard Gulf employment contract. 2-year initial term with automatic renewal. 30 calendar days annual leave.','/files/offer-letters/fatima-alrashid-offer.pdf',(SELECT MIN(id) FROM candidates WHERE email='fatima.alrashid@email.ae')
WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='fatima.alrashid@email.ae'));

-- ── Pipeline stages ───────────────────────────────────────────────────────
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'CV Review','Strong background in payroll operations. 7 years at KPMG managing 400-person payroll.',(SELECT MIN(id) FROM candidates WHERE email='david.osei@gmail.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='david.osei@gmail.com') AND stage='CV Review');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Phone Screen','First call completed. Communication skills excellent. Requested 62k GBP.',(SELECT MIN(id) FROM candidates WHERE email='david.osei@gmail.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='david.osei@gmail.com') AND stage='Phone Screen');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Technical Interview','Panel interview with Elena Rossi and Nadia Rahman. Scored 4.2/5.',(SELECT MIN(id) FROM candidates WHERE email='david.osei@gmail.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='david.osei@gmail.com') AND stage='Technical Interview');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'CV Review','Certified payroll professional (CPP). 5 years in shared services.',(SELECT MIN(id) FROM candidates WHERE email='james.whitfield@protonmail.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='james.whitfield@protonmail.com') AND stage='CV Review');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Offer Extended','Verbal acceptance confirmed. Offer letter sent 2025-07-25. Start date: 2025-09-01.',(SELECT MIN(id) FROM candidates WHERE email='james.whitfield@protonmail.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='james.whitfield@protonmail.com') AND stage='Offer Extended');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'CV Review','MA in Talent Management. 80+ placements in 2024.',(SELECT MIN(id) FROM candidates WHERE email='sofia.muller@outlook.de') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='sofia.muller@outlook.de') AND stage='CV Review');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'CV Review','MSc Compensation Analytics. Authored pay-equity framework for 1,200-person workforce.',(SELECT MIN(id) FROM candidates WHERE email='amara.diallo@gmail.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='amara.diallo@gmail.com') AND stage='CV Review');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Phone Screen','Fluent English and Hindi. Available immediately. Needs visa sponsorship confirmed.',(SELECT MIN(id) FROM candidates WHERE email='priya.sharma@techfirm.in') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='priya.sharma@techfirm.in') AND stage='Phone Screen');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Technical Interview','Demonstrated learning needs analysis methodology. Invited to second round.',(SELECT MIN(id) FROM candidates WHERE email='priya.sharma@techfirm.in') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='priya.sharma@techfirm.in') AND stage='Technical Interview');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'CV Review','People analytics lead at 3,000-person fintech. Built workforce dashboards in Power BI and Python.',(SELECT MIN(id) FROM candidates WHERE email='kenji.tanaka@corp.jp') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='kenji.tanaka@corp.jp') AND stage='CV Review');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Offer Extended','Offer letter issued 2025-07-28 at 68,500 SGD. Verbal acceptance received same day.',(SELECT MIN(id) FROM candidates WHERE email='mei.chen@linkedin-apply.com') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='mei.chen@linkedin-apply.com') AND stage='Offer Extended');
INSERT INTO pipelines (stage, notes, candidate_id) SELECT 'Hired','Contract signed 2025-07-10. Background check cleared. Onboarding scheduled 2025-08-04.',(SELECT MIN(id) FROM candidates WHERE email='fatima.alrashid@email.ae') WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE candidate_id=(SELECT MIN(id) FROM candidates WHERE email='fatima.alrashid@email.ae') AND stage='Hired');

-- ═══════════════════════════════════════════════════════════════════════════
-- SUPER ADMIN PORTAL SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- ── SaaS Plans ───────────────────────────────────────────────────────────
INSERT INTO saas_plans (plan_key, name, description, monthly_price_cents, annual_price_cents, setup_fee_cents, trial_days, currency, min_users, max_users, max_employees, max_storage_mb, api_limit_per_month, features, enabled, hidden, popular, public_plan, sort_order)
SELECT 'FREE', 'Free', 'Get started at no cost. Basic HR features included.', 0, 0, 0, 14, 'USD', 1, 5, 10, 512, 1000,
       'employee_management,leave_management,attendance_tracking', true, false, false, true, 0
WHERE NOT EXISTS (SELECT 1 FROM saas_plans WHERE plan_key = 'FREE');

INSERT INTO saas_plans (plan_key, name, description, monthly_price_cents, annual_price_cents, setup_fee_cents, trial_days, currency, min_users, max_users, max_employees, max_storage_mb, api_limit_per_month, features, enabled, hidden, popular, public_plan, sort_order)
SELECT 'STARTER', 'Starter', 'Perfect for small teams. Includes core HR, leave and attendance.', 2900, 29000, 0, 14, 'USD', 1, 25, 100, 5120, 10000,
       'employee_management,leave_management,attendance_tracking,document_management,holiday_management', true, false, false, true, 1
WHERE NOT EXISTS (SELECT 1 FROM saas_plans WHERE plan_key = 'STARTER');

INSERT INTO saas_plans (plan_key, name, description, monthly_price_cents, annual_price_cents, setup_fee_cents, trial_days, currency, min_users, max_users, max_employees, max_storage_mb, api_limit_per_month, features, enabled, hidden, popular, public_plan, sort_order)
SELECT 'PROFESSIONAL', 'Professional', 'Everything in Starter plus payroll, performance, recruitment and advanced reports.', 7900, 79000, 0, 14, 'USD', 1, 100, 500, 20480, 50000,
       'employee_management,leave_management,attendance_tracking,document_management,holiday_management,payroll_management,performance_review,recruitment_pipeline,advanced_reports,expense_management,loan_management', true, false, true, true, 2
WHERE NOT EXISTS (SELECT 1 FROM saas_plans WHERE plan_key = 'PROFESSIONAL');

INSERT INTO saas_plans (plan_key, name, description, monthly_price_cents, annual_price_cents, setup_fee_cents, trial_days, currency, min_users, max_users, max_employees, max_storage_mb, api_limit_per_month, features, enabled, hidden, popular, public_plan, sort_order)
SELECT 'ENTERPRISE', 'Enterprise', 'Everything in Professional plus SSO, advanced permissions, API access, custom integrations and dedicated support.', 19900, 199000, 50000, 30, 'USD', 10, 9999, 99999, 102400, 1000000,
       'employee_management,leave_management,attendance_tracking,document_management,holiday_management,payroll_management,performance_review,recruitment_pipeline,advanced_reports,expense_management,loan_management,sso_integration,custom_api,advanced_permissions,dedicated_support,custom_integrations,audit_logs', true, false, false, true, 3
WHERE NOT EXISTS (SELECT 1 FROM saas_plans WHERE plan_key = 'ENTERPRISE');

-- ── Feature Flags ─────────────────────────────────────────────────────────
INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'employee_management','Employee Management','Core employee records, profiles and org structure','HR',true,'FREE,STARTER,PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'employee_management');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'leave_management','Leave Management','Leave requests, approvals, balances and types','HR',false,'STARTER,PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'leave_management');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'attendance_tracking','Attendance Tracking','Daily attendance, check-in/out and timesheets','HR',false,'STARTER,PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'attendance_tracking');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'document_management','Document Management','Upload, store and manage HR documents','HR',false,'STARTER,PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'document_management');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'payroll_management','Payroll Management','Salary slips, payroll runs and deductions','Payroll',false,'PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'payroll_management');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'performance_review','Performance Reviews','Goals, KPIs, 360 feedback and appraisals','HR',false,'PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'performance_review');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'recruitment_pipeline','Recruitment Pipeline','Jobs, candidates, interviews and offer letters','Recruitment',false,'PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'recruitment_pipeline');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'advanced_reports','Advanced Reports','Custom report builder, exports and analytics','Analytics',false,'PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'advanced_reports');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'expense_management','Expense Management','Expense claims, approvals and reimbursements','Finance',false,'PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'expense_management');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'loan_management','Loan Management','Employee loans and advance salary requests','Finance',false,'PROFESSIONAL,ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'loan_management');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'sso_integration','SSO Integration','Single Sign-On via SAML, OIDC or OAuth2','Security',false,'ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'sso_integration');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'custom_api','Custom API Access','Full REST API access with rate limits','API',false,'ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'custom_api');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'advanced_permissions','Advanced Permissions','Granular role-based access control','Security',false,'ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'advanced_permissions');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'dedicated_support','Dedicated Support','Priority support with dedicated CSM','Support',false,'ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'dedicated_support');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'audit_logs','Audit Logs','Full audit trail for all user actions','Security',false,'ENTERPRISE','',false,100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'audit_logs');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'ai_insights','AI Insights','AI-powered HR analytics and recommendations','Analytics',false,'','',true,30
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'ai_insights');

INSERT INTO feature_flags (feature_key, feature_name, description, module, enabled_globally, enabled_for_plans, enabled_for_tenants, beta_feature, rollout_percent)
SELECT 'smart_scheduling','Smart Scheduling','AI-assisted shift scheduling and planning','HR',false,'','',true,20
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature_key = 'smart_scheduling');

-- ── Tenants ───────────────────────────────────────────────────────────────
INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'techcorp','TechCorp Global','admin@techcorp.com','ENTERPRISE','ACTIVE','ANNUAL','500','2000','247',18420,94530,1245,247,'Technology','1000+','United States','USD','America/New_York','en','Sarah Mitchell','+1-555-0101',NOW() - INTERVAL '14 months',NULL,NOW() + INTERVAL '10 months'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'techcorp');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'startupx','StartupX Labs','admin@startupx.io','STARTER','TRIAL','MONTHLY','10','40','6',320,1250,18,6,'Technology','11-50','United Kingdom','GBP','Europe/London','en','James Harlow','+44-20-0001',NOW() - INTERVAL '5 days',NOW() + INTERVAL '9 days',NULL
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'startupx');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'globalhr','Global HR Solutions','admin@globalhr.com','PROFESSIONAL','ACTIVE','MONTHLY','100','500','78',4096,22400,312,78,'Human Resources','201-500','Germany','EUR','Europe/Berlin','de','Klaus Weber','+49-30-00002',NOW() - INTERVAL '8 months',NULL,NOW() + INTERVAL '22 days'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'globalhr');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'devagency','DevAgency Co','admin@devagency.dev','FREE','PENDING','MONTHLY','5','10','0',0,0,0,0,'Software','1-10','Canada','CAD','America/Toronto','en','Liam Nguyen','+1-416-0003',NOW() - INTERVAL '2 days',NULL,NULL
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'devagency');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'retailpro','Retail Pro Group','admin@retailpro.com','ENTERPRISE','ACTIVE','ANNUAL','300','1500','189',14230,67800,889,189,'Retail','1000+','France','EUR','Europe/Paris','fr','Marie Dupont','+33-1-00004',NOW() - INTERVAL '20 months',NULL,NOW() + INTERVAL '4 months'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'retailpro');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'cloudfirst','CloudFirst Inc','admin@cloudfirst.io','PROFESSIONAL','SUSPENDED','MONTHLY','50','200','0',2048,0,145,0,'Cloud Services','51-200','Australia','AUD','Australia/Sydney','en','Tom Richards','+61-2-00005',NOW() - INTERVAL '6 months',NULL,NOW() - INTERVAL '1 month'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'cloudfirst');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'smallbiz','SmallBiz Hub','admin@smallbiz.com','STARTER','ACTIVE','MONTHLY','20','80','12',680,3200,42,12,'Consulting','11-50','United States','USD','America/Chicago','en','Anna Brooks','+1-312-0006',NOW() - INTERVAL '3 months',NULL,NOW() + INTERVAL '18 days'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'smallbiz');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'megacorp','MegaCorp Industries','admin@megacorp.com','ENTERPRISE','ACTIVE','ANNUAL','1000','5000','621',51200,215000,3812,621,'Manufacturing','1000+','Japan','JPY','Asia/Tokyo','ja','Kenji Tanaka','+81-3-00007',NOW() - INTERVAL '30 months',NULL,NOW() + INTERVAL '8 months'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'megacorp');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at)
SELECT 'financeplus','FinancePlus Ltd','admin@financeplus.com','PROFESSIONAL','TRIAL','MONTHLY','50','200','3',120,450,14,3,'Finance','51-200','Singapore','SGD','Asia/Singapore','en','Wei Chen','+65-00008',NOW() - INTERVAL '3 days',NOW() + INTERVAL '11 days',NULL
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'financeplus');

INSERT INTO tenants (tenant_code, company_name, admin_email, plan, status, billing_cycle, max_users, max_employees, seats_consumed, storage_usage_mb, api_calls_this_month, total_employees, total_users, industry, company_size, country, currency, timezone, language, owner_name, phone, created_at, trial_ends_at, subscription_ends_at, cancelled_at)
SELECT 'oldclient','OldClient Corp','admin@oldclient.com','FREE','CANCELLED','MONTHLY','5','10','0',0,0,0,0,'Media','1-10','United States','USD','America/Los_Angeles','en','Dan Foster','+1-310-0009',NOW() - INTERVAL '12 months',NULL,NULL,NOW() - INTERVAL '2 months'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'oldclient');

-- ── Invoices ──────────────────────────────────────────────────────────────
INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202407-0001','techcorp','TechCorp Global',199900,19990,'USD','PAID','Enterprise Annual Subscription - Year 2',NOW()-INTERVAL '13 months',NOW()-INTERVAL '12 months',NOW()-INTERVAL '12 months'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202407-0001');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202507-0002','techcorp','TechCorp Global',199900,19990,'USD','PAID','Enterprise Annual Subscription - Year 3',NOW()-INTERVAL '1 month',NOW(),NOW()-INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202507-0002');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202507-0003','globalhr','Global HR Solutions',7900,790,'USD','PAID','Professional Monthly - August 2025',NOW()-INTERVAL '33 days',NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202507-0003');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202508-0004','globalhr','Global HR Solutions',7900,790,'USD','SENT','Professional Monthly - September 2025',NOW()-INTERVAL '5 days',NOW()+INTERVAL '25 days',NULL
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202508-0004');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202506-0005','smallbiz','SmallBiz Hub',2900,290,'USD','PAID','Starter Monthly - July 2025',NOW()-INTERVAL '40 days',NOW()-INTERVAL '37 days',NOW()-INTERVAL '37 days'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202506-0005');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202508-0006','smallbiz','SmallBiz Hub',2900,290,'USD','SENT','Starter Monthly - August 2025',NOW()-INTERVAL '4 days',NOW()+INTERVAL '26 days',NULL
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202508-0006');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202505-0007','retailpro','Retail Pro Group',199900,19990,'USD','PAID','Enterprise Annual Subscription',NOW()-INTERVAL '3 months',NOW()-INTERVAL '2 months' + INTERVAL '20 days',NOW()-INTERVAL '2 months' + INTERVAL '18 days'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202505-0007');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202502-0008','cloudfirst','CloudFirst Inc',7900,790,'USD','OVERDUE','Professional Monthly - March 2025',NOW()-INTERVAL '160 days',NOW()-INTERVAL '130 days',NULL
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202502-0008');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202501-0009','megacorp','MegaCorp Industries',199900,19990,'USD','PAID','Enterprise Annual Subscription',NOW()-INTERVAL '7 months',NOW()-INTERVAL '6 months',NOW()-INTERVAL '6 months'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202501-0009');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at)
SELECT 'INV-202508-0010','devagency','DevAgency Co',0,0,'CAD','DRAFT','Free Plan Activation',NOW()-INTERVAL '2 days',NOW()+INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202508-0010');

INSERT INTO invoices (invoice_number, tenant_code, company_name, amount_cents, tax_amount_cents, currency, status, description, issued_at, due_at, paid_at)
SELECT 'INV-202508-0011','globalhr','Global HR Solutions',7900,790,'USD','REFUNDED','Professional Monthly - Refund',NOW()-INTERVAL '60 days',NOW()-INTERVAL '57 days',NOW()-INTERVAL '55 days'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'INV-202508-0011');

-- ── Payments ─────────────────────────────────────────────────────────────
INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at)
SELECT 'techcorp','TechCorp Global',219890,0,'USD','COMPLETED','STRIPE','Enterprise Annual - Year 2',(SELECT id FROM invoices WHERE invoice_number='INV-202407-0001'),NOW()-INTERVAL '12 months',NOW()-INTERVAL '12 months'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='techcorp' AND created_at::date = (NOW()-INTERVAL '12 months')::date);

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at)
SELECT 'techcorp','TechCorp Global',219890,0,'USD','COMPLETED','STRIPE','Enterprise Annual - Year 3',(SELECT id FROM invoices WHERE invoice_number='INV-202507-0002'),NOW()-INTERVAL '28 days',NOW()-INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='techcorp' AND created_at::date = (NOW()-INTERVAL '28 days')::date);

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at)
SELECT 'globalhr','Global HR Solutions',8690,0,'USD','COMPLETED','STRIPE','Professional Monthly - Aug',(SELECT id FROM invoices WHERE invoice_number='INV-202507-0003'),NOW()-INTERVAL '30 days',NOW()-INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='globalhr' AND created_at::date = (NOW()-INTERVAL '30 days')::date);

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at)
SELECT 'smallbiz','SmallBiz Hub',3190,0,'USD','COMPLETED','STRIPE','Starter Monthly - Jul',(SELECT id FROM invoices WHERE invoice_number='INV-202506-0005'),NOW()-INTERVAL '37 days',NOW()-INTERVAL '37 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='smallbiz' AND created_at::date = (NOW()-INTERVAL '37 days')::date);

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at)
SELECT 'retailpro','Retail Pro Group',219890,0,'USD','COMPLETED','STRIPE','Enterprise Annual',(SELECT id FROM invoices WHERE invoice_number='INV-202505-0007'),NOW()-INTERVAL '2 months'+INTERVAL '18 days',NOW()-INTERVAL '2 months'+INTERVAL '18 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='retailpro' AND amount_cents=219890);

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, failure_reason, created_at)
SELECT 'cloudfirst','CloudFirst Inc',8690,0,'USD','FAILED','STRIPE','Professional Monthly - overdue',(SELECT id FROM invoices WHERE invoice_number='INV-202502-0008'),'Card declined: insufficient funds',NOW()-INTERVAL '130 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='cloudfirst' AND status='FAILED');

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at)
SELECT 'megacorp','MegaCorp Industries',219890,0,'USD','COMPLETED','STRIPE','Enterprise Annual',(SELECT id FROM invoices WHERE invoice_number='INV-202501-0009'),NOW()-INTERVAL '6 months',NOW()-INTERVAL '6 months'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='megacorp' AND amount_cents=219890);

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, created_at, processed_at, refunded_at)
SELECT 'globalhr','Global HR Solutions',8690,8690,'USD','REFUNDED','STRIPE','Professional Monthly - Refund issued',(SELECT id FROM invoices WHERE invoice_number='INV-202508-0011'),NOW()-INTERVAL '55 days',NOW()-INTERVAL '55 days',NOW()-INTERVAL '52 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='globalhr' AND status='REFUNDED');

INSERT INTO payments (tenant_code, company_name, amount_cents, refunded_amount_cents, currency, status, method, description, invoice_id, failure_reason, created_at)
SELECT 'startupx','StartupX Labs',2900,0,'USD','FAILED','STRIPE','Starter Trial conversion attempt',0,'Card requires authentication - 3DS failed',NOW()-INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE tenant_code='startupx' AND status='FAILED');

