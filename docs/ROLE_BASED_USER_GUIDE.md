# HUMANT Role-Based User Guide

## 1. Purpose

This guide explains how each user role should use HUMANT in daily operations. It is designed for onboarding new team members and standardizing operational workflows.

For module-level details, see:

- [docs/MODULES_USER_GUIDE.md](MODULES_USER_GUIDE.md)

## 2. Role Matrix (Recommended)

1. Admin
- Full access to platform setup, users, roles, and all business modules.

2. HR Manager
- Access to employee lifecycle, recruitment, onboarding, attendance/leave, and compliance modules.

3. Payroll/Finance Officer
- Access to salary, payslip, loan, advance salary, and expense modules.

4. Department Manager / Team Lead
- Access to team attendance visibility, interview participation, performance input, and approvals (where configured).

5. Employee (Self-Service)
- Access to profile details, leave requests, notices, payslip visibility, and assigned tasks (if enabled in the current setup).

## 3. Admin Guide

### 3.1 Typical Responsibilities

- Set up master data (country, city, department, designation, leave types, contract types)
- Configure user accounts and roles
- Monitor data quality and process completion across modules
- Oversee security and system-level settings

### 3.2 First-Day Checklist (Admin)

1. Create departments and designations.
2. Configure leave types and contract types.
3. Create HR, Payroll, and Manager user accounts.
4. Verify role assignment and login access.
5. Publish base holiday calendar.
6. Review initial dashboard/module access.

### 3.3 Weekly Checklist (Admin)

1. Audit newly created users and role assignments.
2. Validate pending approvals and unresolved complaints/warnings.
3. Review recruitment pipeline status and stuck stages.
4. Confirm key records are complete (contracts, documents, salary setup).

## 4. HR Manager Guide

### 4.1 Typical Responsibilities

- Manage employee records and lifecycle events
- Handle recruitment process from job posting to onboarding
- Process leave and attendance exceptions
- Manage compliance records (warnings, complaints, notices, termination data)

### 4.2 Daily Workflow (HR)

1. Review attendance anomalies and pending leave actions.
2. Process candidate pipeline updates and interview schedules.
3. Maintain onboarding/offboarding tasks.
4. Publish announcements or internal communications.
5. Validate documents uploaded for new or updated records.

### 4.3 Monthly Workflow (HR)

1. Reconcile headcount changes (new hires, resignations, terminations).
2. Prepare HR reports for management review.
3. Ensure all personnel contracts and mandatory documents are current.
4. Coordinate with payroll before salary processing cycle.

## 5. Payroll/Finance Officer Guide

### 5.1 Typical Responsibilities

- Maintain salary records and payroll data integrity
- Generate payslips and process reimbursements
- Track loan repayment and salary advances
- Validate expense claims for payout

### 5.2 Payroll Cycle Workflow

1. Confirm finalized attendance and leave status for payroll period.
2. Validate salary adjustments and one-time elements.
3. Process advances, loans, and approved expenses.
4. Generate payslips and perform spot checks.
5. Release payroll outputs and archive records.

### 5.3 Controls Checklist

1. Verify no active employee is missing salary configuration.
2. Ensure approved advances/loans are reflected in deductions.
3. Confirm rejected expenses are excluded.
4. Archive monthly payroll reports and audit logs.

## 6. Department Manager / Team Lead Guide

### 6.1 Typical Responsibilities

- Validate team attendance and support approvals
- Participate in interviews and hiring feedback
- Provide performance input and training recommendations
- Track team-level announcements and action items

### 6.2 Weekly Workflow (Manager)

1. Review team attendance trends and exceptions.
2. Provide leave/interview/performance feedback where required.
3. Track assigned training participation and completion.
4. Escalate compliance or workplace concerns promptly.

## 7. Employee Guide (Self-Service)

### 7.1 Typical Actions

- View and update permitted profile details
- Submit leave requests
- View notices, announcements, and assigned events/training
- Access payslip records (where enabled)

### 7.2 Good Practices for Employees

1. Keep personal details accurate and updated.
2. Submit leave requests early and with clear notes.
3. Check announcements regularly.
4. Keep document submissions complete and legible.

## 8. Suggested Permission Boundaries

1. Only Admin should create/delete users and roles.
2. HR should own employee lifecycle and recruitment modules.
3. Payroll role should not modify recruitment pipeline stages.
4. Managers should have team-level access, not company-wide sensitive finance data.
5. Employees should have least-privilege access to self-service capabilities.

## 9. Onboarding Plan by Role

### 9.1 Day 1

1. Account setup and password reset.
2. Role-based module walkthrough.
3. Hands-on practice with 2 to 3 common tasks.

### 9.2 Week 1

1. Supervised execution of real tasks.
2. Checklist-based validation by Admin/HR lead.
3. Clarify approval paths and escalation routes.

