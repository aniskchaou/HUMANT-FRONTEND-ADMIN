
package com.dev.delta.controllers;


import com.dev.delta.entities.PerformanceReview;
import com.dev.delta.services.PerformanceReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/performance-reviews")
@CrossOrigin
@Tag(name = "PerformanceReview", description = "Performance review management APIs")
public class PerformanceReviewController {
    @Autowired
    private PerformanceReviewService performanceReviewService;

    @Operation(summary = "Get all performance reviews")
    @GetMapping
    public List<PerformanceReview> getAllPerformanceReviews() {
        return performanceReviewService.findAll();
    }

    @Operation(summary = "Get performance review by ID")
    @GetMapping("/{id}")
    public ResponseEntity<PerformanceReview> getPerformanceReviewById(@PathVariable Long id) {
        Optional<PerformanceReview> performanceReview = performanceReviewService.findById(id);
        return performanceReview.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new performance review")
    @PostMapping
    public PerformanceReview createPerformanceReview(@RequestBody PerformanceReview performanceReview) {
        return performanceReviewService.save(performanceReview);
    }

    @Operation(summary = "Update performance review by ID")
    @PutMapping("/{id}")
    public ResponseEntity<PerformanceReview> updatePerformanceReview(@PathVariable Long id, @RequestBody PerformanceReview performanceReviewDetails) {
        Optional<PerformanceReview> performanceReviewOptional = performanceReviewService.findById(id);
        if (!performanceReviewOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        PerformanceReview updated = performanceReviewService.update(id, performanceReviewDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete performance review by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformanceReview(@PathVariable Long id) {
        if (!performanceReviewService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        performanceReviewService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
