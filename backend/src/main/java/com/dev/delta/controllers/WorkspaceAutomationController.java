package com.dev.delta.controllers;

import com.dev.delta.dto.AutomationReminderDTO;
import com.dev.delta.dto.LeaveBalanceSummaryDTO;
import com.dev.delta.services.WorkspaceAutomationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workspace-automation")
@Tag(name = "Workspace Automation", description = "Automation summaries for leave balances and smart reminders")
public class WorkspaceAutomationController {

    @Autowired
    private WorkspaceAutomationService workspaceAutomationService;

    @Operation(summary = "Get leave balance summaries")
    @GetMapping("/leave-balances")
    public ResponseEntity<List<LeaveBalanceSummaryDTO>> getLeaveBalances() {
        return ResponseEntity.ok(workspaceAutomationService.getLeaveBalances());
    }

    @Operation(summary = "Get smart reminder summaries")
    @GetMapping("/reminders")
    public ResponseEntity<List<AutomationReminderDTO>> getSmartReminders() {
        return ResponseEntity.ok(workspaceAutomationService.getSmartReminders());
    }
}