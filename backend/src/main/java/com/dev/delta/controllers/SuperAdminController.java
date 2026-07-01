package com.dev.delta.controllers;

import com.dev.delta.entities.Tenant;
import com.dev.delta.services.TenantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin
@Tag(name = "Super Admin", description = "Platform super-admin management APIs")
public class SuperAdminController {

    private final TenantService tenantService;

    public SuperAdminController(TenantService tenantService) {
        this.tenantService = tenantService;
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
            try {
                tenant.setPlan(Tenant.Plan.valueOf(planStr.toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
            return ResponseEntity.ok(tenantService.save(tenant));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Delete a tenant. DELETE /api/super-admin/tenants/{code} */
    @DeleteMapping("/tenants/{code}")
    public ResponseEntity<?> deleteTenant(@PathVariable String code) {
        return tenantService.findByCode(code).map(tenant -> {
            tenantService.save(tenant);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
