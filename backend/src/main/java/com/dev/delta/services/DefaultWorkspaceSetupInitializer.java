package com.dev.delta.services;

import com.dev.delta.entities.ApprovalFlowDefinition;
import com.dev.delta.entities.Company;
import com.dev.delta.entities.CustomFieldDefinition;
import com.dev.delta.entities.Departement;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Team;
import com.dev.delta.entities.User;
import com.dev.delta.entities.WorkflowRuleDefinition;
import com.dev.delta.entities.WorkspaceConfiguration;
import com.dev.delta.repositories.ApprovalFlowDefinitionRepository;
import com.dev.delta.repositories.CustomFieldDefinitionRepository;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TeamRepository;
import com.dev.delta.repositories.UserRepository;
import com.dev.delta.repositories.WorkflowRuleDefinitionRepository;
import com.dev.delta.repositories.WorkspaceConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DefaultWorkspaceSetupInitializer implements CommandLineRunner {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private WorkspaceConfigurationService workspaceConfigurationService;

    @Autowired
    private WorkspaceConfigurationRepository workspaceConfigurationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartementRepository departementRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private CustomFieldDefinitionRepository customFieldDefinitionRepository;

    @Autowired
    private ApprovalFlowDefinitionRepository approvalFlowDefinitionRepository;

    @Autowired
    private WorkflowRuleDefinitionRepository workflowRuleDefinitionRepository;

    @Autowired
    private RoleAccessPolicyService roleAccessPolicyService;

    @Override
    public void run(String... args) {
        Company defaultCompany = companyService.ensureDefaultCompany();
        ensureWorkspaceConfiguration(defaultCompany);
        backfillCompanyAssignments(defaultCompany);
        roleAccessPolicyService.ensureDefaultPolicies();
        seedCustomFields();
        seedApprovalFlows();
        seedWorkflowRules();
    }

    private void ensureWorkspaceConfiguration(Company defaultCompany) {
        WorkspaceConfiguration configuration = workspaceConfigurationService.getConfiguration();
        boolean shouldSave = false;

        if (configuration.getDefaultCompany() == null) {
            configuration.setDefaultCompany(defaultCompany);
            shouldSave = true;
        }

        if (isBlank(configuration.getCompanyName())) {
            configuration.setCompanyName(defaultCompany.getName());
            shouldSave = true;
        }

        if (isBlank(configuration.getCompanyEmail())) {
            configuration.setCompanyEmail(defaultCompany.getEmail());
            shouldSave = true;
        }

        if (isBlank(configuration.getCompanyAddress())) {
            configuration.setCompanyAddress(defaultCompany.getAddress());
            shouldSave = true;
        }

        if (shouldSave) {
            workspaceConfigurationRepository.save(configuration);
        }
    }

    private void backfillCompanyAssignments(Company defaultCompany) {
        List<User> usersToUpdate = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            if (user.getCompany() == null) {
                user.setCompany(defaultCompany);
                usersToUpdate.add(user);
            }
        }
        if (!usersToUpdate.isEmpty()) {
            userRepository.saveAll(usersToUpdate);
        }

        List<Employee> employeesToUpdate = new ArrayList<>();
        for (Employee employee : employeeRepository.findAll()) {
            if (employee.getCompany() == null) {
                employee.setCompany(defaultCompany);
                employeesToUpdate.add(employee);
            }
        }
        if (!employeesToUpdate.isEmpty()) {
            employeeRepository.saveAll(employeesToUpdate);
        }

        List<Departement> departementsToUpdate = new ArrayList<>();
        for (Departement departement : departementRepository.findAll()) {
            if (departement.getCompany() == null) {
                departement.setCompany(defaultCompany);
                departementsToUpdate.add(departement);
            }
        }
        if (!departementsToUpdate.isEmpty()) {
            departementRepository.saveAll(departementsToUpdate);
        }

        List<Team> teamsToUpdate = new ArrayList<>();
        for (Team team : teamRepository.findAll()) {
            if (team.getCompany() == null) {
                team.setCompany(defaultCompany);
                teamsToUpdate.add(team);
            }
        }
        if (!teamsToUpdate.isEmpty()) {
            teamRepository.saveAll(teamsToUpdate);
        }
    }

    private void seedCustomFields() {
        if (customFieldDefinitionRepository.count() > 0) {
            return;
        }

        List<CustomFieldDefinition> defaultFields = new ArrayList<>();
        defaultFields.add(buildCustomField(
            "Emergency Contact Relationship",
            "emergencyContactRelationship",
            "employee",
            "text",
            Boolean.FALSE,
            "Relationship to employee",
            null
        ));
        defaultFields.add(buildCustomField(
            "Cost Center",
            "costCenter",
            "employee",
            "text",
            Boolean.FALSE,
            "Finance cost center",
            null
        ));
        defaultFields.add(buildCustomField(
            "Leave Reason Code",
            "leaveReasonCode",
            "leave",
            "select",
            Boolean.FALSE,
            "Select a reason",
            "Medical,Family,Travel,Personal"
        ));
        customFieldDefinitionRepository.saveAll(defaultFields);
    }

    private void seedApprovalFlows() {
        if (approvalFlowDefinitionRepository.count() > 0) {
            return;
        }

        List<ApprovalFlowDefinition> defaultFlows = new ArrayList<>();
        defaultFlows.add(buildApprovalFlow(
            "Leave Approval",
            "leave",
            "Manager review -> HR approval",
            "Standard two-step leave approval flow"
        ));
        defaultFlows.add(buildApprovalFlow(
            "Expense Approval",
            "expense-claim",
            "Manager review -> Finance approval",
            "Expense claim review with finance sign-off"
        ));
        defaultFlows.add(buildApprovalFlow(
            "Exit Approval",
            "exit-request",
            "Manager review -> HR approval -> Finance clearance",
            "Exit workflow covering approvals and settlement"
        ));
        approvalFlowDefinitionRepository.saveAll(defaultFlows);
    }

    private void seedWorkflowRules() {
        if (workflowRuleDefinitionRepository.count() > 0) {
            return;
        }

        List<WorkflowRuleDefinition> defaultRules = new ArrayList<>();
        defaultRules.add(buildWorkflowRule(
            "Contract Expiry Reminder",
            "contract",
            "daily-scan",
            "daysUntilEndDate <= reminderWindowDays",
            "createReminder('Contract expiry')",
            "Alert HR when a contract is close to expiry"
        ));
        defaultRules.add(buildWorkflowRule(
            "Visa Expiry Reminder",
            "visa",
            "daily-scan",
            "daysUntilExpiry <= reminderWindowDays",
            "createReminder('Visa expiry')",
            "Alert HR when a visa is close to expiry"
        ));
        defaultRules.add(buildWorkflowRule(
            "Approved Leave Balance Refresh",
            "leave",
            "leave-approved",
            "status == APPROVED",
            "recalculateLeaveBalance(employeeId)",
            "Refresh leave balances after approvals"
        ));
        workflowRuleDefinitionRepository.saveAll(defaultRules);
    }

    private CustomFieldDefinition buildCustomField(
        String label,
        String fieldKey,
        String targetModule,
        String fieldType,
        Boolean required,
        String placeholderText,
        String optionsCsv
    ) {
        CustomFieldDefinition field = new CustomFieldDefinition();
        field.setLabel(label);
        field.setFieldKey(fieldKey);
        field.setTargetModule(targetModule);
        field.setFieldType(fieldType);
        field.setRequired(required);
        field.setActive(Boolean.TRUE);
        field.setPlaceholderText(placeholderText);
        field.setOptionsCsv(optionsCsv);
        return field;
    }

    private ApprovalFlowDefinition buildApprovalFlow(
        String name,
        String targetModule,
        String stageSequence,
        String description
    ) {
        ApprovalFlowDefinition flow = new ApprovalFlowDefinition();
        flow.setName(name);
        flow.setTargetModule(targetModule);
        flow.setStageSequence(stageSequence);
        flow.setDescription(description);
        flow.setActive(Boolean.TRUE);
        return flow;
    }

    private WorkflowRuleDefinition buildWorkflowRule(
        String name,
        String targetModule,
        String triggerEvent,
        String conditionExpression,
        String actionExpression,
        String description
    ) {
        WorkflowRuleDefinition rule = new WorkflowRuleDefinition();
        rule.setName(name);
        rule.setTargetModule(targetModule);
        rule.setTriggerEvent(triggerEvent);
        rule.setConditionExpression(conditionExpression);
        rule.setActionExpression(actionExpression);
        rule.setDescription(description);
        rule.setActive(Boolean.TRUE);
        return rule;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}