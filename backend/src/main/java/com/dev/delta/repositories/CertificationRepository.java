package com.dev.delta.repositories;

import com.dev.delta.entities.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    // Add custom query methods if needed
}
