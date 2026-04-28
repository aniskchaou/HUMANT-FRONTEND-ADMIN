package com.dev.delta.repositories;

import com.dev.delta.entities.WorkspaceConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceConfigurationRepository extends JpaRepository<WorkspaceConfiguration, Long> {
    Optional<WorkspaceConfiguration> findFirstByOrderByIdAsc();
}