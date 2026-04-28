
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.Clearance;
import com.dev.delta.services.ClearanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clearances")
@Tag(name = "Clearance", description = "Clearance management APIs")
public class ClearanceController {
    @Autowired
    private ClearanceService clearanceService;


    @Operation(summary = "Get all clearances")
    @GetMapping
    public List<Clearance> getAllClearances() {
        return clearanceService.findAll();
    }


    @Operation(summary = "Get clearance by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Clearance> getClearanceById(@PathVariable Long id) {
        Optional<Clearance> clearance = clearanceService.findById(id);
        return clearance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new clearance")
    @PostMapping
    public Clearance createClearance(@RequestBody Clearance clearance) {
        return clearanceService.save(clearance);
    }


    @Operation(summary = "Update clearance by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Clearance> updateClearance(@PathVariable Long id, @RequestBody Clearance clearanceDetails) {
        Clearance updated = clearanceService.update(id, clearanceDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete clearance by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClearance(@PathVariable Long id) {
        clearanceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
