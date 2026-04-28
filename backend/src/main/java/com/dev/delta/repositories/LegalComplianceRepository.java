package com.dev.delta.repositories;

import com.dev.delta.entities.LegalCompliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LegalComplianceRepository extends JpaRepository<LegalCompliance, Long> {
    // Add custom query methods if needed
}
