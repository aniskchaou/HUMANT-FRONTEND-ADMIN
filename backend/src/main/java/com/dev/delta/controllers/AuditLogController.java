package com.dev.delta.controllers;

import com.dev.delta.entities.AuditLogEntry;
import com.dev.delta.services.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@Tag(name = "Audit Logs", description = "Admin audit and monitoring APIs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @Operation(summary = "Get recent audit logs")
    @GetMapping
    public ResponseEntity<List<AuditLogEntry>> getRecentEntries() {
        return ResponseEntity.ok(auditLogService.getRecentEntries());
    }
}