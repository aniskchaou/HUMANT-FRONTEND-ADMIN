package com.dev.delta.repositories;

import com.dev.delta.entities.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    // Add custom query methods if needed
}
