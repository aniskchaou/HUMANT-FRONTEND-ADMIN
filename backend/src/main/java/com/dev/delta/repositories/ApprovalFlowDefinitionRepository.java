package com.dev.delta.repositories;

import com.dev.delta.entities.ApprovalFlowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalFlowDefinitionRepository extends JpaRepository<ApprovalFlowDefinition, Long> {
    List<ApprovalFlowDefinition> findAllByOrderByTargetModuleAscNameAsc();
}