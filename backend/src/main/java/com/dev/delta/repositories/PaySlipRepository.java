package com.dev.delta.repositories;

import com.dev.delta.entities.PaySlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaySlipRepository extends JpaRepository<PaySlip, Long> {
    List<PaySlip> findAllByOrderByIssueDateDescIdDesc();

    List<PaySlip> findAllByEmployeeIdOrderByIssueDateDescIdDesc(Long employeeId);

    Optional<PaySlip> findFirstByEmployeeIdAndCycleMonthOrderByIdDesc(Long employeeId, String cycleMonth);
}
