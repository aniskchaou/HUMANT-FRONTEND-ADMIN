
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.CompensationHistory;
import com.dev.delta.services.CompensationHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/compensation-histories")
@CrossOrigin
@Tag(name = "CompensationHistory", description = "Compensation History management APIs")
public class CompensationHistoryController {
    @Autowired
    private CompensationHistoryService compensationHistoryService;


    @Operation(summary = "Get all compensation histories")
    @GetMapping
    public List<CompensationHistory> getAllCompensationHistories() {
        return compensationHistoryService.findAll();
    }


    @Operation(summary = "Get compensation history by ID")
    @GetMapping("/{id}")
    public ResponseEntity<CompensationHistory> getCompensationHistoryById(@PathVariable Long id) {
        Optional<CompensationHistory> compensationHistory = compensationHistoryService.findById(id);
        return compensationHistory.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new compensation history")
    @PostMapping
    public CompensationHistory createCompensationHistory(@RequestBody CompensationHistory compensationHistory) {
        return compensationHistoryService.save(compensationHistory);
    }


    @Operation(summary = "Update compensation history by ID")
    @PutMapping("/{id}")
    public ResponseEntity<CompensationHistory> updateCompensationHistory(@PathVariable Long id, @RequestBody CompensationHistory compensationHistoryDetails) {
        Optional<CompensationHistory> compensationHistoryOptional = compensationHistoryService.findById(id);
        if (!compensationHistoryOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        CompensationHistory compensationHistory = compensationHistoryOptional.get();
		compensationHistory.setEffectiveDate(compensationHistoryDetails.getEffectiveDate());
		compensationHistory.setSalary(compensationHistoryDetails.getSalary());
		compensationHistory.setBonus(compensationHistoryDetails.getBonus());
		compensationHistory.setNotes(compensationHistoryDetails.getNotes());
		compensationHistory.setEmployee(compensationHistoryDetails.getEmployee());
		CompensationHistory updated = compensationHistoryService.save(compensationHistory);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete compensation history by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompensationHistory(@PathVariable Long id) {
        if (!compensationHistoryService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        compensationHistoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
