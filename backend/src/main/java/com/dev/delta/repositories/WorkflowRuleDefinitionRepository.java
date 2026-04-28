package com.dev.delta.repositories;

import com.dev.delta.entities.WorkflowRuleDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowRuleDefinitionRepository extends JpaRepository<WorkflowRuleDefinition, Long> {
    List<WorkflowRuleDefinition> findAllByOrderByTargetModuleAscNameAsc();
}