package com.dev.delta.services;

import com.dev.delta.dto.AutomationReminderDTO;
import com.dev.delta.dto.LeaveBalanceSummaryDTO;
import com.dev.delta.entities.ApprovalFlowDefinition;
import com.dev.delta.entities.Contract;
import com.dev.delta.entities.CustomFieldDefinition;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Leave;
import com.dev.delta.entities.TypeLeave;
import com.dev.delta.entities.Visa;
import com.dev.delta.entities.WorkflowRuleDefinition;
import com.dev.delta.repositories.ApprovalFlowDefinitionRepository;
import com.dev.delta.repositories.ContractRepository;
import com.dev.delta.repositories.CustomFieldDefinitionRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.LeaveRepository;
import com.dev.delta.repositories.TypeLeaveRepository;
import com.dev.delta.repositories.VisaRepository;
import com.dev.delta.repositories.WorkflowRuleDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorkspaceAutomationService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private TypeLeaveRepository typeLeaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private VisaRepository visaRepository;

    @Autowired
    private WorkspaceConfigurationService workspaceConfigurationService;

    @Autowired
    private CustomFieldDefinitionRepository customFieldDefinitionRepository;

    @Autowired
    private ApprovalFlowDefinitionRepository approvalFlowDefinitionRepository;

    @Autowired
    private WorkflowRuleDefinitionRepository workflowRuleDefinitionRepository;

    public List<LeaveBalanceSummaryDTO> getLeaveBalances() {
        List<Employee> employees = employeeRepository.findAllByOrderByFullNameAsc();
        List<TypeLeave> leaveTypes = typeLeaveRepository.findAll();
        List<Leave> leaves = leaveRepository.findAll();
        Map<String, Integer> usageByEmployeeAndType = new HashMap<>();

        for (Leave leave : leaves) {
            Long employeeId = leave.getEmployee() != null ? leave.getEmployee().getId() : null;
            Long leaveTypeId = leave.getTypeLeave() != null ? leave.getTypeLeave().getId() : null;

            if (employeeId == null || leaveTypeId == null) {
                continue;
            }

            usageByEmployeeAndType.merge(
                buildCompositeKey(employeeId, leaveTypeId),
                computeDurationDays(leave.getStartDate(), leave.getEndDate()),
                Integer::sum
            );
        }

        List<LeaveBalanceSummaryDTO> summaries = new ArrayList<>();

        for (Employee employee : employees) {
            for (TypeLeave leaveType : leaveTypes) {
                int allocatedDays = parseInteger(leaveType != null ? leaveType.getDays() : null);
                int usedDays = usageByEmployeeAndType.getOrDefault(
                    buildCompositeKey(employee.getId(), leaveType != null ? leaveType.getId() : null),
                    0
                );

                if (allocatedDays <= 0 && usedDays <= 0) {
                    continue;
                }

                int remainingDays = allocatedDays - usedDays;
                double usagePercent = allocatedDays > 0
                    ? Math.min(100D, Math.round((usedDays * 1000D) / allocatedDays) / 10D)
                    : 0D;

                summaries.add(
                    new LeaveBalanceSummaryDTO(
                        employee.getId(),
                        employee.getFullName(),
                        leaveType != null ? leaveType.getId() : null,
                        leaveType != null ? leaveType.getName() : "Leave type",
                        allocatedDays,
                        usedDays,
                        remainingDays,
                        usagePercent,
                        resolveLeaveBalanceStatus(allocatedDays, remainingDays)
                    )
                );
            }
        }

        summaries.sort(
            Comparator.comparingInt(LeaveBalanceSummaryDTO::getRemainingDays)
                .thenComparing(LeaveBalanceSummaryDTO::getEmployeeName, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(LeaveBalanceSummaryDTO::getLeaveTypeName, Comparator.nullsLast(String::compareToIgnoreCase))
        );
        return summaries;
    }

    public List<AutomationReminderDTO> getSmartReminders() {
        int reminderWindowDays = resolveReminderWindowDays();
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(reminderWindowDays);
        List<AutomationReminderDTO> reminders = new ArrayList<>();

        for (Contract contract : contractRepository.findAll()) {
            LocalDate dueDate = parseDate(contract.getEndDate());

            if (!shouldIncludeReminder(today, cutoff, dueDate)) {
                continue;
            }

            Employee employee = contract.getEmployee();
            long daysRemaining = ChronoUnit.DAYS.between(today, dueDate);
            reminders.add(
                new AutomationReminderDTO(
                    "Contract",
                    employee != null ? employee.getId() : null,
                    employee != null ? employee.getFullName() : "Employee",
                    "Contract expiry",
                    defaultText(contract.getSubject(), "Contract requires review"),
                    dueDate.toString(),
                    daysRemaining,
                    resolveReminderSeverity(daysRemaining),
                    "/contract"
                )
            );
        }

        for (Visa visa : visaRepository.findAll()) {
            LocalDate dueDate = visa.getExpiryDate();

            if (!shouldIncludeReminder(today, cutoff, dueDate)) {
                continue;
            }

            Employee employee = visa.getEmployee();
            long daysRemaining = ChronoUnit.DAYS.between(today, dueDate);
            reminders.add(
                new AutomationReminderDTO(
                    "Visa",
                    employee != null ? employee.getId() : null,
                    employee != null ? employee.getFullName() : "Employee",
                    "Visa expiry",
                    defaultText(visa.getVisaType(), "Visa") + " - " + defaultText(visa.getVisaNumber(), "Pending number"),
                    dueDate.toString(),
                    daysRemaining,
                    resolveReminderSeverity(daysRemaining),
                    "/employee"
                )
            );
        }

        reminders.sort(
            Comparator.comparingLong(AutomationReminderDTO::getDaysRemaining)
                .thenComparing(AutomationReminderDTO::getEmployeeName, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(AutomationReminderDTO::getReminderType, Comparator.nullsLast(String::compareToIgnoreCase))
        );
        return reminders;
    }

    public List<CustomFieldDefinition> getCustomFields() {
        return customFieldDefinitionRepository.findAllByOrderByTargetModuleAscLabelAsc();
    }

    public CustomFieldDefinition createCustomField(CustomFieldDefinition fieldDefinition) {
        return customFieldDefinitionRepository.save(normalizeCustomField(fieldDefinition, new CustomFieldDefinition()));
    }

    public CustomFieldDefinition updateCustomField(Long id, CustomFieldDefinition fieldDetails) {
        CustomFieldDefinition fieldDefinition = customFieldDefinitionRepository.findById(id).orElseThrow();
        return customFieldDefinitionRepository.save(normalizeCustomField(fieldDetails, fieldDefinition));
    }

    public void deleteCustomField(Long id) {
        customFieldDefinitionRepository.deleteById(id);
    }

    public List<ApprovalFlowDefinition> getApprovalFlows() {
        return approvalFlowDefinitionRepository.findAllByOrderByTargetModuleAscNameAsc();
    }

    public ApprovalFlowDefinition createApprovalFlow(ApprovalFlowDefinition flowDefinition) {
        return approvalFlowDefinitionRepository.save(normalizeApprovalFlow(flowDefinition, new ApprovalFlowDefinition()));
    }

    public ApprovalFlowDefinition updateApprovalFlow(Long id, ApprovalFlowDefinition flowDetails) {
        ApprovalFlowDefinition flowDefinition = approvalFlowDefinitionRepository.findById(id).orElseThrow();
        return approvalFlowDefinitionRepository.save(normalizeApprovalFlow(flowDetails, flowDefinition));
    }

    public void deleteApprovalFlow(Long id) {
        approvalFlowDefinitionRepository.deleteById(id);
    }

    public List<WorkflowRuleDefinition> getWorkflowRules() {
        return workflowRuleDefinitionRepository.findAllByOrderByTargetModuleAscNameAsc();
    }

    public WorkflowRuleDefinition createWorkflowRule(WorkflowRuleDefinition ruleDefinition) {
        return workflowRuleDefinitionRepository.save(normalizeWorkflowRule(ruleDefinition, new WorkflowRuleDefinition()));
    }

    public WorkflowRuleDefinition updateWorkflowRule(Long id, WorkflowRuleDefinition ruleDetails) {
        WorkflowRuleDefinition ruleDefinition = workflowRuleDefinitionRepository.findById(id).orElseThrow();
        return workflowRuleDefinitionRepository.save(normalizeWorkflowRule(ruleDetails, ruleDefinition));
    }

    public void deleteWorkflowRule(Long id) {
        workflowRuleDefinitionRepository.deleteById(id);
    }

    private CustomFieldDefinition normalizeCustomField(
        CustomFieldDefinition source,
        CustomFieldDefinition target
    ) {
        target.setLabel(defaultText(source.getLabel(), target.getLabel()));
        target.setFieldKey(defaultText(source.getFieldKey(), target.getFieldKey()));
        target.setTargetModule(defaultText(source.getTargetModule(), target.getTargetModule()));
        target.setFieldType(defaultText(source.getFieldType(), target.getFieldType()));
        target.setRequired(source.getRequired() != null ? source.getRequired() : Boolean.FALSE);
        target.setActive(source.getActive() != null ? source.getActive() : Boolean.TRUE);
        target.setPlaceholderText(defaultText(source.getPlaceholderText(), target.getPlaceholderText()));
        target.setOptionsCsv(defaultText(source.getOptionsCsv(), target.getOptionsCsv()));
        return target;
    }

    private ApprovalFlowDefinition normalizeApprovalFlow(
        ApprovalFlowDefinition source,
        ApprovalFlowDefinition target
    ) {
        target.setName(defaultText(source.getName(), target.getName()));
        target.setTargetModule(defaultText(source.getTargetModule(), target.getTargetModule()));
        target.setStageSequence(defaultText(source.getStageSequence(), target.getStageSequence()));
        target.setDescription(defaultText(source.getDescription(), target.getDescription()));
        target.setActive(source.getActive() != null ? source.getActive() : Boolean.TRUE);
        return target;
    }

    private WorkflowRuleDefinition normalizeWorkflowRule(
        WorkflowRuleDefinition source,
        WorkflowRuleDefinition target
    ) {
        target.setName(defaultText(source.getName(), target.getName()));
        target.setTargetModule(defaultText(source.getTargetModule(), target.getTargetModule()));
        target.setTriggerEvent(defaultText(source.getTriggerEvent(), target.getTriggerEvent()));
        target.setConditionExpression(defaultText(source.getConditionExpression(), target.getConditionExpression()));
        target.setActionExpression(defaultText(source.getActionExpression(), target.getActionExpression()));
        target.setDescription(defaultText(source.getDescription(), target.getDescription()));
        target.setActive(source.getActive() != null ? source.getActive() : Boolean.TRUE);
        return target;
    }

    private int resolveReminderWindowDays() {
        Integer configuredValue = workspaceConfigurationService.getConfiguration().getReminderWindowDays();
        return configuredValue != null && configuredValue > 0 ? configuredValue : 30;
    }

    private boolean shouldIncludeReminder(LocalDate today, LocalDate cutoff, LocalDate dueDate) {
        return dueDate != null && !dueDate.isAfter(cutoff) && !dueDate.isBefore(today.minusDays(7));
    }

    private LocalDate parseDate(String value) {
        String normalizedValue = defaultText(value, null);

        if (normalizedValue == null) {
            return null;
        }

        try {
            return LocalDate.parse(normalizedValue);
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private int computeDurationDays(String startDate, String endDate) {
        LocalDate normalizedStartDate = parseDate(startDate);
        LocalDate normalizedEndDate = parseDate(endDate);

        if (normalizedStartDate == null || normalizedEndDate == null || normalizedEndDate.isBefore(normalizedStartDate)) {
            return 0;
        }

        return (int) ChronoUnit.DAYS.between(normalizedStartDate, normalizedEndDate) + 1;
    }

    private int parseInteger(String value) {
        String normalizedValue = defaultText(value, null);

        if (normalizedValue == null) {
            return 0;
        }

        try {
            return Integer.parseInt(normalizedValue);
        } catch (RuntimeException exception) {
            return 0;
        }
    }

    private String resolveLeaveBalanceStatus(int allocatedDays, int remainingDays) {
        if (allocatedDays <= 0 || remainingDays <= 0) {
            return "Critical";
        }

        if (remainingDays <= Math.max(2, allocatedDays / 4)) {
            return "Watch";
        }

        return "Healthy";
    }

    private String resolveReminderSeverity(long daysRemaining) {
        if (daysRemaining <= 0) {
            return "Critical";
        }

        if (daysRemaining <= 7) {
            return "High";
        }

        if (daysRemaining <= 14) {
            return "Medium";
        }

        return "Low";
    }

    private String buildCompositeKey(Long employeeId, Long leaveTypeId) {
        return employeeId + ":" + leaveTypeId;
    }

    private String defaultText(String value, String fallback) {
        String normalizedValue = value != null ? value.trim() : "";

        if (!normalizedValue.isEmpty()) {
            return normalizedValue;
        }

        return fallback;
    }
}