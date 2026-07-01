package com.dev.delta.security;

/**
 * Thread-local holder for the current tenant identifier.
 * Set by TenantResolutionFilter on every request and cleared after the response.
 */
public final class TenantContext {

    private static final ThreadLocal<String> currentTenantCode = new ThreadLocal<>();

    private TenantContext() {}

    public static void setCurrentTenant(String tenantCode) {
        currentTenantCode.set(tenantCode);
    }

    public static String getCurrentTenant() {
        return currentTenantCode.get();
    }

    public static void clear() {
        currentTenantCode.remove();
    }
}
