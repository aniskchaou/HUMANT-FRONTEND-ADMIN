package com.dev.delta.repositories;

import com.dev.delta.entities.ExitInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExitInterviewRepository extends JpaRepository<ExitInterview, Long> {
    List<ExitInterview> findAllByEmployeeIdOrderByInterviewDateDescIdDesc(Long employeeId);
}
