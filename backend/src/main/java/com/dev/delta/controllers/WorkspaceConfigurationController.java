package com.dev.delta.controllers;

import com.dev.delta.entities.WorkspaceConfiguration;
import com.dev.delta.services.WorkspaceConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspace-configuration")
@Tag(name = "Workspace Configuration", description = "Workspace configuration and automation settings APIs")
public class WorkspaceConfigurationController {

    @Autowired
    private WorkspaceConfigurationService workspaceConfigurationService;

    @Operation(summary = "Get workspace configuration")
    @GetMapping
    public ResponseEntity<WorkspaceConfiguration> getConfiguration() {
        return ResponseEntity.ok(workspaceConfigurationService.getConfiguration());
    }

    @Operation(summary = "Update workspace configuration")
    @PutMapping
    public ResponseEntity<WorkspaceConfiguration> updateConfiguration(
        @RequestBody WorkspaceConfiguration configurationDetails
    ) {
        return ResponseEntity.ok(workspaceConfigurationService.updateConfiguration(configurationDetails));
    }
}