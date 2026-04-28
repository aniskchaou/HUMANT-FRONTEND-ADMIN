
package com.dev.delta.controllers;


import com.dev.delta.entities.LegalCompliance;
import com.dev.delta.services.LegalComplianceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/legal-compliances")
@Tag(name = "LegalCompliance", description = "Legal compliance management APIs")
public class LegalComplianceController {
    @Autowired
    private LegalComplianceService legalComplianceService;

    @Operation(summary = "Get all legal compliances")
    @GetMapping
    public List<LegalCompliance> getAllLegalCompliances() {
        return legalComplianceService.findAll();
    }

    @Operation(summary = "Get legal compliance by ID")
    @GetMapping("/{id}")
    public ResponseEntity<LegalCompliance> getLegalComplianceById(@PathVariable Long id) {
        Optional<LegalCompliance> legalCompliance = legalComplianceService.findById(id);
        return legalCompliance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new legal compliance")
    @PostMapping
    public LegalCompliance createLegalCompliance(@RequestBody LegalCompliance legalCompliance) {
        return legalComplianceService.save(legalCompliance);
    }

    @Operation(summary = "Update legal compliance by ID")
    @PutMapping("/{id}")
    public ResponseEntity<LegalCompliance> updateLegalCompliance(@PathVariable Long id, @RequestBody LegalCompliance legalComplianceDetails) {
        Optional<LegalCompliance> legalComplianceOptional = legalComplianceService.findById(id);
        if (!legalComplianceOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        LegalCompliance legalCompliance = legalComplianceOptional.get();

        LegalCompliance updated = legalComplianceService.save(legalComplianceDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete legal compliance by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLegalCompliance(@PathVariable Long id) {
        if (!legalComplianceService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        legalComplianceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
