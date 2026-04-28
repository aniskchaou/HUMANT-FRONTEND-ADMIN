
package com.dev.delta.controllers;


import com.dev.delta.dto.ReimbursementUpdateRequest;
import com.dev.delta.entities.Reimbursement;
import com.dev.delta.services.ReimbursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reimbursements")
@CrossOrigin
@Tag(name = "Reimbursement", description = "Reimbursement management APIs")
public class ReimbursementController {
    @Autowired
    private ReimbursementService reimbursementService;

    @Operation(summary = "Get all reimbursements")
    @GetMapping
    public List<Reimbursement> getAllReimbursements() {
        return reimbursementService.findAll();
    }

    @Operation(summary = "Get reimbursement by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Reimbursement> getReimbursementById(@PathVariable Long id) {
        Optional<Reimbursement> reimbursement = reimbursementService.findById(id);
        return reimbursement.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new reimbursement")
    @PostMapping
    public Reimbursement createReimbursement(@RequestBody Reimbursement reimbursement) {
        return reimbursementService.save(reimbursement);
    }

    @Operation(summary = "Update reimbursement by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Reimbursement> updateReimbursement(@PathVariable Long id, @RequestBody ReimbursementUpdateRequest reimbursementDetails) {
        Optional<Reimbursement> reimbursementOptional = reimbursementService.findById(id);
        if (!reimbursementOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Reimbursement updated = reimbursementService.update(id, reimbursementDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete reimbursement by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReimbursement(@PathVariable Long id) {
        if (!reimbursementService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        reimbursementService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
