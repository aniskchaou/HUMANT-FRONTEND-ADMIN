package com.dev.delta.repositories;

import com.dev.delta.entities.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    // Add custom query methods if needed
}
