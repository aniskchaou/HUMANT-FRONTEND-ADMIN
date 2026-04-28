package com.dev.delta.repositories;

import com.dev.delta.entities.ExitRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExitRequestRepository extends JpaRepository<ExitRequest, Long> {
    List<ExitRequest> findAllByEmployeeIdOrderBySubmittedAtDescIdDesc(Long employeeId);
}
