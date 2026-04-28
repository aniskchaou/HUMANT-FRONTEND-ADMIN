package com.dev.delta.repositories;

import com.dev.delta.entities.Visa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisaRepository extends JpaRepository<Visa, Long> {
    // Add custom query methods if needed
}
