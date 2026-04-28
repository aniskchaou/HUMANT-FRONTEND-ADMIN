package com.dev.delta.repositories;

import com.dev.delta.entities.Deduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeductionRepository extends JpaRepository<Deduction, Long> {
    List<Deduction> findByDeductionDateBetween(LocalDate startDate, LocalDate endDate);
}
