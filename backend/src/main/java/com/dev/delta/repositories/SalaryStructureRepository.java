package com.dev.delta.repositories;

import com.dev.delta.entities.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    // Add custom query methods if needed
}
