package com.dev.delta.controllers;

import com.dev.delta.entities.Tenant;
import com.dev.delta.entities.User;
import com.dev.delta.repositories.UserRepository;
import com.dev.delta.services.TenantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin
@Tag(name = "Super Admin", description = "Platform super-admin management APIs")
public class SuperAdminController {

    private final TenantService tenantService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminController(TenantService tenantService,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.tenantService = tenantService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Platform-wide stats. GET /api/super-admin/stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> platformStats() {
        List<Tenant> all = tenantService.findAll();
        long active    = all.stream().filter(t -> t.getStatus() == Tenant.Status.ACTIVE).count();
        long suspended = all.stream().filter(t -> t.getStatus() == Tenant.Status.SUSPENDED).count();
        long cancelled = all.stream().filter(t -> t.getStatus() == Tenant.Status.CANCELLED).count();
        long trial     = all.stream().filter(t -> t.getStatus() == Tenant.Status.TRIAL).count();
        long paid      = all.stream().filter(t -> t.getPlan() != Tenant.Plan.FREE).count();
        long starter   = all.stream().filter(t -> t.getPlan() == Tenant.Plan.STARTER).count();
        long professional = all.stream().filter(t -> t.getPlan() == Tenant.Plan.PROFESSIONAL).count();
        long enterprise   = all.stream().filter(t -> t.getPlan() == Tenant.Plan.ENTERPRISE).count();
        long mrrCents  = starter * 2900L + professional * 7900L + enterprise * 19900L;

        // Usage aggregates
        long totalEmployees = all.stream().mapToLong(t -> t.getTotalEmployees() != null ? t.getTotalEmployees() : 0).sum();
        long totalUsers     = all.stream().mapToLong(t -> t.getTotalUsers() != null ? t.getTotalUsers() : 0).sum();
        long totalStorage   = all.stream().mapToLong(t -> t.getStorageUsageMb() != null ? t.getStorageUsageMb() : 0).sum();
        long totalApi       = all.stream().mapToLong(t -> t.getApiCallsThisMonth() != null ? t.getApiCallsThisMonth() : 0).sum();

        // New this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newThisMonth = all.stream().filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(startOfMonth)).count();

        // Expiring subscriptions (within 30 days)
        LocalDateTime in30 = LocalDateTime.now().plusDays(30);
        long expiringSoon = all.stream().filter(t -> t.getSubscriptionEndsAt() != null
                && t.getSubscriptionEndsAt().isAfter(LocalDateTime.now())
                && t.getSubscriptionEndsAt().isBefore(in30)).count();

        // Expiring trials (within 7 days)
        LocalDateTime in7 = LocalDateTime.now().plusDays(7);
        long trialExpiringSoon = all.stream().filter(t -> t.getTrialEndsAt() != null
                && t.getTrialEndsAt().isAfter(LocalDateTime.now())
                && t.getTrialEndsAt().isBefore(in7)).count();

        // Churn rate: cancelled / (active + cancelled), avoid division by zero
        double churnRate = (active + cancelled) > 0 ? Math.round((cancelled * 100.0) / (active + cancelled) * 10) / 10.0 : 0.0;

        // ARPU
        double arpu = paid > 0 ? (mrrCents / 100.0) / paid : 0.0;

        // CLV estimate (ARPU * 12 months average lifetime)
        double clv = arpu * 12;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTenants", all.size());
        stats.put("activeTenants", active);
        stats.put("suspendedTenants", suspended);
        stats.put("cancelledTenants", cancelled);
        stats.put("trialTenants", trial);
        stats.put("paidTenants", paid);
        stats.put("newThisMonth", newThisMonth);
        stats.put("expiringSoon", expiringSoon);
        stats.put("trialExpiringSoon", trialExpiringSoon);
        stats.put("byPlan", Map.of(
                "FREE", all.stream().filter(t -> t.getPlan() == Tenant.Plan.FREE).count(),
                "STARTER", starter,
                "PROFESSIONAL", professional,
                "ENTERPRISE", enterprise
        ));
        stats.put("estimatedMrrCents", mrrCents);
        stats.put("estimatedArrCents", mrrCents * 12);
        stats.put("revenueThisMonthCents", mrrCents);
        stats.put("churnRate", churnRate);
        stats.put("arpuCents", (long)(arpu * 100));
        stats.put("clvCents", (long)(clv * 100));
        stats.put("totalEmployees", totalEmployees);
        stats.put("totalUsers", totalUsers);
        stats.put("totalStorageMb", totalStorage);
        stats.put("totalApiCallsThisMonth", totalApi);
        stats.put("generatedAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(stats);
    }

    /** List all tenants. GET /api/super-admin/tenants */
    @GetMapping("/tenants")
    public ResponseEntity<List<Tenant>> listTenants() {
        return ResponseEntity.ok(tenantService.findAll());
    }

    /** Get a single tenant. GET /api/super-admin/tenants/{code} */
    @GetMapping("/tenants/{code}")
    public ResponseEntity<Tenant> getTenant(@PathVariable String code) {
        return tenantService.findByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Create a new tenant. POST /api/super-admin/tenants */
    @PostMapping("/tenants")
    public ResponseEntity<Tenant> createTenant(@RequestBody Map<String, Object> body) {
        Tenant tenant = new Tenant();
        tenant.setTenantCode((String) body.get("tenantCode"));
        tenant.setCompanyName((String) body.getOrDefault("companyName", ""));
        tenant.setAdminEmail((String) body.getOrDefault("adminEmail", ""));
        String pwd = (String) body.get("adminPassword");
        if (pwd != null && !pwd.isBlank()) {
            tenant.setAdminPasswordHash(passwordEncoder.encode(pwd));
        }
        applyTenantProfile(tenant, body);
        try { tenant.setPlan(Tenant.Plan.valueOf(((String) body.getOrDefault("plan", "FREE")).toUpperCase())); }
        catch (IllegalArgumentException ignored) {}
        try { tenant.setStatus(Tenant.Status.valueOf(((String) body.getOrDefault("status", "PENDING")).toUpperCase())); }
        catch (IllegalArgumentException ignored) {}
        return ResponseEntity.ok(tenantService.save(tenant));
    }

    /** Full update of a tenant. PUT /api/super-admin/tenants/{code} */
    @PutMapping("/tenants/{code}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable String code,
                                               @RequestBody Map<String, Object> body) {
        return tenantService.findByCode(code).map(tenant -> {
            if (body.containsKey("companyName")) tenant.setCompanyName((String) body.get("companyName"));
            if (body.containsKey("adminEmail"))  tenant.setAdminEmail((String) body.get("adminEmail"));
            String pwd = (String) body.get("adminPassword");
            if (pwd != null && !pwd.isBlank()) {
                tenant.setAdminPasswordHash(passwordEncoder.encode(pwd));
            }
            applyTenantProfile(tenant, body);
            if (body.containsKey("plan")) {
                try { tenant.setPlan(Tenant.Plan.valueOf(((String) body.get("plan")).toUpperCase())); }
                catch (IllegalArgumentException ignored) {}
            }
            if (body.containsKey("billingCycle")) {
                try { tenant.setBillingCycle(Tenant.BillingCycle.valueOf(((String) body.get("billingCycle")).toUpperCase())); }
                catch (IllegalArgumentException ignored) {}
            }
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Archive a tenant. PUT /api/super-admin/tenants/{code}/archive */
    @PutMapping("/tenants/{code}/archive")
    public ResponseEntity<Tenant> archiveTenant(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.ARCHIVED);
            tenant.setArchivedAt(LocalDateTime.now());
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Restore an archived tenant. PUT /api/super-admin/tenants/{code}/restore */
    @PutMapping("/tenants/{code}/restore")
    public ResponseEntity<Tenant> restoreTenant(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.ACTIVE);
            tenant.setArchivedAt(null);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Reset admin password. PUT /api/super-admin/tenants/{code}/reset-password */
    @PutMapping("/tenants/{code}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable String code,
                                                              @RequestBody Map<String, String> body) {
        String newPwd = body.get("newPassword");
        if (newPwd == null || newPwd.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setAdminPasswordHash(passwordEncoder.encode(newPwd));
            tenantService.save(tenant);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Change billing cycle. PUT /api/super-admin/tenants/{code}/billing-cycle */
    @PutMapping("/tenants/{code}/billing-cycle")
    public ResponseEntity<Tenant> changeBillingCycle(@PathVariable String code,
                                                      @RequestBody Map<String, String> body) {
        String cycle = body.getOrDefault("billingCycle", "MONTHLY");
        return tenantService.findByCode(code).map(tenant -> {
            try { tenant.setBillingCycle(Tenant.BillingCycle.valueOf(cycle.toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Convert trial to active subscription. PUT /api/super-admin/tenants/{code}/convert-trial */
    @PutMapping("/tenants/{code}/convert-trial")
    public ResponseEntity<Tenant> convertTrial(@PathVariable String code,
                                               @RequestBody Map<String, String> body) {
        String planStr = body.getOrDefault("plan", "STARTER");
        return tenantService.findByCode(code).map(tenant -> {
            try { tenant.setPlan(Tenant.Plan.valueOf(planStr.toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
            tenant.setStatus(Tenant.Status.ACTIVE);
            tenant.setTrialEndsAt(LocalDateTime.now());
            tenant.setSubscriptionEndsAt(LocalDateTime.now().plusMonths(1));
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Pause a subscription. PUT /api/super-admin/tenants/{code}/pause */
    @PutMapping("/tenants/{code}/pause")
    public ResponseEntity<Tenant> pauseSubscription(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.SUSPENDED);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Resume a subscription. PUT /api/super-admin/tenants/{code}/resume */
    @PutMapping("/tenants/{code}/resume")
    public ResponseEntity<Tenant> resumeSubscription(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.ACTIVE);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Schedule cancellation date. PUT /api/super-admin/tenants/{code}/schedule-cancel */
    @PutMapping("/tenants/{code}/schedule-cancel")
    public ResponseEntity<Tenant> scheduleCancel(@PathVariable String code,
                                                  @RequestBody Map<String, String> body) {
        String dateStr = body.get("cancelAt");
        return tenantService.findByCode(code).map(tenant -> {
            try {
                tenant.setCancelledAt(LocalDateTime.parse(dateStr));
            } catch (Exception ignored) {
                tenant.setCancelledAt(LocalDateTime.now().plusDays(30));
            }
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Apply coupon/discount to a tenant. PUT /api/super-admin/tenants/{code}/discount */
    @PutMapping("/tenants/{code}/discount")
    public ResponseEntity<Tenant> applyDiscount(@PathVariable String code,
                                                 @RequestBody Map<String, String> body) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setCouponCode(body.getOrDefault("couponCode", ""));
            tenant.setDiscountPercent(body.getOrDefault("discountPercent", "0"));
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Full billing detail for a tenant. GET /api/super-admin/tenants/{code}/billing */
    @GetMapping("/tenants/{code}/billing")
    public ResponseEntity<Map<String, Object>> getBillingDetail(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            Map<String, Object> billing = new HashMap<>();
            billing.put("tenantCode",            tenant.getTenantCode());
            billing.put("companyName",           tenant.getCompanyName());
            billing.put("plan",                  tenant.getPlan());
            billing.put("status",                tenant.getStatus());
            billing.put("billingCycle",          tenant.getBillingCycle());
            billing.put("maxUsers",              tenant.getMaxUsers());
            billing.put("maxEmployees",          tenant.getMaxEmployees());
            billing.put("seatsConsumed",         tenant.getSeatsConsumed());
            billing.put("couponCode",            tenant.getCouponCode());
            billing.put("discountPercent",       tenant.getDiscountPercent());
            billing.put("stripeCustomerId",      tenant.getStripeCustomerId());
            billing.put("stripeSubscriptionId",  tenant.getStripeSubscriptionId());
            billing.put("stripePriceId",         tenant.getStripePriceId());
            billing.put("subscriptionEndsAt",    tenant.getSubscriptionEndsAt());
            billing.put("trialStartedAt",        tenant.getTrialStartedAt());
            billing.put("trialEndsAt",           tenant.getTrialEndsAt());
            billing.put("cancelledAt",           tenant.getCancelledAt());
            billing.put("createdAt",             tenant.getCreatedAt());
            return ResponseEntity.ok(billing);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Suspend a tenant. PUT /api/super-admin/tenants/{code}/suspend */
    @PutMapping("/tenants/{code}/suspend")
    public ResponseEntity<Tenant> suspendTenant(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.SUSPENDED);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Activate a tenant. PUT /api/super-admin/tenants/{code}/activate */
    @PutMapping("/tenants/{code}/activate")
    public ResponseEntity<Tenant> activateTenant(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.ACTIVE);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Change plan manually. PUT /api/super-admin/tenants/{code}/plan */
    @PutMapping("/tenants/{code}/plan")
    public ResponseEntity<Tenant> changePlan(@PathVariable String code,
                                              @RequestBody Map<String, String> body) {
        String planStr = body.getOrDefault("plan", "FREE");
        return tenantService.findByCode(code).map(tenant -> {
            try { tenant.setPlan(Tenant.Plan.valueOf(planStr.toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Override max user limit. PUT /api/super-admin/tenants/{code}/max-users */
    @PutMapping("/tenants/{code}/max-users")
    public ResponseEntity<Tenant> setMaxUsers(@PathVariable String code,
                                               @RequestBody Map<String, String> body) {
        String maxUsers = body.getOrDefault("maxUsers", "10");
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setMaxUsers(maxUsers);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Extend trial. PUT /api/super-admin/tenants/{code}/trial */
    @PutMapping("/tenants/{code}/trial")
    public ResponseEntity<Tenant> extendTrial(@PathVariable String code,
                                               @RequestBody Map<String, Integer> body) {
        int days = body.getOrDefault("days", 14);
        return tenantService.findByCode(code).map(tenant -> {
            LocalDateTime base = tenant.getTrialEndsAt() != null
                    && tenant.getTrialEndsAt().isAfter(LocalDateTime.now())
                    ? tenant.getTrialEndsAt()
                    : LocalDateTime.now();
            tenant.setTrialEndsAt(base.plusDays(days));
            if (tenant.getStatus() == Tenant.Status.SUSPENDED
                    || tenant.getStatus() == Tenant.Status.CANCELLED) {
                tenant.setStatus(Tenant.Status.ACTIVE);
            }
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Start a fresh trial. PUT /api/super-admin/tenants/{code}/start-trial */
    @PutMapping("/tenants/{code}/start-trial")
    public ResponseEntity<Tenant> startTrial(@PathVariable String code,
                                              @RequestBody Map<String, Integer> body) {
        int days = body.getOrDefault("days", 14);
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStatus(Tenant.Status.TRIAL);
            tenant.setTrialStartedAt(LocalDateTime.now());
            tenant.setTrialEndsAt(LocalDateTime.now().plusDays(days));
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Cancel subscription for a tenant. PUT /api/super-admin/tenants/{code}/cancel-subscription */
    @PutMapping("/tenants/{code}/cancel-subscription")
    public ResponseEntity<Tenant> cancelSubscription(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenant.setStripeSubscriptionId(null);
            tenant.setStripePriceId(null);
            tenant.setSubscriptionEndsAt(LocalDateTime.now());
            tenant.setCancelledAt(LocalDateTime.now());
            tenant.setPlan(Tenant.Plan.FREE);
            tenant.setStatus(Tenant.Status.CANCELLED);
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Delete a tenant. DELETE /api/super-admin/tenants/{code} */
    @DeleteMapping("/tenants/{code}")
    public ResponseEntity<?> deleteTenant(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenantService.delete(tenant);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /** All platform users across every tenant. GET /api/super-admin/users */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> listAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream().map(u -> {
            Map<String, Object> row = new HashMap<>();
            row.put("id",          u.getId());
            row.put("username",    u.getUsername());
            row.put("displayName", u.getDisplayName());
            row.put("role",        u.getRole() != null ? u.getRole().name() : "EMPLOYEE");
            row.put("active",      Boolean.TRUE.equals(u.getActive()));
            row.put("tenantCode",  u.getTenantCode());
            return row;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /** Toggle user active status. PUT /api/super-admin/users/{id}/toggle */
    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setActive(!Boolean.TRUE.equals(u.getActive()));
            User saved = userRepository.save(u);
            Map<String, Object> row = new HashMap<>();
            row.put("id",     saved.getId());
            row.put("active", Boolean.TRUE.equals(saved.getActive()));
            return ResponseEntity.ok(row);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Create a platform-level user (SUPER_ADMIN, SUPPORT, etc.). POST /api/super-admin/users */
    @PostMapping("/users")
    public ResponseEntity<?> createPlatformUser(@RequestBody Map<String, Object> body) {
        String username    = (String) body.get("username");
        String displayName = (String) body.getOrDefault("displayName", username);
        String password    = (String) body.get("password");
        String roleStr     = (String) body.getOrDefault("role", "ADMIN");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "username and password are required"));
        }
        if (userRepository.findByUsernameIgnoreCase(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        User u = new User();
        u.setUsername(username);
        u.setDisplayName(displayName);
        u.setPassword(passwordEncoder.encode(password));
        u.setActive(true);
        try { u.setRole(com.dev.delta.entities.User.UserRole.valueOf(roleStr.toUpperCase())); }
        catch (IllegalArgumentException ignored) { u.setRole(com.dev.delta.entities.User.UserRole.ADMIN); }
        User saved = userRepository.save(u);
        Map<String, Object> row = new HashMap<>();
        row.put("id", saved.getId()); row.put("username", saved.getUsername());
        row.put("displayName", saved.getDisplayName()); row.put("role", saved.getRole());
        row.put("active", saved.getActive());
        return ResponseEntity.ok(row);
    }

    /** Reset a user's password. PUT /api/super-admin/users/{id}/reset-password */
    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id,
                                                                  @RequestBody Map<String, String> body) {
        String newPwd = body.get("newPassword");
        if (newPwd == null || newPwd.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        return userRepository.findById(id).map(u -> {
            u.setPassword(passwordEncoder.encode(newPwd));
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Delete a platform user. DELETE /api/super-admin/users/{id} */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            userRepository.delete(u);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Customer 360° profile. GET /api/super-admin/customer360/{code} */
    @GetMapping("/customer360/{code}")
    public ResponseEntity<Map<String, Object>> customer360(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            Map<String, Object> profile = new HashMap<>();
            // company info
            profile.put("tenantCode",    tenant.getTenantCode());
            profile.put("companyName",   tenant.getCompanyName());
            profile.put("adminEmail",    tenant.getAdminEmail());
            profile.put("industry",      tenant.getIndustry());
            profile.put("companySize",   tenant.getCompanySize());
            profile.put("country",       tenant.getCountry());
            profile.put("currency",      tenant.getCurrency());
            profile.put("logoUrl",       tenant.getLogoUrl());
            profile.put("ownerName",     tenant.getOwnerName());
            profile.put("phone",         tenant.getPhone());
            // subscription
            profile.put("plan",                tenant.getPlan());
            profile.put("status",              tenant.getStatus());
            profile.put("billingCycle",        tenant.getBillingCycle());
            profile.put("maxUsers",            tenant.getMaxUsers());
            profile.put("maxEmployees",        tenant.getMaxEmployees());
            profile.put("seatsConsumed",       tenant.getSeatsConsumed());
            profile.put("subscriptionEndsAt",  tenant.getSubscriptionEndsAt());
            profile.put("trialEndsAt",         tenant.getTrialEndsAt());
            profile.put("createdAt",           tenant.getCreatedAt());
            // usage
            profile.put("totalEmployees",      tenant.getTotalEmployees());
            profile.put("totalUsers",          tenant.getTotalUsers());
            profile.put("storageUsageMb",      tenant.getStorageUsageMb());
            profile.put("apiCallsThisMonth",   tenant.getApiCallsThisMonth());
            // billing
            profile.put("stripeCustomerId",    tenant.getStripeCustomerId());
            profile.put("couponCode",          tenant.getCouponCode());
            profile.put("discountPercent",     tenant.getDiscountPercent());
            // users count
            long userCount = userRepository.findAll().stream()
                    .filter(u -> code.equals(u.getTenantCode())).count();
            profile.put("platformUserCount", userCount);
            // health score heuristic
            profile.put("healthScore", computeHealthScore(tenant));
            return ResponseEntity.ok(profile);
        }).orElse(ResponseEntity.notFound().build());
    }

    private String computeHealthScore(com.dev.delta.entities.Tenant t) {
        if (t.getStatus() == com.dev.delta.entities.Tenant.Status.SUSPENDED
                || t.getStatus() == com.dev.delta.entities.Tenant.Status.CANCELLED) { return "Churning"; }
        if (t.getStatus() == com.dev.delta.entities.Tenant.Status.ARCHIVED) { return "Archived"; }
        if (t.getSubscriptionEndsAt() != null && t.getSubscriptionEndsAt().isBefore(LocalDateTime.now().plusDays(7))) {
            return "At Risk";
        }
        return "Healthy";
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void applyTenantProfile(Tenant tenant, Map<String, Object> body) {
        if (body.containsKey("industry"))      tenant.setIndustry((String) body.get("industry"));
        if (body.containsKey("companySize"))   tenant.setCompanySize((String) body.get("companySize"));
        if (body.containsKey("country"))       tenant.setCountry((String) body.get("country"));
        if (body.containsKey("currency"))      tenant.setCurrency((String) body.get("currency"));
        if (body.containsKey("timezone"))      tenant.setTimezone((String) body.get("timezone"));
        if (body.containsKey("language"))      tenant.setLanguage((String) body.get("language"));
        if (body.containsKey("domain"))        tenant.setDomain((String) body.get("domain"));
        if (body.containsKey("subdomain"))     tenant.setSubdomain((String) body.get("subdomain"));
        if (body.containsKey("logoUrl"))       tenant.setLogoUrl((String) body.get("logoUrl"));
        if (body.containsKey("description"))   tenant.setDescription((String) body.get("description"));
        if (body.containsKey("phone"))         tenant.setPhone((String) body.get("phone"));
        if (body.containsKey("ownerName"))     tenant.setOwnerName((String) body.get("ownerName"));
        if (body.containsKey("ownerEmail"))    tenant.setOwnerEmail((String) body.get("ownerEmail"));
        if (body.containsKey("notes"))         tenant.setNotes((String) body.get("notes"));
        if (body.containsKey("maxEmployees"))  tenant.setMaxEmployees((String) body.get("maxEmployees"));
        if (body.containsKey("couponCode"))    tenant.setCouponCode((String) body.get("couponCode"));
        if (body.containsKey("discountPercent")) tenant.setDiscountPercent((String) body.get("discountPercent"));
    }
}
