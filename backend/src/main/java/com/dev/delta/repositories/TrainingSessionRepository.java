package com.dev.delta.repositories;

import com.dev.delta.entities.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {
    // Add custom query methods if needed
}
