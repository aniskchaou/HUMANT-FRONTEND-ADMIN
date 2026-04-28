package com.dev.delta.repositories;

import com.dev.delta.entities.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {
    // Add custom query methods if needed
}
