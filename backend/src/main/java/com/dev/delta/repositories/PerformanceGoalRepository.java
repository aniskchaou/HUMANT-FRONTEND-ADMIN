package com.dev.delta.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.delta.entities.PerformanceGoal;

@Repository
public interface PerformanceGoalRepository extends JpaRepository<PerformanceGoal, Long> {
    List<PerformanceGoal> findAllByOrderByDueDateAscIdDesc();

    List<PerformanceGoal> findAllByEmployeeIdOrderByDueDateAscIdDesc(Long employeeId);
}