
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.Benefit;
import com.dev.delta.services.BenefitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/benefits")
@Tag(name = "Benefit", description = "Benefit management APIs")
public class BenefitController {
    @Autowired
    private BenefitService benefitService;


    @Operation(summary = "Get all benefits")
    @GetMapping
    public List<Benefit> getAllBenefits() {
        return benefitService.findAll();
    }


    @Operation(summary = "Get benefit by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Benefit> getBenefitById(@PathVariable Long id) {
        Optional<Benefit> benefit = benefitService.findById(id);
        return benefit.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new benefit")
    @PostMapping
    public Benefit createBenefit(@RequestBody Benefit benefit) {
        return benefitService.save(benefit);
    }


    @Operation(summary = "Update benefit by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Benefit> updateBenefit(@PathVariable Long id, @RequestBody Benefit benefitDetails) {
        Optional<Benefit> benefitOptional = benefitService.findById(id);
        if (!benefitOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Benefit benefit = benefitOptional.get();

        Benefit updated = benefitService.save(benefitDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete benefit by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBenefit(@PathVariable Long id) {
        if (!benefitService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        benefitService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
