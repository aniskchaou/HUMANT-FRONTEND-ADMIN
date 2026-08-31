package com.dev.delta.controllers;

import com.dev.delta.entities.Integration;
import com.dev.delta.services.IntegrationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/integrations")
@CrossOrigin
@Tag(name = "Integrations", description = "Platform integration management")
public class IntegrationController {

    private final IntegrationService service;

    public IntegrationController(IntegrationService service) { this.service = service; }

    @GetMapping
    public List<Integration> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Integration> getById(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<Integration> enable(@PathVariable Long id) {
        return ResponseEntity.ok(service.enable(id, true));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<Integration> disable(@PathVariable Long id) {
        return ResponseEntity.ok(service.enable(id, false));
    }

    @PutMapping("/{id}/credentials")
    public ResponseEntity<Integration> updateCredentials(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body) {
        String credentials = body.getOrDefault("credentialsJson", "{}");
        String config      = body.getOrDefault("configJson", "{}");
        // Strip any secrets from the returned object before sending to client
        Integration saved = service.saveCredentials(id, credentials, config);
        saved.setCredentialsJson(null);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, String>> testConnection(@PathVariable Long id) {
        String result = service.testConnection(id);
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<Integration> triggerSync(@PathVariable Long id) {
        Integration updated = service.triggerSync(id);
        updated.setCredentialsJson(null);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<Map<String, String>> getLogs(@PathVariable Long id) {
        return service.findById(id).map(i ->
                ResponseEntity.ok(Map.of("logs", i.getRecentLogs() != null ? i.getRecentLogs() : "No logs yet."))
        ).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.findById(id).map(i -> {
            service.delete(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
