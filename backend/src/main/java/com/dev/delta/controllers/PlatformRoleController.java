package com.dev.delta.controllers;

import com.dev.delta.entities.PlatformRole;
import com.dev.delta.services.PlatformRoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/platform-roles")
@CrossOrigin
@Tag(name = "Platform Roles", description = "Platform role and permission management")
public class PlatformRoleController {

    private final PlatformRoleService service;

    public PlatformRoleController(PlatformRoleService service) { this.service = service; }

    @GetMapping
    public List<PlatformRole> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<PlatformRole> getById(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PlatformRole> create(@RequestBody PlatformRole role) {
        role.setSystemRole(false);
        return ResponseEntity.ok(service.save(role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlatformRole> update(@PathVariable Long id, @RequestBody PlatformRole body) {
        return service.findById(id).map(existing -> {
            body.setId(existing.getId());
            body.setSystemRole(existing.getSystemRole());
            return ResponseEntity.ok(service.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        return service.findById(id).map(r -> {
            if (Boolean.TRUE.equals(r.getSystemRole())) {
                return ResponseEntity.badRequest()
                        .<Map<String, String>>body(Map.of("error", "System roles cannot be deleted"));
            }
            service.delete(id);
            return ResponseEntity.ok(Map.of("message", "Role deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<PlatformRole> updatePermissions(@PathVariable Long id,
                                                           @RequestBody Map<String, String> body) {
        return service.findById(id).map(r -> {
            r.setPermissions(body.getOrDefault("permissions", ""));
            return ResponseEntity.ok(service.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<PlatformRole> toggleActive(@PathVariable Long id) {
        return service.findById(id).map(r -> {
            r.setActive(!Boolean.TRUE.equals(r.getActive()));
            return ResponseEntity.ok(service.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }
}
