package com.dev.delta.repositories;

import com.dev.delta.entities.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {
    // Add custom query methods if needed
}
