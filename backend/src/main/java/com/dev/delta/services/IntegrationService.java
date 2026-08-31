package com.dev.delta.services;

import com.dev.delta.entities.Integration;
import com.dev.delta.repositories.IntegrationRepository;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class IntegrationService {

    private final IntegrationRepository repo;

    public IntegrationService(IntegrationRepository repo) {
        this.repo = repo;
    }

    public List<Integration> findAll() { return repo.findAllByOrderByCategoryAscNameAsc(); }
    public Optional<Integration> findById(Long id) { return repo.findById(id); }
    public Integration save(Integration integration) { return repo.save(integration); }
    public void delete(Long id) { repo.deleteById(id); }

    public Integration enable(Long id, boolean enable) {
        Integration i = repo.findById(id).orElseThrow();
        i.setEnabled(enable);
        if (enable && i.getSyncStatus() == Integration.SyncStatus.NOT_CONFIGURED) {
            i.setSyncStatus(Integration.SyncStatus.IDLE);
        }
        if (!enable) { i.setSyncStatus(Integration.SyncStatus.NOT_CONFIGURED); }
        return repo.save(i);
    }

    /** Simulate a connection test. Returns status message. */
    public String testConnection(Long id) {
        Integration i = repo.findById(id).orElseThrow();
        i.setLastTestedAt(LocalDateTime.now());
        if (!Boolean.TRUE.equals(i.getEnabled()) || i.getCredentialsJson() == null || i.getCredentialsJson().isBlank()) {
            appendLog(i, "Connection test failed: not configured");
            i.setSyncStatus(Integration.SyncStatus.FAILED);
            repo.save(i);
            return "NOT_CONFIGURED";
        }
        appendLog(i, "Connection test successful");
        i.setSyncStatus(Integration.SyncStatus.IDLE);
        repo.save(i);
        return "OK";
    }

    /** Simulate a manual sync trigger. */
    public Integration triggerSync(Long id) {
        Integration i = repo.findById(id).orElseThrow();
        if (!Boolean.TRUE.equals(i.getEnabled())) { return i; }
        i.setSyncStatus(Integration.SyncStatus.SYNCING);
        i.setLastSyncAt(LocalDateTime.now());
        appendLog(i, "Manual sync triggered");
        // In production this would enqueue an async job; here we immediately mark success
        i.setSyncStatus(Integration.SyncStatus.SUCCESS);
        i.setFailedSyncs(0);
        i.setLastSyncError(null);
        appendLog(i, "Sync completed successfully");
        return repo.save(i);
    }

    public Integration saveCredentials(Long id, String credentialsJson, String configJson) {
        Integration i = repo.findById(id).orElseThrow();
        i.setCredentialsJson(credentialsJson);
        i.setConfigJson(configJson);
        if (i.getSyncStatus() == Integration.SyncStatus.NOT_CONFIGURED) {
            i.setSyncStatus(Integration.SyncStatus.IDLE);
        }
        appendLog(i, "Credentials updated");
        return repo.save(i);
    }

    private void appendLog(Integration i, String message) {
        String ts = LocalDateTime.now().toString().substring(0, 19).replace('T', ' ');
        String entry = "[" + ts + "] " + message;
        String existing = i.getRecentLogs() != null ? i.getRecentLogs() : "";
        String[] lines = existing.isEmpty() ? new String[0] : existing.split("\n");
        // Keep last 10 lines
        StringBuilder sb = new StringBuilder();
        int start = Math.max(0, lines.length - 9);
        for (int j = start; j < lines.length; j++) { sb.append(lines[j]).append("\n"); }
        sb.append(entry);
        i.setRecentLogs(sb.toString());
    }

    /** Seed all known integrations on first boot. */
    @PostConstruct
    public void seedIntegrations() {
        seedIntegration("microsoft_entra_id", "Microsoft Entra ID", Integration.Category.IDENTITY,
                "Single Sign-On and user provisioning via Microsoft Entra ID (formerly Azure AD)");
        seedIntegration("google_workspace", "Google Workspace", Integration.Category.IDENTITY,
                "SSO and directory sync with Google Workspace accounts");
        seedIntegration("okta", "Okta", Integration.Category.IDENTITY,
                "Identity and access management via Okta SSO");
        seedIntegration("saml_sso", "SAML 2.0 SSO", Integration.Category.IDENTITY,
                "Generic SAML 2.0 single sign-on provider");
        seedIntegration("oauth2", "OAuth 2.0", Integration.Category.IDENTITY,
                "Generic OAuth 2.0 authorization framework");
        seedIntegration("scim", "SCIM Provisioning", Integration.Category.IDENTITY,
                "Automated user provisioning and de-provisioning via SCIM 2.0");

        seedIntegration("payroll_adp", "ADP Payroll", Integration.Category.HR,
                "Sync employee and payroll data with ADP");
        seedIntegration("payroll_quickbooks", "QuickBooks Payroll", Integration.Category.HR,
                "Integrate payroll with QuickBooks accounting");
        seedIntegration("accounting_xero", "Xero", Integration.Category.HR,
                "Sync salary and expense data with Xero accounting");
        seedIntegration("ats_greenhouse", "Greenhouse ATS", Integration.Category.HR,
                "Sync job postings and candidates with Greenhouse");
        seedIntegration("ats_workday", "Workday", Integration.Category.HR,
                "Bidirectional sync with Workday HCM");
        seedIntegration("benefits_gusto", "Gusto Benefits", Integration.Category.HR,
                "Sync employee benefits and insurance data with Gusto");
        seedIntegration("time_toggl", "Toggl Track", Integration.Category.HR,
                "Import time tracking data from Toggl");
        seedIntegration("expense_expensify", "Expensify", Integration.Category.HR,
                "Sync expense reports from Expensify");

        seedIntegration("email_sendgrid", "SendGrid Email", Integration.Category.COMMUNICATION,
                "Transactional and notification emails via SendGrid");
        seedIntegration("sms_twilio", "Twilio SMS", Integration.Category.COMMUNICATION,
                "SMS notifications and alerts via Twilio");
        seedIntegration("slack", "Slack", Integration.Category.COMMUNICATION,
                "Send notifications and alerts to Slack channels");
        seedIntegration("microsoft_teams", "Microsoft Teams", Integration.Category.COMMUNICATION,
                "Send notifications and HR updates to Microsoft Teams");
    }

    private void seedIntegration(String key, String name, Integration.Category category, String desc) {
        if (repo.findByIntegrationKey(key).isEmpty()) {
            Integration i = new Integration();
            i.setIntegrationKey(key);
            i.setName(name);
            i.setCategory(category);
            i.setDescription(desc);
            i.setEnabled(false);
            i.setSyncStatus(Integration.SyncStatus.NOT_CONFIGURED);
            repo.save(i);
        }
    }
}
