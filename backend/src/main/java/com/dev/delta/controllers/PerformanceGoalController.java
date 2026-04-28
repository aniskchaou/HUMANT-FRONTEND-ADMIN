package com.dev.delta.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.delta.entities.PerformanceGoal;
import com.dev.delta.services.PerformanceGoalService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/performance-goals")
@CrossOrigin
@Tag(name = "PerformanceGoal", description = "Performance goal management APIs")
public class PerformanceGoalController {

    @Autowired
    private PerformanceGoalService performanceGoalService;

    @Operation(summary = "Get all performance goals")
    @GetMapping
    public List<PerformanceGoal> getAllPerformanceGoals() {
        return performanceGoalService.findAll();
    }

    @Operation(summary = "Get performance goal by ID")
    @GetMapping("/{id}")
    public ResponseEntity<PerformanceGoal> getPerformanceGoalById(@PathVariable Long id) {
        Optional<PerformanceGoal> performanceGoal = performanceGoalService.findById(id);
        return performanceGoal.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new performance goal")
    @PostMapping
    public PerformanceGoal createPerformanceGoal(@RequestBody PerformanceGoal performanceGoal) {
        return performanceGoalService.save(performanceGoal);
    }

    @Operation(summary = "Update performance goal by ID")
    @PutMapping("/{id}")
    public ResponseEntity<PerformanceGoal> updatePerformanceGoal(
        @PathVariable Long id,
        @RequestBody PerformanceGoal performanceGoalDetails
    ) {
        if (!performanceGoalService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(performanceGoalService.update(id, performanceGoalDetails));
    }

    @Operation(summary = "Delete performance goal by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformanceGoal(@PathVariable Long id) {
        if (!performanceGoalService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        performanceGoalService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}