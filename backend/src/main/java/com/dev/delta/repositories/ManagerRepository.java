package com.dev.delta.repositories;

import com.dev.delta.entities.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {
    // Add custom query methods if needed
}
