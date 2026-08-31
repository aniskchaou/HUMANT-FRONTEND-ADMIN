package com.dev.delta.services;

import com.dev.delta.entities.FeatureFlag;
import com.dev.delta.repositories.FeatureFlagRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class FeatureFlagService {

    private final FeatureFlagRepository repo;

    public FeatureFlagService(FeatureFlagRepository repo) {
        this.repo = repo;
    }

    public List<FeatureFlag> findAll() {
        return repo.findAllByOrderByModuleAscFeatureNameAsc();
    }

    public Optional<FeatureFlag> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<FeatureFlag> findByKey(String key) {
        return repo.findByFeatureKey(key);
    }

    public FeatureFlag save(FeatureFlag flag) {
        return repo.save(flag);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    /** Returns true if the feature is enabled for the given tenantCode on the given plan. */
    public boolean isEnabled(String featureKey, String tenantCode, String planKey) {
        return repo.findByFeatureKey(featureKey).map(f -> {
            if (Boolean.TRUE.equals(f.getEnabledGlobally())) { return true; }
            String plans = f.getEnabledForPlans() != null ? f.getEnabledForPlans() : "";
            if (!plans.isEmpty() && Arrays.asList(plans.split(",")).contains(planKey)) { return true; }
            String tenants = f.getEnabledForTenants() != null ? f.getEnabledForTenants() : "";
            if (!tenants.isEmpty() && Arrays.asList(tenants.split(",")).contains(tenantCode)) { return true; }
            return false;
        }).orElse(false);
    }

    /** Toggle a plan on/off for a feature flag. */
    public FeatureFlag togglePlan(Long id, String planKey, boolean enable) {
        FeatureFlag flag = repo.findById(id).orElseThrow();
        List<String> plans = new java.util.ArrayList<>(
                flag.getEnabledForPlans() == null || flag.getEnabledForPlans().isEmpty()
                        ? List.of()
                        : Arrays.asList(flag.getEnabledForPlans().split(",")));
        if (enable) { if (!plans.contains(planKey)) { plans.add(planKey); } }
        else { plans.remove(planKey); }
        flag.setEnabledForPlans(String.join(",", plans));
        return repo.save(flag);
    }

    /** Toggle a tenant override on/off for a feature flag. */
    public FeatureFlag toggleTenant(Long id, String tenantCode, boolean enable) {
        FeatureFlag flag = repo.findById(id).orElseThrow();
        List<String> tenants = new java.util.ArrayList<>(
                flag.getEnabledForTenants() == null || flag.getEnabledForTenants().isEmpty()
                        ? List.of()
                        : Arrays.asList(flag.getEnabledForTenants().split(",")));
        if (enable) { if (!tenants.contains(tenantCode)) { tenants.add(tenantCode); } }
        else { tenants.remove(tenantCode); }
        flag.setEnabledForTenants(String.join(",", tenants));
        return repo.save(flag);
    }
}
