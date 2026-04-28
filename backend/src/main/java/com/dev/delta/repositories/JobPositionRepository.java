package com.dev.delta.repositories;

import com.dev.delta.entities.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {
    // Add custom query methods if needed
}
