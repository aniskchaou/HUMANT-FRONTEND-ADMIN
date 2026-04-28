
package com.dev.delta.controllers;


import com.dev.delta.entities.FinalSettlement;
import com.dev.delta.services.FinalSettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/final-settlements")
@Tag(name = "FinalSettlement", description = "Final settlement management APIs")
public class FinalSettlementController {
    @Autowired
    private FinalSettlementService finalSettlementService;

    @Operation(summary = "Get all final settlements")
    @GetMapping
    public List<FinalSettlement> getAllFinalSettlements() {
        return finalSettlementService.findAll();
    }

    @Operation(summary = "Get final settlement by ID")
    @GetMapping("/{id}")
    public ResponseEntity<FinalSettlement> getFinalSettlementById(@PathVariable Long id) {
        Optional<FinalSettlement> finalSettlement = finalSettlementService.findById(id);
        return finalSettlement.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new final settlement")
    @PostMapping
    public FinalSettlement createFinalSettlement(@RequestBody FinalSettlement finalSettlement) {
        return finalSettlementService.save(finalSettlement);
    }

    @Operation(summary = "Update final settlement by ID")
    @PutMapping("/{id}")
    public ResponseEntity<FinalSettlement> updateFinalSettlement(@PathVariable Long id, @RequestBody FinalSettlement finalSettlementDetails) {
        FinalSettlement updated = finalSettlementService.update(id, finalSettlementDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete final settlement by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinalSettlement(@PathVariable Long id) {
        finalSettlementService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
