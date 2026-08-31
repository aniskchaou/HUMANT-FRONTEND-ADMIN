package com.dev.delta.repositories;

import com.dev.delta.entities.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, Long> {
    Optional<Integration> findByIntegrationKey(String integrationKey);
    List<Integration> findByCategoryOrderByNameAsc(Integration.Category category);
    List<Integration> findAllByOrderByCategoryAscNameAsc();
    List<Integration> findByEnabledTrue();
}
