package com.dev.delta.controllers;

import com.dev.delta.entities.SaasPlan;
import com.dev.delta.services.SaasPlanService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/plans")
@CrossOrigin
@Tag(name = "SaaS Plans", description = "Super-admin plan & pricing management")
public class SaasPlanController {

    private final SaasPlanService service;

    public SaasPlanController(SaasPlanService service) {
        this.service = service;
    }

    @GetMapping
    public List<SaasPlan> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaasPlan> getById(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SaasPlan> create(@RequestBody SaasPlan plan) {
        return ResponseEntity.ok(service.save(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SaasPlan> update(@PathVariable Long id, @RequestBody SaasPlan body) {
        return service.findById(id).map(existing -> {
            body.setId(existing.getId());
            return ResponseEntity.ok(service.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.findById(id).map(p -> {
            service.delete(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-enabled")
    public ResponseEntity<SaasPlan> toggleEnabled(@PathVariable Long id) {
        return service.findById(id).map(p -> {
            p.setEnabled(!Boolean.TRUE.equals(p.getEnabled()));
            return ResponseEntity.ok(service.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-hidden")
    public ResponseEntity<SaasPlan> toggleHidden(@PathVariable Long id) {
        return service.findById(id).map(p -> {
            p.setHidden(!Boolean.TRUE.equals(p.getHidden()));
            return ResponseEntity.ok(service.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-popular")
    public ResponseEntity<SaasPlan> togglePopular(@PathVariable Long id) {
        return service.findById(id).map(p -> {
            p.setPopular(!Boolean.TRUE.equals(p.getPopular()));
            return ResponseEntity.ok(service.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/features")
    public ResponseEntity<SaasPlan> updateFeatures(@PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        return service.findById(id).map(p -> {
            p.setFeatures(body.getOrDefault("features", ""));
            return ResponseEntity.ok(service.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }
}
