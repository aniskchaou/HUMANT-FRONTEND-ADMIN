
package com.dev.delta.controllers;


import com.dev.delta.entities.Feedback;
import com.dev.delta.services.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin
@Tag(name = "Feedback", description = "Feedback management APIs")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

    @Operation(summary = "Get all feedbacks")
    @GetMapping
    public List<Feedback> getAllFeedbacks() {
        return feedbackService.findAll();
    }

    @Operation(summary = "Get feedback by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        Optional<Feedback> feedback = feedbackService.findById(id);
        return feedback.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new feedback")
    @PostMapping
    public Feedback createFeedback(@RequestBody Feedback feedback) {
        return feedbackService.save(feedback);
    }

    @Operation(summary = "Update feedback by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback feedbackDetails) {
        Optional<Feedback> feedbackOptional = feedbackService.findById(id);
        if (!feedbackOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Feedback updated = feedbackService.update(id, feedbackDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete feedback by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        if (!feedbackService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        feedbackService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
