package com.dev.delta.repositories;

import com.dev.delta.entities.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    // Add custom query methods if needed
}
