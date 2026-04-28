package com.dev.delta.repositories;

import com.dev.delta.entities.Mentorship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentorshipRepository extends JpaRepository<Mentorship, Long> {
    // Add custom query methods if needed
}
