package com.dev.delta.repositories;

import com.dev.delta.entities.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findByTenantCode(String tenantCode);
    Optional<Tenant> findByAdminEmail(String adminEmail);
    boolean existsByTenantCode(String tenantCode);
    boolean existsByAdminEmail(String adminEmail);
}
