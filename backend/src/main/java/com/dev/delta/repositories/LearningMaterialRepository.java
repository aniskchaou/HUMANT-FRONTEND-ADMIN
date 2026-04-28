package com.dev.delta.repositories;

import com.dev.delta.entities.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {
    // Add custom query methods if needed
}
