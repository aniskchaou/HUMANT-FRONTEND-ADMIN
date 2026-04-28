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
INSERT INTO country (name) VALUES ('USA');
INSERT INTO country (name) VALUES ('France');

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
INSERT INTO roles (name) VALUES ('Admin');
INSERT INTO roles (name) VALUES ('User');

-- Example data for JobPosition
INSERT INTO job_positions (title, description, location, open) VALUES ('Developer', 'Software Developer', 'Remote', true);
INSERT INTO job_positions (title, description, location, open) VALUES ('Manager', 'Team Manager', 'Onsite', true);

-- Example data for Skill
INSERT INTO skills (name, proficiency_level) VALUES ('Java', 'Expert');
INSERT INTO skills (name, proficiency_level) VALUES ('SQL', 'Intermediate');

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
INSERT INTO benefits (benefit_type, description, start_date, end_date, employee_id) VALUES ('Health', 'Health Insurance', '2025-01-01', '2025-12-31', 1);

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
INSERT INTO courses (title, description, start_date, end_date) VALUES ('Java Basics', 'Intro to Java', '2025-07-01', '2025-07-31');

-- Example data for Deduction
INSERT INTO deductions (type, amount, deduction_date, employee_id) VALUES ('Tax', 100, '2025-07-01', 1);

-- Example data for Document
INSERT INTO documents (document_name, document_type, file_path, employee_id, uploaded_at) VALUES ('Resume', 'PDF', '/files/resume.pdf', 1, '2025-07-01T10:00:00');

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
INSERT INTO emergency (emergency_contact, emergency_phone) VALUES ('Mom', '555-9999');

-- Example data for Enrollment
INSERT INTO enrollments (enrollment_date, status, employee_id) VALUES ('2025-07-01', 'ENROLLED', 1);

-- Example data for Event
INSERT INTO event (event_title, event_date_time, event_note) VALUES ('Company Meeting', '2025-07-10 10:00', 'Quarterly update');
INSERT INTO event (event_title, event_date_time, event_note) VALUES ('Leadership workshop', '2025-09-04 14:00', 'Cross-functional planning session for team leads and HR partners.');

-- Example data for ExitInterview
INSERT INTO exit_interviews (interview_date, interviewer_name, feedback, suggestions, employee_id) VALUES ('2025-07-01', 'Jane HR', 'Good', 'None', 1);

-- Example data for ExitRequest
INSERT INTO exit_requests (request_date, last_working_day, status) VALUES ('2025-07-01', '2025-07-31', 'PENDING');

-- Example data for ExpenseClaim
INSERT INTO expense_claims (claim_type, description, amount, claim_date, status) VALUES ('Travel', 'Taxi fare', 50, '2025-07-01', 'PENDING');

-- Example data for Feedback
INSERT INTO feedbacks (comment, given_by, given_at, type) VALUES ('Great job!', 'Manager', '2025-07-01T09:00:00', 'POSITIVE');

-- Example data for FinalSettlement
INSERT INTO final_settlements (settlement_date, total_amount, remarks, employee_id) VALUES ('2025-07-01', 2000, 'Final payment', 1);

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
INSERT INTO insurance_plans (provider_name, policy_number, coverage_details, start_date, end_date, employee_id) VALUES ('Axa', 'AXA123', 'Full', '2025-01-01', '2025-12-31', 1);

-- Example data for Interview
INSERT INTO interviews (scheduled_at, location, interviewer_name, status) VALUES ('2025-07-01T14:00:00', 'HQ', 'Jane HR', 'SCHEDULED');

-- Example data for JobApplication
INSERT INTO job_application (position_id, name, email, phone, applied_on, status) VALUES (1, 'Dave', 'dave@example.com', '555-8888', '2025-07-01', 'PENDING');

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
INSERT INTO learning_materials (title, description, material_type, file_path, uploaded_at, course_id) VALUES ('Intro Video', 'Welcome', 'Video', '/files/intro.mp4', '2025-07-01T08:00:00', 1);

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
INSERT INTO leave_requests (start_date, end_date, status) VALUES ('2025-07-10', '2025-07-15', 'PENDING');

