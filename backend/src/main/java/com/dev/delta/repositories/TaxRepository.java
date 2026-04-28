package com.dev.delta.repositories;

import com.dev.delta.entities.Tax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaxRepository extends JpaRepository<Tax, Long> {
    List<Tax> findByTaxDateBetween(LocalDate startDate, LocalDate endDate);
}
