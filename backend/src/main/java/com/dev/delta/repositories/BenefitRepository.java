package com.dev.delta.repositories;

import com.dev.delta.entities.Benefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BenefitRepository extends JpaRepository<Benefit, Long> {
    // Add custom query methods if needed
}
