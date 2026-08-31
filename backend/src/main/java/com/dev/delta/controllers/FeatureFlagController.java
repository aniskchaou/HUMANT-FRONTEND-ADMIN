package com.dev.delta.controllers;

import com.dev.delta.entities.FeatureFlag;
import com.dev.delta.services.FeatureFlagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/features")
@CrossOrigin
@Tag(name = "Feature Flags", description = "Super-admin feature flag management")
public class FeatureFlagController {

    private final FeatureFlagService service;

    public FeatureFlagController(FeatureFlagService service) {
        this.service = service;
    }

    @GetMapping
    public List<FeatureFlag> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeatureFlag> getById(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FeatureFlag> create(@RequestBody FeatureFlag flag) {
        return ResponseEntity.ok(service.save(flag));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeatureFlag> update(@PathVariable Long id, @RequestBody FeatureFlag body) {
        return service.findById(id).map(existing -> {
            body.setId(existing.getId());
            return ResponseEntity.ok(service.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.findById(id).map(f -> {
            service.delete(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-global")
    public ResponseEntity<FeatureFlag> toggleGlobal(@PathVariable Long id) {
        return service.findById(id).map(f -> {
            f.setEnabledGlobally(!Boolean.TRUE.equals(f.getEnabledGlobally()));
            return ResponseEntity.ok(service.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/plan-toggle")
    public ResponseEntity<FeatureFlag> togglePlan(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> body) {
        String planKey = (String) body.get("planKey");
        boolean enable = Boolean.TRUE.equals(body.get("enable"));
        return ResponseEntity.ok(service.togglePlan(id, planKey, enable));
    }

    @PutMapping("/{id}/tenant-toggle")
    public ResponseEntity<FeatureFlag> toggleTenant(@PathVariable Long id,
                                                     @RequestBody Map<String, Object> body) {
        String tenantCode = (String) body.get("tenantCode");
        boolean enable = Boolean.TRUE.equals(body.get("enable"));
        return ResponseEntity.ok(service.toggleTenant(id, tenantCode, enable));
    }

    @PutMapping("/{id}/rollout")
    public ResponseEntity<FeatureFlag> setRollout(@PathVariable Long id,
                                                   @RequestBody Map<String, Integer> body) {
        return service.findById(id).map(f -> {
            f.setRolloutPercent(body.getOrDefault("percent", 0));
            return ResponseEntity.ok(service.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Check if a feature is enabled for a specific tenant + plan combination. */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> check(
            @RequestParam String featureKey,
            @RequestParam(required = false, defaultValue = "") String tenantCode,
            @RequestParam(required = false, defaultValue = "") String planKey) {
        boolean enabled = service.isEnabled(featureKey, tenantCode, planKey);
        return ResponseEntity.ok(Map.of("featureKey", featureKey, "enabled", enabled));
    }
}