### 9.3 End of Month 1

1. Access review and permission tuning.
2. Process quality review (errors, delays, rework).
3. Targeted retraining on recurring mistakes.

## 10. Operational KPIs by Role

1. Admin
- User provisioning SLA
- Role assignment accuracy

2. HR
- Time to hire
- Leave request turnaround time
- Onboarding completion rate

3. Payroll
- Payroll accuracy rate
- Payslip release timeliness

4. Manager
- Performance review completion rate
- Team attendance compliance

5. Employee
- Self-service adoption rate
- On-time leave submission quality

## 11. Module Permission Matrix

Legend:

- V: View
- C: Create
- E: Edit
- A: Approve/Authorize
- X: Export/Download reports

Notes:

- This is a recommended default matrix and can be adjusted per company policy.
- Empty cells mean no default access.

| Module | Admin | HR Manager | Payroll/Finance | Manager/Lead | Employee |
|---|---|---|---|---|---|
| User | V,C,E,A,X | V |  |  |  |
| Shared | V,C,E,A,X | V,C,E | V | V | V |
| Country | V,C,E,A,X | V,C,E | V | V | V |
| City | V,C,E,A,X | V,C,E | V | V | V |
| Department (Departement) | V,C,E,A,X | V,C,E | V | V | V |
| Designation | V,C,E,A,X | V,C,E | V | V | V |
| Education-Level | V,C,E,A,X | V,C,E | V | V | V |
| Contract-Type | V,C,E,A,X | V,C,E | V | V |  |
| Award-Type | V,C,E,A,X | V,C,E | V | V,C,E |  |
| Leave-Type | V,C,E,A,X | V,C,E | V | V |  |
| Training-Type | V,C,E,A,X | V,C,E | V | V,C,E | V |
| Termination Type (Ltermination-Type) | V,C,E,A,X | V,C,E | V | V |  |
| Employee | V,C,E,A,X | V,C,E,A,X | V | V | V,E |
| Document | V,C,E,A,X | V,C,E,A | V | V | V,C,E |
| Contract | V,C,E,A,X | V,C,E,A | V | V | V |
| Attendance | V,C,E,A,X | V,C,E,A,X | V | V,A | V |
| Leave | V,C,E,A,X | V,C,E,A,X | V | V,A | V,C,E |
| Holiday | V,C,E,A,X | V,C,E | V | V | V |
| Warning | V,C,E,A,X | V,C,E,A |  | V | V |
| Complaint | V,C,E,A,X | V,C,E,A |  | V | V,C |
| Notice | V,C,E,A,X | V,C,E,A,X | V | V | V |
| Resign | V,C,E,A,X | V,C,E,A | V | V,A | V,C |
| Termination | V,C,E,A,X | V,C,E,A | V | V | V |
| Onboarding | V,C,E,A,X | V,C,E,A |  | V,C,E | V |
| Communication | V,C,E,A,X | V,C,E,A |  | V,C,E | V,C |
| Announcement | V,C,E,A,X | V,C,E,A,X | V | V,C,E | V |
| Event | V,C,E,A,X | V,C,E,A |  | V,C,E | V |
| Salary | V,C,E,A,X | V | V,C,E,A,X | V | V |
| Payslip | V,C,E,A,X | V | V,C,E,A,X | V | V,X |
| Advance Salary | V,C,E,A,X | V,C,E,A | V,C,E,A,X | V,A | V,C |
| Loan | V,C,E,A,X | V | V,C,E,A,X | V | V |
| Expense | V,C,E,A,X | V,C,E,A | V,C,E,A,X | V,A | V,C,E |
| Job | V,C,E,A,X | V,C,E,A,X |  | V,C,E | V |
| Job-Application | V,C,E,A,X | V,C,E,A,X |  | V,C,E | V,C |
| Candidate | V,C,E,A,X | V,C,E,A,X |  | V,C,E | V,C,E |
| Pipeline | V,C,E,A,X | V,C,E,A,X |  | V,C,E,A | V |
| Interview | V,C,E,A,X | V,C,E,A |  | V,C,E,A | V |
| Offer-Letter | V,C,E,A,X | V,C,E,A |  | V | V |
| Performance | V,C,E,A,X | V,C,E,A |  | V,C,E,A | V,E |
| Training | V,C,E,A,X | V,C,E,A |  | V,C,E,A | V,C,E |
| Launchplan | V,C,E,A,X | V,C,E,A |  | V,C,E,A | V |
| Award | V,C,E,A,X | V,C,E,A |  | V,C,E | V |
| Transfer (Transfert) | V,C,E,A,X | V,C,E,A | V | V,A | V |

## 12. Related Docs

- [README.md](../README.md)
- [docs/MODULES_USER_GUIDE.md](MODULES_USER_GUIDE.md)