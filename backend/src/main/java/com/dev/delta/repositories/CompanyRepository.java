package com.dev.delta.repositories;

import com.dev.delta.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findAllByOrderByNameAsc();

    Optional<Company> findFirstByDefaultCompanyTrueOrderByIdAsc();

    Optional<Company> findByCodeIgnoreCase(String code);
}