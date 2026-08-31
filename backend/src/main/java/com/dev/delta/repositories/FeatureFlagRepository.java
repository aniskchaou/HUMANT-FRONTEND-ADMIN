package com.dev.delta.repositories;

import com.dev.delta.entities.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {
    Optional<FeatureFlag> findByFeatureKey(String featureKey);
    List<FeatureFlag> findAllByOrderByModuleAscFeatureNameAsc();
    List<FeatureFlag> findByModuleOrderByFeatureNameAsc(String module);
}
