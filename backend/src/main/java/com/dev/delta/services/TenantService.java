package com.dev.delta.services;

import com.dev.delta.entities.Tenant;
import com.dev.delta.entities.User;
import com.dev.delta.repositories.TenantRepository;
import com.dev.delta.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StripeService stripeService;

    public TenantService(TenantRepository tenantRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder,
                         StripeService stripeService) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.stripeService = stripeService;
    }

    /**
     * Register a new tenant, create its admin user, and optionally start a Stripe checkout.
     */
    @Transactional
    public Tenant register(String tenantCode, String companyName, String adminEmail,
                           String adminUsername, String adminPassword) throws Exception {

        String normalizedCode = tenantCode.toLowerCase().trim().replaceAll("[^a-z0-9\\-]", "");

        if (tenantRepository.existsByTenantCode(normalizedCode)) {
            throw new IllegalArgumentException("Company code '" + normalizedCode + "' is already taken.");
        }
        if (tenantRepository.existsByAdminEmail(adminEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        Tenant tenant = new Tenant();
        tenant.setTenantCode(normalizedCode);
        tenant.setCompanyName(companyName);
        tenant.setAdminEmail(adminEmail);
        tenant.setStatus(Tenant.Status.ACTIVE); // Active immediately on free trial
        tenant.setPlan(Tenant.Plan.FREE);
        tenant.setTrialEndsAt(LocalDateTime.now().plusDays(14));

        // Create Stripe customer
        try {
            String customerId = stripeService.createCustomer(adminEmail, companyName);
            tenant.setStripeCustomerId(customerId);
        } catch (Exception e) {
            // Non-fatal: Stripe may not be configured yet
        }

        tenantRepository.save(tenant);

        // Create the admin user for this tenant
        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setDisplayName(companyName + " Admin");
        admin.setRole(User.UserRole.ADMIN);
        admin.setActive(true);
        admin.setTenantCode(normalizedCode);
        userRepository.save(admin);

        return tenant;
    }

    public Optional<Tenant> findByCode(String tenantCode) {
        return tenantRepository.findByTenantCode(tenantCode.toLowerCase().trim());
    }

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Tenant save(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    public boolean codeExists(String tenantCode) {
        return tenantRepository.existsByTenantCode(tenantCode.toLowerCase().trim());
    }

    /**
     * Called from Stripe webhook to activate a subscription.
     */
    @Transactional
    public void activateSubscription(String stripeCustomerId, String subscriptionId,
                                     String priceId, LocalDateTime endsAt) {
        tenantRepository.findAll().stream()
                .filter(t -> stripeCustomerId.equals(t.getStripeCustomerId()))
                .findFirst()
                .ifPresent(tenant -> {
                    tenant.setStripeSubscriptionId(subscriptionId);
                    tenant.setStripePriceId(priceId);
                    tenant.setPlan(stripeService.resolvePlanFromPriceId(priceId));
                    tenant.setStatus(Tenant.Status.ACTIVE);
                    tenant.setSubscriptionEndsAt(endsAt);
                    tenantRepository.save(tenant);
                });
    }

    /**
     * Called from Stripe webhook to cancel/suspend a subscription.
     */
    @Transactional
    public void cancelSubscription(String stripeCustomerId) {
        tenantRepository.findAll().stream()
                .filter(t -> stripeCustomerId.equals(t.getStripeCustomerId()))
                .findFirst()
                .ifPresent(tenant -> {
                    tenant.setStatus(Tenant.Status.SUSPENDED);
                    tenant.setPlan(Tenant.Plan.FREE);
                    tenantRepository.save(tenant);
                });
    }
}
