
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.TrainingSession;
import com.dev.delta.services.TrainingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/training-sessions")
@Tag(name = "TrainingSession", description = "Training Session management APIs")
public class TrainingSessionController {
    @Autowired
    private TrainingSessionService trainingSessionService;


    @Operation(summary = "Get all training sessions")
    @GetMapping
    public List<TrainingSession> getAllTrainingSessions() {
        return trainingSessionService.findAll();
    }


    @Operation(summary = "Get training session by ID")
    @GetMapping("/{id}")
    public ResponseEntity<TrainingSession> getTrainingSessionById(@PathVariable Long id) {
        Optional<TrainingSession> trainingSession = trainingSessionService.findById(id);
        return trainingSession.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new training session")
    @PostMapping
    public TrainingSession createTrainingSession(@RequestBody TrainingSession trainingSession) {
        return trainingSessionService.save(trainingSession);
    }


    @Operation(summary = "Update training session by ID")
    @PutMapping("/{id}")
    public ResponseEntity<TrainingSession> updateTrainingSession(@PathVariable Long id, @RequestBody TrainingSession trainingSessionDetails) {
        Optional<TrainingSession> trainingSessionOptional = trainingSessionService.findById(id);
        if (!trainingSessionOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        TrainingSession trainingSession = trainingSessionOptional.get();

        TrainingSession updated = trainingSessionService.save(trainingSessionDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete training session by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrainingSession(@PathVariable Long id) {
        if (!trainingSessionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        trainingSessionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
