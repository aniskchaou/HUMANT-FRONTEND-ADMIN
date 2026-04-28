package com.dev.delta.repositories;

import com.dev.delta.entities.CustomFieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomFieldDefinitionRepository extends JpaRepository<CustomFieldDefinition, Long> {
    List<CustomFieldDefinition> findAllByOrderByTargetModuleAscLabelAsc();
}