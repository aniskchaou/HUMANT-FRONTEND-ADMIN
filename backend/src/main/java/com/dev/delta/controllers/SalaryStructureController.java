
package com.dev.delta.controllers;


import com.dev.delta.entities.SalaryStructure;
import com.dev.delta.services.SalaryStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/salary-structures")
@Tag(name = "SalaryStructure", description = "Salary structure management APIs")
public class SalaryStructureController {
    @Autowired
    private SalaryStructureService salaryStructureService;

    @Operation(summary = "Get all salary structures")
    @GetMapping
    public List<SalaryStructure> getAllSalaryStructures() {
        return salaryStructureService.findAll();
    }

    @Operation(summary = "Get salary structure by ID")
    @GetMapping("/{id}")
    public ResponseEntity<SalaryStructure> getSalaryStructureById(@PathVariable Long id) {
        Optional<SalaryStructure> salaryStructure = salaryStructureService.findById(id);
        return salaryStructure.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new salary structure")
    @PostMapping
    public SalaryStructure createSalaryStructure(@RequestBody SalaryStructure salaryStructure) {
        return salaryStructureService.save(salaryStructure);
    }

    @Operation(summary = "Update salary structure by ID")
    @PutMapping("/{id}")
    public ResponseEntity<SalaryStructure> updateSalaryStructure(@PathVariable Long id, @RequestBody SalaryStructure salaryStructureDetails) {
        Optional<SalaryStructure> salaryStructureOptional = salaryStructureService.findById(id);
        if (!salaryStructureOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        SalaryStructure salaryStructure = salaryStructureOptional.get();

        SalaryStructure updated = salaryStructureService.save(salaryStructureDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete salary structure by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalaryStructure(@PathVariable Long id) {
        if (!salaryStructureService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        salaryStructureService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
