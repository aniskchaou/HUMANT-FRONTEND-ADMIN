package com.dev.delta.repositories;

import com.dev.delta.entities.Objective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObjectiveRepository extends JpaRepository<Objective, Long> {
    // Add custom query methods if needed
}
