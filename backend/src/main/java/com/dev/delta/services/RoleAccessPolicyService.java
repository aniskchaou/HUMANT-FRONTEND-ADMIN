package com.dev.delta.services;

import com.dev.delta.entities.RoleAccessPolicy;
import com.dev.delta.entities.User.UserRole;
import com.dev.delta.repositories.RoleAccessPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class RoleAccessPolicyService {

    @Autowired
    private RoleAccessPolicyRepository roleAccessPolicyRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<RoleAccessPolicy> getPolicies() {
        ensureDefaultPolicies();
        return roleAccessPolicyRepository.findAllByOrderByRoleNameAsc();
    }

    public RoleAccessPolicy getPolicy(UserRole roleName) {
        ensureDefaultPolicies();
        return roleAccessPolicyRepository.findByRoleName(roleName).orElseGet(() -> roleAccessPolicyRepository.save(buildDefaultPolicy(roleName)));
    }

    public RoleAccessPolicy updatePolicy(UserRole roleName, RoleAccessPolicy policyDetails) {
        RoleAccessPolicy policy = roleAccessPolicyRepository.findByRoleName(roleName).orElseGet(() -> buildDefaultPolicy(roleName));
        policy.setRoleName(roleName);
        policy.setAllowedRoutePrefixes(normalizePrefixes(policyDetails.getAllowedRoutePrefixes(), policy.getAllowedRoutePrefixes()));
        policy.setCanViewSensitiveData(defaultBoolean(policyDetails.getCanViewSensitiveData(), policy.getCanViewSensitiveData()));
        policy.setCanManageUsers(defaultBoolean(policyDetails.getCanManageUsers(), policy.getCanManageUsers()));
        policy.setCanManageConfiguration(defaultBoolean(policyDetails.getCanManageConfiguration(), policy.getCanManageConfiguration()));
        policy.setCanManageCompanies(defaultBoolean(policyDetails.getCanManageCompanies(), policy.getCanManageCompanies()));
        policy.setCanViewAuditLogs(defaultBoolean(policyDetails.getCanViewAuditLogs(), policy.getCanViewAuditLogs()));
        policy.setDefaultLandingRoute(defaultText(policyDetails.getDefaultLandingRoute(), policy.getDefaultLandingRoute()));
        policy.setUpdatedAt(LocalDateTime.now());

        RoleAccessPolicy saved = roleAccessPolicyRepository.save(policy);
        auditLogService.logCurrentUserAction(
            "UPDATE",
            "ROLE_ACCESS_POLICY",
            roleName.name(),
            "Updated role access policy for " + roleName.name() + ".",
            "Allowed routes: " + saved.getAllowedRoutePrefixes()
        );
        return saved;
    }

    public void ensureDefaultPolicies() {
        for (UserRole role : UserRole.values()) {
            if (roleAccessPolicyRepository.findByRoleName(role).isPresent()) {
                continue;
            }

            roleAccessPolicyRepository.save(buildDefaultPolicy(role));
        }
    }

    private RoleAccessPolicy buildDefaultPolicy(UserRole roleName) {
        RoleAccessPolicy policy = new RoleAccessPolicy();
        policy.setRoleName(roleName);
        policy.setAllowedRoutePrefixes(String.join(",", defaultPrefixes(roleName)));
        policy.setCanViewSensitiveData(roleName == UserRole.ADMIN || roleName == UserRole.HR);
        policy.setCanManageUsers(roleName == UserRole.ADMIN);
        policy.setCanManageConfiguration(roleName == UserRole.ADMIN || roleName == UserRole.HR);
        policy.setCanManageCompanies(roleName == UserRole.ADMIN);
        policy.setCanViewAuditLogs(roleName == UserRole.ADMIN);
        policy.setDefaultLandingRoute(defaultLandingRoute(roleName));
        policy.setUpdatedAt(LocalDateTime.now());
        return policy;
    }

    private List<String> defaultPrefixes(UserRole roleName) {
        switch (roleName) {
            case ADMIN:
                return Arrays.asList(
                    "/dashboard", "/user", "/configuration", "/employee", "/departement", "/designation",
                    "/education-level", "/contract", "/contract-type", "/document", "/salary", "/pay-slip",
                    "/loan", "/advance", "/attendance", "/notice", "/warning", "/resignation", "/resign",
                    "/termination", "/transfert", "/announcement", "/leave", "/leave-type", "/holiday",
                    "/onboarding", "/performance", "/expense", "/training", "/training-type", "/award",
                    "/award-type", "/event", "/job", "/launch-plan", "/communication", "/profile", "/editprofile"
                );
            case HR:
                return Arrays.asList(
                    "/dashboard", "/configuration", "/employee", "/departement", "/designation", "/education-level",
                    "/contract", "/contract-type", "/document", "/salary", "/pay-slip", "/loan", "/advance",
                    "/attendance", "/notice", "/warning", "/resignation", "/resign", "/termination", "/transfert",
                    "/announcement", "/leave", "/leave-type", "/holiday", "/onboarding", "/performance", "/expense",
                    "/training", "/training-type", "/award", "/award-type", "/event", "/job", "/launch-plan",
                    "/communication", "/profile", "/editprofile"
                );
            case MANAGER:
                return Arrays.asList(
                    "/dashboard", "/employee", "/attendance", "/notice", "/resignation", "/resign", "/termination",
                    "/transfert", "/announcement", "/leave", "/leave-type", "/holiday", "/onboarding", "/performance",
                    "/expense", "/training", "/training-type", "/award", "/award-type", "/event", "/job",
                    "/launch-plan", "/communication", "/profile", "/editprofile"
                );
            case RECRUITER:
                return Arrays.asList(
                    "/dashboard", "/job", "/announcement", "/communication", "/onboarding", "/training", "/event",
                    "/profile", "/editprofile"
                );
            case EMPLOYEE:
            default:
                return Arrays.asList(
                    "/profile", "/editprofile", "/expense", "/leave", "/pay-slip", "/performance", "/resignation", "/resign"
                );
        }
    }

    private String defaultLandingRoute(UserRole roleName) {
        switch (roleName) {
            case EMPLOYEE:
                return "/profile";
            case RECRUITER:
                return "/job";
            default:
                return "/dashboard";
        }
    }

    private Boolean defaultBoolean(Boolean value, Boolean fallback) {
        return value != null ? value : fallback;
    }

    private String defaultText(String value, String fallback) {
        String normalized = value != null ? value.trim() : "";
        return normalized.isEmpty() ? fallback : normalized;
    }

    private String normalizePrefixes(String value, String fallback) {
        String source = defaultText(value, fallback);
        List<String> normalizedPrefixes = new ArrayList<>();

        for (String token : source.split(",")) {
            String normalized = token != null ? token.trim() : "";

            if (normalized.isEmpty()) {
                continue;
            }

            if (!normalized.startsWith("/")) {
                normalized = "/" + normalized;
            }

            if (!normalizedPrefixes.contains(normalized)) {
                normalizedPrefixes.add(normalized);
            }
        }

        return String.join(",", normalizedPrefixes);
    }
}