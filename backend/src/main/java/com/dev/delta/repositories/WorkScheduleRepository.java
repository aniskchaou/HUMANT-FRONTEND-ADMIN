package com.dev.delta.repositories;

import com.dev.delta.entities.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    // Add custom query methods if needed
}
