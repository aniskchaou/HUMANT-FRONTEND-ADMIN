package com.dev.delta.services;

import com.dev.delta.entities.AuditLogEntry;
import com.dev.delta.entities.User;
import com.dev.delta.repositories.AuditLogEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogEntryRepository auditLogEntryRepository;

    public List<AuditLogEntry> getRecentEntries() {
        return auditLogEntryRepository.findTop200ByOrderByCreatedAtDesc();
    }

    public AuditLogEntry logCurrentUserAction(String actionType, String targetType, String targetId, String summary, String details) {
        return save(buildEntry(resolveCurrentUsername(), resolveCurrentRole(), resolveCurrentCompanyCode(), actionType, targetType, targetId, summary, details));
    }

    public AuditLogEntry logAction(String actorUsername, String actorRole, String companyCode, String actionType, String targetType, String targetId, String summary, String details) {
        return save(buildEntry(actorUsername, actorRole, companyCode, actionType, targetType, targetId, summary, details));
    }

    public AuditLogEntry logSessionOpened(User user) {
        String username = user != null ? user.getUsername() : resolveCurrentUsername();
        String role = user != null && user.getRole() != null ? user.getRole().name() : resolveCurrentRole();
        String companyCode = user != null && user.getCompany() != null ? user.getCompany().getCode() : resolveCurrentCompanyCode();
        return logAction(username, role, companyCode, "LOGIN", "SESSION", username, "Opened an authenticated workspace session.", "User session authenticated successfully.");
    }

    private AuditLogEntry save(AuditLogEntry entry) {
        return auditLogEntryRepository.save(entry);
    }

    private AuditLogEntry buildEntry(String actorUsername, String actorRole, String companyCode, String actionType, String targetType, String targetId, String summary, String details) {
        AuditLogEntry entry = new AuditLogEntry();
        entry.setActorUsername(defaultText(actorUsername, "system"));
        entry.setActorRole(defaultText(actorRole, "SYSTEM"));
        entry.setCompanyCode(defaultText(companyCode, "default"));
        entry.setActionType(defaultText(actionType, "UPDATE"));
        entry.setTargetType(defaultText(targetType, "SYSTEM"));
        entry.setTargetId(defaultText(targetId, "n/a"));
        entry.setSummary(defaultText(summary, "Tracked system change."));
        entry.setDetails(defaultText(details, entry.getSummary()));
        entry.setRequestPath(resolveRequestPath());
        return entry;
    }

    private String resolveCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private String resolveCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null || authentication.getAuthorities().isEmpty()) {
            return "SYSTEM";
        }

        return authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
    }

    private String resolveCurrentCompanyCode() {
        return "default";
    }

    private String resolveRequestPath() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();

        if (!(requestAttributes instanceof ServletRequestAttributes)) {
            return "system";
        }

        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
        return request != null ? request.getRequestURI() : "system";
    }

    private String defaultText(String value, String fallback) {
        String normalized = value != null ? value.trim() : "";
        return normalized.isEmpty() ? fallback : normalized;
    }
}