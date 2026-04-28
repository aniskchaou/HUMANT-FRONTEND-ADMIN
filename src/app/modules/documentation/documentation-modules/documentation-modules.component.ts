import { Component } from '@angular/core';

interface ModuleDocItem {
  name: string;
  description: string;
  primaryUsers: string;
}

interface ModuleDocGroup {
  title: string;
  objective: string;
  operationalOwner: string;
  modules: ModuleDocItem[];
}

@Component({
  selector: 'app-documentation-modules',
  templateUrl: './documentation-modules.component.html',
  styleUrls: ['./documentation-modules.component.css'],
})
export class DocumentationModulesComponent {
  readonly moduleGroups: ModuleDocGroup[] = [
    {
      title: 'People & Structure',
      objective: 'Maintain accurate workforce master data and reporting hierarchy.',
      operationalOwner: 'HR Operations',
      modules: [
        {
          name: 'Employee',
          description: 'Central system of record for employee lifecycle data including personal profile, joining details, organizational assignment, and employment history. HR teams use it to maintain data quality, support audits, and provide accurate downstream inputs to payroll, leave, and performance workflows.',
          primaryUsers: 'HR Operations',
        },
        {
          name: 'Onboarding',
          description: 'Coordinates pre-joining and post-joining activities through structured checklists, ownership assignment, and due-date tracking. This module ensures each new hire completes mandatory steps such as documentation, policy acknowledgment, and system provisioning before full operational handover.',
          primaryUsers: 'HR and Hiring Managers',
        },
        {
          name: 'Document',
          description: 'Maintains document governance for employee records, including identity proofs, offer/contract letters, and compliance artifacts. Teams use it to control document versions, verify completeness, and retain evidence required for legal or internal audits.',
          primaryUsers: 'HR and Compliance',
        },
        {
          name: 'User',
          description: 'Manages platform access lifecycle, including user creation, role assignment, and account status controls. Administrators use this module to enforce least-privilege access, avoid segregation-of-duties conflicts, and keep access rights aligned with job responsibilities.',
          primaryUsers: 'System Admin and HR Admin',
        },
        {
          name: 'Department (internal: Departement)',
          description: 'Defines department master data used across workforce planning, reporting, and process ownership. Accurate department setup enables clean reporting lines, manager mapping, and consistent assignment of employees, designations, and budgets.',
          primaryUsers: 'HR Operations',
        },
        {
          name: 'Designation',
          description: 'Maintains official role titles and maps them to department structures to standardize organization design. This module supports hiring consistency, workforce analytics, and proper classification of employees in reporting and approval chains.',
          primaryUsers: 'HR Operations',
        },
        {
          name: 'Education-Level',
          description: 'Standardizes education qualification taxonomy used in recruitment screening and employee records. It improves comparability across candidates and supports filtering, compliance checks, and competency-based hiring decisions.',
          primaryUsers: 'HR and Recruiters',
        },
        {
          name: 'Contract',
          description: 'Records employment agreements with effective dates, terms, and current status for each employee. HR uses it to monitor renewals, contract transitions, and policy compliance, while ensuring contract data stays aligned with payroll and legal requirements.',
          primaryUsers: 'HR Operations',
        },
        {
          name: 'Contract-Type',
          description: 'Maintains reference categories for employment relationships, such as full-time, part-time, temporary, and internship. Standard contract types improve policy enforcement, reporting clarity, and consistent contract creation across HR teams.',
          primaryUsers: 'HR Admin',
        },
      ],
    },
    {
      title: 'Talent & Growth',
      objective: 'Drive hiring quality, skill development, and performance consistency.',
      operationalOwner: 'Talent Acquisition and People Development',
      modules: [
        {
          name: 'Job',
          description: 'Creates and publishes requisitions with role scope, qualification requirements, and hiring priorities. Recruiters and hiring managers use this module to keep vacancy status accurate and ensure candidate pipelines align with approved workforce plans.',
          primaryUsers: 'Recruiters and HR',
        },
        {
          name: 'Job-Application',
          description: 'Captures applicant submissions and links each application to a job opening and pipeline stage. This enables consistent screening, traceable candidate communication history, and measurable conversion metrics across the hiring funnel.',
          primaryUsers: 'Recruiters',
        },
        {
          name: 'Candidate',
          description: 'Maintains candidate profiles including contact details, resume data, assessment notes, and stage outcomes. Teams use it as the single source for hiring decisions, interview coordination, and talent pool reuse for future openings.',
          primaryUsers: 'Recruiters and Hiring Team',
        },
        {
          name: 'Interview',
          description: 'Schedules interviews by role and stage, assigns interview panels, and captures structured feedback. The module improves decision quality by centralizing interviewer notes and maintaining a clear history of evaluation outcomes.',
          primaryUsers: 'Recruiters and Managers',
        },
        {
          name: 'Offer-Letter',
          description: 'Prepares and issues formal offers with compensation terms, joining timelines, and approval trails. HR teams track accept/decline outcomes and ensure offers are synchronized with onboarding and employee record creation.',
          primaryUsers: 'HR and Talent Acquisition',
        },
        {
          name: 'Pipeline',
          description: 'Tracks candidate movement through hiring stages from initial screening to final decision. It provides visibility into bottlenecks, stage aging, and conversion ratios, helping teams optimize recruitment cycle time and quality.',
          primaryUsers: 'Talent Acquisition',
        },
        {
          name: 'Training',
          description: 'Plans and executes learning programs with participant assignment, schedule control, and completion tracking. HR and managers use it to close skill gaps, support compliance training, and monitor development outcomes.',
          primaryUsers: 'HR Development and Managers',
        },
        {
          name: 'Training-Type',
          description: 'Defines standardized categories for learning programs such as compliance, technical, onboarding, and leadership training. This improves reporting consistency and helps segment training effectiveness by program type.',
          primaryUsers: 'HR Development',
        },
        {
          name: 'Performance',
          description: 'Supports structured performance cycles with goals, feedback, evaluation notes, and review outcomes. Managers and HR use it to drive accountability, identify development priorities, and support compensation or promotion decisions.',
          primaryUsers: 'HR and Reporting Managers',
        },
        {
          name: 'Award',
          description: 'Manages employee recognition records and links awards to documented contributions or milestones. It helps organizations reinforce performance culture and maintain transparent recognition history for internal communication and reporting.',
          primaryUsers: 'HR and Management',
        },
        {
          name: 'Award-Type',
          description: 'Maintains award category definitions used by recognition workflows and annual programs. Standardizing award types improves consistency in recognition criteria and ensures comparable reporting across departments.',
          primaryUsers: 'HR Admin',
        },
      ],
    },
    {
      title: 'Time, Finance & Governance',
      objective: 'Control attendance, financial transactions, and policy-sensitive workflows.',
      operationalOwner: 'HR, Payroll, and Compliance',
      modules: [
        {
          name: 'Attendance',
          description: 'Maintains daily attendance records, shift adherence, and exception handling for missed or incorrect logs. HR and managers use it as the operational baseline for payroll inputs, leave validation, and workforce productivity review.',
          primaryUsers: 'HR and Managers',
        },
        {
          name: 'Leave',
          description: 'Handles leave request lifecycle from submission to approval and final balance impact. It provides clear visibility into entitlements, planned absences, and approval accountability for managers and HR teams.',
          primaryUsers: 'Employees, Managers, HR',
        },
        {
          name: 'Leave-Type',
          description: 'Defines leave category master data and associated policy references such as annual leave, sick leave, and unpaid leave. This standardization ensures fair policy application and accurate leave analytics.',
          primaryUsers: 'HR Admin',
        },
        {
          name: 'Holiday',
          description: 'Maintains official holiday calendar by region or organization scope and feeds time-based workflows. Correct holiday configuration prevents attendance miscalculations and improves planning for staffing and payroll timelines.',
          primaryUsers: 'HR Operations',
        },
        {
          name: 'Salary',
          description: 'Maintains employee compensation structures, revisions, and effective-date history. Payroll and HR teams rely on this module to control compensation accuracy and keep salary decisions auditable and policy-compliant.',
          primaryUsers: 'Payroll and HR',
        },
        {
          name: 'Payslip',
          description: 'Generates payroll statements for each cycle with salary components, deductions, and net pay details. It provides a transparent communication artifact for employees and a controlled release point for payroll operations.',
          primaryUsers: 'Payroll and Employees',
        },
        {
          name: 'Loan',
          description: 'Manages employee loan lifecycle including sanction details, installment plans, and balance tracking. Payroll teams use this module to apply deductions correctly and maintain compliance-grade repayment records.',
          primaryUsers: 'Payroll and Finance',
        },
        {
          name: 'Expense',
          description: 'Handles reimbursement claim submission, validation, and approval workflow with claim-level documentation. It supports financial control by maintaining traceable approvals and ensuring only eligible expenses are reimbursed.',
          primaryUsers: 'Employees and Finance',
        },
        {
          name: 'Advance Salary',
          description: 'Processes salary advance requests from application to approval and recovery planning. This module helps HR and payroll enforce policy caps, deduction schedules, and repayment transparency for each employee.',
          primaryUsers: 'Employees, HR, Payroll',
        },
        {
          name: 'Resign',
          description: 'Tracks voluntary separation cases including resignation date, notice period, and handover milestones. It ensures structured offboarding, accountability for pending tasks, and timely downstream payroll and documentation closure.',
          primaryUsers: 'HR and Managers',
        },
        {
          name: 'Termination',
          description: 'Records involuntary separation actions with reason codes, approvals, and final closure documentation. Compliance teams use this module to preserve decision evidence and ensure policy and legal requirements are met.',
          primaryUsers: 'HR and Compliance',
        },
        {
          name: 'Termination Type (internal: Ltermination-Type)',
          description: 'Defines standardized reason taxonomy for termination cases to support consistent classification. Accurate reason coding improves compliance reporting, governance visibility, and root-cause analysis of attrition patterns.',
          primaryUsers: 'HR Admin',
        },
        {
          name: 'Warning',
          description: 'Captures formal disciplinary warnings, escalation details, and corrective follow-up actions. This module provides a documented trail for employee conduct management and supports fair, policy-based decision making.',
          primaryUsers: 'HR and Compliance',
        },
        {
          name: 'Complaint',
          description: 'Registers workplace complaints and tracks investigation ownership, evidence, and resolution outcomes. It helps protect process integrity by ensuring issues are handled consistently and closure rationale is documented.',
          primaryUsers: 'HR and Compliance',
        },
        {
          name: 'Notice',
          description: 'Publishes formal notices for policy changes, compliance reminders, and workforce communications. Teams use this module to standardize communication history and ensure important updates are distributed consistently.',
          primaryUsers: 'HR and Admin',
        },
        {
          name: 'Communication',
          description: 'Maintains targeted communication logs for teams, departments, or individuals with contextual tracking. It improves operational clarity by centralizing critical messages and preserving communication reference history.',
          primaryUsers: 'HR and Team Leads',
        },
        {
          name: 'Announcement',
          description: 'Broadcasts organization-wide updates such as policy launches, events, and leadership announcements. This module ensures broad visibility, reduces message fragmentation, and supports transparent internal communication.',
          primaryUsers: 'Admin and HR',
        },
        {
          name: 'Event',
          description: 'Plans and tracks internal events with schedule, audience, and participation status. HR teams use it to coordinate engagement activities and keep event communication aligned with organizational calendar planning.',
          primaryUsers: 'HR and Admin',
        },
        {
          name: 'Launchplan',
          description: 'Tracks rollout plans for strategic initiatives with milestone status, owner accountability, and timeline controls. It helps leadership and HR coordinate cross-functional initiatives and monitor execution readiness.',
          primaryUsers: 'Management and HR',
        },
        {
          name: 'Transfer (internal: Transfert)',
          description: 'Processes internal employee transfers across departments, roles, or locations with effective dates. The module ensures organizational records, reporting lines, and downstream compensation data remain synchronized after movement.',
          primaryUsers: 'HR Operations',
        },
      ],
    },
    {
      title: 'Master Data and Platform Controls',
      objective: 'Maintain global references and reusable platform services for consistent operations.',
      operationalOwner: 'System Admin and HR Admin',
      modules: [
        {
          name: 'Country',
          description: 'Maintains country master records used by location-aware modules and employee address structures. Standard country references reduce data inconsistency and improve quality of geo-based reporting and compliance data.',
          primaryUsers: 'Admin and HR',
        },
        {
          name: 'City',
          description: 'Maintains city master records linked to country definitions for consistent location capture. It supports cleaner profile data, reliable location filtering, and reduced duplication in address-related workflows.',
          primaryUsers: 'Admin and HR',
        },
        {
          name: 'Shared',
          description: 'Provides common UI components, reusable helpers, and cross-module utility patterns used by the application. This foundational module improves consistency, accelerates feature delivery, and reduces maintenance overhead across the product.',
          primaryUsers: 'Platform and Development Team',
        },
      ],
    },
  ];

  readonly lifecycleFlows = [
    {
      title: 'New Hire Workflow',
      steps: [
        'Create requisition and job record',
        'Process candidate pipeline and interviews',
        'Issue offer and initiate onboarding',
        'Finalize employee profile, contract, and salary',
      ],
    },
    {
      title: 'Monthly Payroll Workflow',
      steps: [
        'Lock attendance and leave period',
        'Validate salary changes, loans, and advances',
        'Review expense approvals and deductions',
        'Generate and release payslips',
      ],
    },
    {
      title: 'Employee Exit Workflow',
      steps: [
        'Register resignation or termination case',
        'Track notice period and handover activities',
        'Close payroll adjustments and settlements',
        'Archive final documents and status',
      ],
    },
  ];
}
