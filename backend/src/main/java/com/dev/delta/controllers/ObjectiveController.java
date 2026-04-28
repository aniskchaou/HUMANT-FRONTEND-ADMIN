
package com.dev.delta.controllers;


import com.dev.delta.entities.Objective;
import com.dev.delta.services.ObjectiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/objectives")
@Tag(name = "Objective", description = "Objective management APIs")
public class ObjectiveController {
    @Autowired
    private ObjectiveService objectiveService;

    @Operation(summary = "Get all objectives")
    @GetMapping
    public List<Objective> getAllObjectives() {
        return objectiveService.findAll();
    }

    @Operation(summary = "Get objective by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Objective> getObjectiveById(@PathVariable Long id) {
        Optional<Objective> objective = objectiveService.findById(id);
        return objective.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new objective")
    @PostMapping
    public Objective createObjective(@RequestBody Objective objective) {
        return objectiveService.save(objective);
    }

    @Operation(summary = "Update objective by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Objective> updateObjective(@PathVariable Long id, @RequestBody Objective objectiveDetails) {
        Optional<Objective> objectiveOptional = objectiveService.findById(id);
        if (!objectiveOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Objective objective = objectiveOptional.get();

        Objective updated = objectiveService.save(objectiveDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete objective by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObjective(@PathVariable Long id) {
        if (!objectiveService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        objectiveService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
