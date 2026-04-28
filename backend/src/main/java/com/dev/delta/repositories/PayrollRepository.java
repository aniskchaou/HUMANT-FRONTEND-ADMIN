package com.dev.delta.repositories;

import com.dev.delta.entities.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findAllByOrderByPayrollDateDescIdDesc();

    Optional<Payroll> findFirstByEmployeeIdAndCycleMonthOrderByIdDesc(Long employeeId, String cycleMonth);
}
