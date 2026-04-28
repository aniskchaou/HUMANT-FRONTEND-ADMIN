package com.dev.delta.services;

import com.dev.delta.entities.WorkspaceConfiguration;
import com.dev.delta.repositories.WorkspaceConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WorkspaceConfigurationService {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private WorkspaceConfigurationRepository workspaceConfigurationRepository;

    @Autowired
    private AuditLogService auditLogService;

    public WorkspaceConfiguration getConfiguration() {
        WorkspaceConfiguration configuration = workspaceConfigurationRepository.findFirstByOrderByIdAsc()
            .orElseGet(() -> workspaceConfigurationRepository.save(buildDefaultConfiguration()));

        if (configuration.getDefaultCompany() == null) {
            configuration.setDefaultCompany(companyService.getDefaultCompany());
            configuration = workspaceConfigurationRepository.save(configuration);
        }

        return configuration;
    }

    public WorkspaceConfiguration updateConfiguration(WorkspaceConfiguration configurationDetails) {
        WorkspaceConfiguration configuration = getConfiguration();

        configuration.setCompanyName(defaultText(configurationDetails.getCompanyName(), configuration.getCompanyName()));
        configuration.setCompanyEmail(defaultText(configurationDetails.getCompanyEmail(), configuration.getCompanyEmail()));
        configuration.setCompanyAddress(defaultText(configurationDetails.getCompanyAddress(), configuration.getCompanyAddress()));
        configuration.setLanguage(defaultText(configurationDetails.getLanguage(), configuration.getLanguage()));
        configuration.setCurrency(defaultText(configurationDetails.getCurrency(), configuration.getCurrency()));
        configuration.setTimezone(defaultText(configurationDetails.getTimezone(), configuration.getTimezone()));
        configuration.setPayrollCutoffDay(
            configurationDetails.getPayrollCutoffDay() != null
                ? configurationDetails.getPayrollCutoffDay()
                : configuration.getPayrollCutoffDay()
        );
        configuration.setApprovalMode(defaultText(configurationDetails.getApprovalMode(), configuration.getApprovalMode()));
        configuration.setPayslipSignature(
            defaultText(configurationDetails.getPayslipSignature(), configuration.getPayslipSignature())
        );
        configuration.setNotificationMode(
            defaultText(configurationDetails.getNotificationMode(), configuration.getNotificationMode())
        );
        configuration.setAutoLeaveBalanceEnabled(
            defaultBoolean(configurationDetails.getAutoLeaveBalanceEnabled(), configuration.getAutoLeaveBalanceEnabled())
        );
        configuration.setAutoPayrollEnabled(
            defaultBoolean(configurationDetails.getAutoPayrollEnabled(), configuration.getAutoPayrollEnabled())
        );
        configuration.setCustomApprovalFlowsEnabled(
            defaultBoolean(
                configurationDetails.getCustomApprovalFlowsEnabled(),
                configuration.getCustomApprovalFlowsEnabled()
            )
        );
        configuration.setRuleBasedTriggersEnabled(
            defaultBoolean(configurationDetails.getRuleBasedTriggersEnabled(), configuration.getRuleBasedTriggersEnabled())
        );
        configuration.setReminderWindowDays(
            configurationDetails.getReminderWindowDays() != null
                ? configurationDetails.getReminderWindowDays()
                : configuration.getReminderWindowDays()
        );
        configuration.setPasswordMinLength(
            configurationDetails.getPasswordMinLength() != null
                ? configurationDetails.getPasswordMinLength()
                : configuration.getPasswordMinLength()
        );
        configuration.setSessionTimeoutMinutes(
            configurationDetails.getSessionTimeoutMinutes() != null
                ? configurationDetails.getSessionTimeoutMinutes()
                : configuration.getSessionTimeoutMinutes()
        );
        configuration.setAllowRememberMe(
            defaultBoolean(configurationDetails.getAllowRememberMe(), configuration.getAllowRememberMe())
        );
        configuration.setApprovalStages(
            defaultText(configurationDetails.getApprovalStages(), configuration.getApprovalStages())
        );

        if (configurationDetails.getDefaultCompany() != null && configurationDetails.getDefaultCompany().getId() != null) {
            configuration.setDefaultCompany(companyService.getCompany(configurationDetails.getDefaultCompany().getId()));
        } else if (configuration.getDefaultCompany() == null) {
            configuration.setDefaultCompany(companyService.getDefaultCompany());
        }

        syncDefaultCompany(configuration);
        configuration.setUpdatedAt(LocalDateTime.now());
        WorkspaceConfiguration savedConfiguration = workspaceConfigurationRepository.save(configuration);
        auditLogService.logCurrentUserAction(
            "UPDATE",
            "WORKSPACE_CONFIGURATION",
            savedConfiguration.getId() != null ? savedConfiguration.getId().toString() : "default",
            "Updated workspace configuration.",
            "Approval mode: " + savedConfiguration.getApprovalMode() + ", session timeout: " + savedConfiguration.getSessionTimeoutMinutes()
        );
        return savedConfiguration;
    }

    private WorkspaceConfiguration buildDefaultConfiguration() {
        WorkspaceConfiguration configuration = new WorkspaceConfiguration();
        configuration.setCompanyName("Humant HR Workspace");
        configuration.setCompanyEmail("operations@humant.local");
        configuration.setCompanyAddress("Head office administration floor");
        configuration.setDefaultCompany(companyService.getDefaultCompany());
        configuration.setLanguage("English");
        configuration.setCurrency("USD");
        configuration.setTimezone("UTC");
        configuration.setPayrollCutoffDay(25);
        configuration.setApprovalMode("Two-step review");
        configuration.setPayslipSignature("HR Operations Lead");
        configuration.setNotificationMode("Email and in-app alerts");
        configuration.setAutoLeaveBalanceEnabled(Boolean.TRUE);
        configuration.setAutoPayrollEnabled(Boolean.TRUE);
        configuration.setCustomApprovalFlowsEnabled(Boolean.TRUE);
        configuration.setRuleBasedTriggersEnabled(Boolean.TRUE);
        configuration.setReminderWindowDays(30);
        configuration.setPasswordMinLength(8);
        configuration.setSessionTimeoutMinutes(480);
        configuration.setAllowRememberMe(Boolean.TRUE);
        configuration.setApprovalStages("Manager review -> HR approval");
        configuration.setUpdatedAt(LocalDateTime.now());
        return configuration;
    }

    private Boolean defaultBoolean(Boolean value, Boolean fallback) {
        return value != null ? value : fallback;
    }

    private String defaultText(String value, String fallback) {
        String normalizedValue = value != null ? value.trim() : "";
        return normalizedValue.isEmpty() ? fallback : normalizedValue;
    }

    private void syncDefaultCompany(WorkspaceConfiguration configuration) {
        if (configuration.getDefaultCompany() == null) {
            return;
        }

        configuration.getDefaultCompany().setName(configuration.getCompanyName());
        configuration.getDefaultCompany().setEmail(configuration.getCompanyEmail());
        configuration.getDefaultCompany().setAddress(configuration.getCompanyAddress());
        configuration.getDefaultCompany().setCurrency(configuration.getCurrency());
        configuration.getDefaultCompany().setTimezone(configuration.getTimezone());
        configuration.getDefaultCompany().setActive(Boolean.TRUE);
        configuration.getDefaultCompany().setDefaultCompany(Boolean.TRUE);
        companyService.updateCompany(configuration.getDefaultCompany().getId(), configuration.getDefaultCompany());
    }
}