package com.dev.delta.security;

import com.dev.delta.entities.Tenant;
import com.dev.delta.repositories.TenantRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

/**
 * Reads the X-Tenant-Code header (or query param) from every request,
 * validates it against the tenants table, and populates TenantContext.
 *
 * Public endpoints (registration, Stripe webhook) are exempted.
 */
@Component
public class TenantResolutionFilter extends OncePerRequestFilter {

    private final TenantRepository tenantRepository;

    public TenantResolutionFilter(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String tenantCode = resolveTenantCode(request);

            if (tenantCode != null && !tenantCode.isBlank()) {
                Optional<Tenant> tenant = tenantRepository.findByTenantCode(tenantCode.toLowerCase().trim());
                if (tenant.isPresent() && tenant.get().getStatus() == Tenant.Status.ACTIVE) {
                    TenantContext.setCurrentTenant(tenantCode.toLowerCase().trim());
                }
                // If tenant not found/inactive, context stays null — downstream security will reject
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String resolveTenantCode(HttpServletRequest request) {
        // 1. Check request header
        String header = request.getHeader("X-Tenant-Code");
        if (header != null && !header.isBlank()) {
            return header;
        }
        // 2. Fall back to query parameter (e.g. /api/login?tenant=acme)
        String param = request.getParameter("tenant");
        if (param != null && !param.isBlank()) {
            return param;
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/tenants/register")
                || path.startsWith("/api/stripe/webhook")
                || path.startsWith("/api/tenants/check")
                // Super-admin endpoints are cross-tenant by design
                || path.startsWith("/api/super-admin");
    }
}
