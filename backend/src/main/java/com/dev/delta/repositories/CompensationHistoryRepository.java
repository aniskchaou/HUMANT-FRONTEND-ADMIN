package com.dev.delta.repositories;

import com.dev.delta.entities.CompensationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompensationHistoryRepository extends JpaRepository<CompensationHistory, Long> {
    // Add custom query methods if needed
}
