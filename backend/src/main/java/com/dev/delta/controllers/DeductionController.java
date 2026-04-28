
package com.dev.delta.controllers;


import com.dev.delta.entities.Deduction;
import com.dev.delta.services.DeductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/deductions")
@CrossOrigin
@Tag(name = "Deduction", description = "Deduction management APIs")
public class DeductionController {
    @Autowired
    private DeductionService deductionService;

    @Operation(summary = "Get all deductions")
    @GetMapping
    public List<Deduction> getAllDeductions() {
        return deductionService.findAll();
    }

    @Operation(summary = "Get deduction by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Deduction> getDeductionById(@PathVariable Long id) {
        Optional<Deduction> deduction = deductionService.findById(id);
        return deduction.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new deduction")
    @PostMapping
    public Deduction createDeduction(@RequestBody Deduction deduction) {
        return deductionService.save(deduction);
    }

    @Operation(summary = "Update deduction by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Deduction> updateDeduction(@PathVariable Long id, @RequestBody Deduction deductionDetails) {
        Optional<Deduction> deductionOptional = deductionService.findById(id);
        if (!deductionOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Deduction updated = deductionService.update(id, deductionDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete deduction by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeduction(@PathVariable Long id) {
        if (!deductionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        deductionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
