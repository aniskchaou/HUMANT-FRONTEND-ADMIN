package com.dev.delta.services;

import com.dev.delta.entities.PlatformRole;
import com.dev.delta.repositories.PlatformRoleRepository;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class PlatformRoleService {

    private final PlatformRoleRepository repo;

    public PlatformRoleService(PlatformRoleRepository repo) { this.repo = repo; }

    public List<PlatformRole> findAll() { return repo.findAllByOrderByRoleNameAsc(); }
    public Optional<PlatformRole> findById(Long id) { return repo.findById(id); }
    public Optional<PlatformRole> findByName(String name) { return repo.findByRoleName(name); }
    public PlatformRole save(PlatformRole role) { return repo.save(role); }

    public void delete(Long id) {
        repo.findById(id).ifPresent(r -> {
            if (!Boolean.TRUE.equals(r.getSystemRole())) { repo.deleteById(id); }
        });
    }

    /** Seed built-in system roles on first boot. */
    @PostConstruct
    public void seedSystemRoles() {
        seedRole("Super Admin",        "Full platform access",                     "view_tenants,create_tenants,delete_tenants,view_billing,refund_payments,manage_plans,manage_features,manage_users,view_audit_logs,manage_integrations,manage_system_settings", true);
        seedRole("Billing Admin",      "Billing, invoices and payment management", "view_tenants,view_billing,refund_payments", true);
        seedRole("Support Admin",      "Customer support access",                  "view_tenants,view_billing,view_audit_logs", true);
        seedRole("Customer Success",   "Account health and engagement monitoring", "view_tenants,view_billing", true);
        seedRole("Security Admin",     "Security and audit log access",            "view_tenants,view_audit_logs,manage_system_settings", true);
        seedRole("Read Only Admin",    "Read-only view of all platform data",      "view_tenants,view_billing,view_audit_logs", true);
    }

    private void seedRole(String name, String desc, String permissions, boolean system) {
        if (repo.findByRoleName(name).isEmpty()) {
            PlatformRole r = new PlatformRole();
            r.setRoleName(name);
            r.setDescription(desc);
            r.setPermissions(permissions);
            r.setSystemRole(system);
            r.setActive(true);
            repo.save(r);
        }
    }
}
