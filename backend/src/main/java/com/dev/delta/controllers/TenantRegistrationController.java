package com.dev.delta.controllers;

import com.dev.delta.entities.Tenant;
import com.dev.delta.services.StripeService;
import com.dev.delta.services.TenantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin
@Tag(name = "Tenant Registration", description = "Public tenant onboarding APIs")
public class TenantRegistrationController {

    private final TenantService tenantService;
    private final StripeService stripeService;

    public TenantRegistrationController(TenantService tenantService, StripeService stripeService) {
        this.tenantService = tenantService;
        this.stripeService = stripeService;
    }

    /**
     * Check if a tenant code is available.
     * GET /api/tenants/check?code=acme
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkCode(@RequestParam String code) {
        Map<String, Object> result = new HashMap<>();
        boolean available = !tenantService.codeExists(code);
        result.put("code", code.toLowerCase().trim());
        result.put("available", available);
        return ResponseEntity.ok(result);
    }

    /**
     * Register a new tenant (company).
     * POST /api/tenants/register
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String tenantCode = body.getOrDefault("tenantCode", "").trim();
        String companyName = body.getOrDefault("companyName", "").trim();
        String adminEmail = body.getOrDefault("adminEmail", "").trim();
        String adminUsername = body.getOrDefault("adminUsername", "").trim();
        String adminPassword = body.getOrDefault("adminPassword", "").trim();

        if (tenantCode.isBlank() || companyName.isBlank() || adminEmail.isBlank()
                || adminUsername.isBlank() || adminPassword.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "All fields are required.");
            return ResponseEntity.badRequest().body(error);
        }

        if (adminPassword.length() < 8) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Password must be at least 8 characters.");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            Tenant tenant = tenantService.register(tenantCode, companyName, adminEmail, adminUsername, adminPassword);
            Map<String, Object> response = new HashMap<>();
            response.put("tenantCode", tenant.getTenantCode());
            response.put("companyName", tenant.getCompanyName());
            response.put("plan", tenant.getPlan().name());
            response.put("status", tenant.getStatus().name());
            response.put("trialEndsAt", tenant.getTrialEndsAt() != null ? tenant.getTrialEndsAt().toString() : null);
            response.put("message", "Registration successful. Your 14-day free trial has started.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Start a Stripe checkout session to upgrade plan.
     * POST /api/tenants/subscribe
     */
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(@RequestBody Map<String, String> body) {
        String tenantCode = body.getOrDefault("tenantCode", "").trim();
        String priceId = body.getOrDefault("priceId", "").trim();

        if (tenantCode.isBlank() || priceId.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "tenantCode and priceId are required.");
            return ResponseEntity.badRequest().body(err);
        }

        return tenantService.findByCode(tenantCode).map(tenant -> {
            try {
                String url = stripeService.createCheckoutSession(
                        tenant.getStripeCustomerId(), priceId, tenantCode);
                Map<String, Object> response = new HashMap<>();
                response.put("checkoutUrl", url);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "Could not create checkout session: " + e.getMessage());
                return ResponseEntity.<Map<String, Object>>status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
            }
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Tenant not found.");
            return ResponseEntity.<Map<String, Object>>status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
