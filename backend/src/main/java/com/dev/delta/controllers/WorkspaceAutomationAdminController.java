package com.dev.delta.controllers;

import com.dev.delta.entities.ApprovalFlowDefinition;
import com.dev.delta.entities.CustomFieldDefinition;
import com.dev.delta.entities.WorkflowRuleDefinition;
import com.dev.delta.services.WorkspaceAutomationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Tag(name = "Workspace Automation Admin", description = "Custom fields, approval flows, and workflow rule configuration APIs")
public class WorkspaceAutomationAdminController {

    @Autowired
    private WorkspaceAutomationService workspaceAutomationService;

    @Operation(summary = "Get custom fields")
    @GetMapping("/api/custom-fields")
    public ResponseEntity<List<CustomFieldDefinition>> getCustomFields() {
        return ResponseEntity.ok(workspaceAutomationService.getCustomFields());
    }

    @Operation(summary = "Create custom field")
    @PostMapping("/api/custom-fields")
    public ResponseEntity<CustomFieldDefinition> createCustomField(@RequestBody CustomFieldDefinition fieldDefinition) {
        return ResponseEntity.ok(workspaceAutomationService.createCustomField(fieldDefinition));
    }

    @Operation(summary = "Update custom field")
    @PutMapping("/api/custom-fields/{id}")
    public ResponseEntity<CustomFieldDefinition> updateCustomField(
        @PathVariable Long id,
        @RequestBody CustomFieldDefinition fieldDefinition
    ) {
        return ResponseEntity.ok(workspaceAutomationService.updateCustomField(id, fieldDefinition));
    }

    @Operation(summary = "Delete custom field")
    @DeleteMapping("/api/custom-fields/{id}")
    public ResponseEntity<Void> deleteCustomField(@PathVariable Long id) {
        workspaceAutomationService.deleteCustomField(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get approval flows")
    @GetMapping("/api/approval-flows")
    public ResponseEntity<List<ApprovalFlowDefinition>> getApprovalFlows() {
        return ResponseEntity.ok(workspaceAutomationService.getApprovalFlows());
    }

    @Operation(summary = "Create approval flow")
    @PostMapping("/api/approval-flows")
    public ResponseEntity<ApprovalFlowDefinition> createApprovalFlow(@RequestBody ApprovalFlowDefinition flowDefinition) {
        return ResponseEntity.ok(workspaceAutomationService.createApprovalFlow(flowDefinition));
    }

    @Operation(summary = "Update approval flow")
    @PutMapping("/api/approval-flows/{id}")
    public ResponseEntity<ApprovalFlowDefinition> updateApprovalFlow(
        @PathVariable Long id,
        @RequestBody ApprovalFlowDefinition flowDefinition
    ) {
        return ResponseEntity.ok(workspaceAutomationService.updateApprovalFlow(id, flowDefinition));
    }

    @Operation(summary = "Delete approval flow")
    @DeleteMapping("/api/approval-flows/{id}")
    public ResponseEntity<Void> deleteApprovalFlow(@PathVariable Long id) {
        workspaceAutomationService.deleteApprovalFlow(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get workflow rules")
    @GetMapping("/api/workflow-rules")
    public ResponseEntity<List<WorkflowRuleDefinition>> getWorkflowRules() {
        return ResponseEntity.ok(workspaceAutomationService.getWorkflowRules());
    }

    @Operation(summary = "Create workflow rule")
    @PostMapping("/api/workflow-rules")
    public ResponseEntity<WorkflowRuleDefinition> createWorkflowRule(@RequestBody WorkflowRuleDefinition ruleDefinition) {
        return ResponseEntity.ok(workspaceAutomationService.createWorkflowRule(ruleDefinition));
    }

    @Operation(summary = "Update workflow rule")
    @PutMapping("/api/workflow-rules/{id}")
    public ResponseEntity<WorkflowRuleDefinition> updateWorkflowRule(
        @PathVariable Long id,
        @RequestBody WorkflowRuleDefinition ruleDefinition
    ) {
        return ResponseEntity.ok(workspaceAutomationService.updateWorkflowRule(id, ruleDefinition));
    }

    @Operation(summary = "Delete workflow rule")
    @DeleteMapping("/api/workflow-rules/{id}")
    public ResponseEntity<Void> deleteWorkflowRule(@PathVariable Long id) {
        workspaceAutomationService.deleteWorkflowRule(id);
        return ResponseEntity.noContent().build();
    }
}