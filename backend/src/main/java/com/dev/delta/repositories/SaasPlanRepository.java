package com.dev.delta.repositories;

import com.dev.delta.entities.SaasPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaasPlanRepository extends JpaRepository<SaasPlan, Long> {
    Optional<SaasPlan> findByPlanKey(String planKey);
    List<SaasPlan> findByEnabledTrueAndHiddenFalseOrderBySortOrderAsc();
    List<SaasPlan> findAllByOrderBySortOrderAsc();
}
