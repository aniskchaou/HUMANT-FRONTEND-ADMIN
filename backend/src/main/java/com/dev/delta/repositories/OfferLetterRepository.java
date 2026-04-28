package com.dev.delta.repositories;

import com.dev.delta.entities.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {
    // Add custom query methods if needed
}