-- Example data for LegalCompliance
INSERT INTO legal_compliances (compliance_type, description, effective_date, expiry_date, is_compliant, remarks) VALUES ('GDPR', 'Data protection', '2025-01-01', '2025-12-31', true, 'Compliant');

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
INSERT INTO managers (first_name, last_name, email, phone) VALUES ('Sarah', 'Connor', 'sarah@example.com', '555-7777');

-- Example data for Meeting
INSERT INTO meeting (title, date_time, room, note) VALUES ('Sprint Planning', '2025-07-15 09:00', 'Room 1', 'Plan next sprint');

-- Example data for Mentorship
INSERT INTO mentorships (mentor_id, mentee_id, start_date, end_date, status) VALUES (1, 2, '2025-07-01', '2025-12-31', 'Active');

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
INSERT INTO onboarding_checklists (task_name, completed, employee_id) VALUES ('Setup Email', true, 1);

-- Example data for Payroll
INSERT INTO payrolls (payroll_date, basic_salary, bonus, deductions, net_salary, employee_id) VALUES ('2025-07-31', 5000, 500, 100, 5400, 1);

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
INSERT INTO performance_reviews (reviewer_name, review_date, feedback, rating, employee_id) VALUES ('Manager', '2025-07-01', 'Excellent', 5, 1);

-- Example data for Policy
INSERT INTO policies (title, description, effective_date, expiry_date, document_path) VALUES ('Leave Policy', 'Annual leave policy', '2025-01-01', '2025-12-31', '/files/policy.pdf');

-- Example data for Position
INSERT INTO position (name) VALUES ('Developer');

-- Example data for Project
INSERT INTO projects (name, description, start_date, end_date, project_manager_id) VALUES ('Apollo', 'Moon mission', '2025-07-01', '2025-12-31', 1);

-- Example data for Referral
--INSERT INTO referrals (candidate_name, candidate_email, candidate_phone, referral_date, status) VALUES ('Eve', 'eve@example.com', '555-2222', '2025-07-01', 'PENDING');

-- Example data for Reimbursement
INSERT INTO reimbursements (description, amount, reimbursement_date, employee_id) VALUES ('Travel expenses', 100, '2025-07-01', 1);

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
INSERT INTO schedule (working_hours) VALUES ('9-5');

-- Example data for Shift
--INSERT INTO shifts (name, start_time, end_time, work_schedule_id) VALUES ('Morning', '08:00:00', '16:00:00', 1);

-- Example data for Skill-Employee join table
INSERT INTO employee_skills (employee_id, skill_id) VALUES (1, 1);

-- Example data for Structure
--INSERT INTO structure (structure_name, type_employee, country, scheduled_pay) VALUES ('Corp', 'Full Time', 'USA', 'Monthly');

-- Example data for Task
INSERT INTO tasks (title, description, due_date, status, assigned_to_id, assigned_by_id) VALUES ('Finish Report', 'Complete the Q2 report', '2025-07-20', 'PENDING', 1, 2);

-- Example data for Tax
INSERT INTO taxes (tax_type, amount, tax_date, employee_id) VALUES ('Income Tax', 200, '2025-07-01', 1);

-- Example data for Team
INSERT INTO teams (name, description, manager_id) VALUES ('Dev Team', 'Development', 1);

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
INSERT INTO trainer (first_name, last_name, contact_number, email, company, expertise, education_level_id, address) VALUES ('John', 'Smith', '555-3333', 'john.smith@example.com', 'Acme', 'Java', 1, '123 Main St');

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
INSERT INTO type_termination (name) VALUES ('Resignation');

-- Example data for TypeTraining
-- Seeded earlier to satisfy training foreign keys.

-- Example data for User
--INSERT INTO user (username, password) VALUES ('admin', 'admin123');

-- Example data for Visa
INSERT INTO visas (visa_type, visa_number, issue_date, expiry_date, employee_id) VALUES ('Work', 'VISA123', '2025-07-01', '2026-07-01', 1);

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
INSERT INTO working_location (work_address, work_location, homeworkingdistance) VALUES ('HQ', 'Office', '5km');

-- Example data for WorkPermit
INSERT INTO work_permit (visa_no, work_permit_no, visa_expire_date, work_permit_expiration_date, work_permit) VALUES ('VISA123', 'WP123', '2026-07-01', '2027-07-01', 'Active');

-- Example data for WorkSchedule
--INSERT INTO work_schedules (name) VALUES ('Regular 9-5');
