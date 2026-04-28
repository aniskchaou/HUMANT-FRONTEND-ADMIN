
package com.dev.delta.controllers;


import com.dev.delta.entities.InsurancePlan;
import com.dev.delta.services.InsurancePlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/insurance-plans")
@Tag(name = "InsurancePlan", description = "Insurance plan management APIs")
public class InsurancePlanController {
    @Autowired
    private InsurancePlanService insurancePlanService;

    @Operation(summary = "Get all insurance plans")
    @GetMapping
    public List<InsurancePlan> getAllInsurancePlans() {
        return insurancePlanService.findAll();
    }

    @Operation(summary = "Get insurance plan by ID")
    @GetMapping("/{id}")
    public ResponseEntity<InsurancePlan> getInsurancePlanById(@PathVariable Long id) {
        Optional<InsurancePlan> insurancePlan = insurancePlanService.findById(id);
        return insurancePlan.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new insurance plan")
    @PostMapping
    public InsurancePlan createInsurancePlan(@RequestBody InsurancePlan insurancePlan) {
        return insurancePlanService.save(insurancePlan);
    }

    @Operation(summary = "Update insurance plan by ID")
    @PutMapping("/{id}")
    public ResponseEntity<InsurancePlan> updateInsurancePlan(@PathVariable Long id, @RequestBody InsurancePlan insurancePlanDetails) {
        Optional<InsurancePlan> insurancePlanOptional = insurancePlanService.findById(id);
        if (!insurancePlanOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        InsurancePlan insurancePlan = insurancePlanOptional.get();

        InsurancePlan updated = insurancePlanService.save(insurancePlanDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete insurance plan by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurancePlan(@PathVariable Long id) {
        if (!insurancePlanService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        insurancePlanService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
