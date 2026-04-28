
package com.dev.delta.controllers;


import com.dev.delta.entities.JobPosition;
import com.dev.delta.services.JobPositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/job-positions")
@Tag(name = "JobPosition", description = "Job position management APIs")
public class JobPositionController {
    @Autowired
    private JobPositionService jobPositionService;

    @Operation(summary = "Get all job positions")
    @GetMapping
    public List<JobPosition> getAllJobPositions() {
        return jobPositionService.findAll();
    }

    @Operation(summary = "Get job position by ID")
    @GetMapping("/{id}")
    public ResponseEntity<JobPosition> getJobPositionById(@PathVariable Long id) {
        Optional<JobPosition> jobPosition = jobPositionService.findById(id);
        return jobPosition.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new job position")
    @PostMapping
    public JobPosition createJobPosition(@RequestBody JobPosition jobPosition) {
        return jobPositionService.save(jobPosition);
    }

    @Operation(summary = "Update job position by ID")
    @PutMapping("/{id}")
    public ResponseEntity<JobPosition> updateJobPosition(@PathVariable Long id, @RequestBody JobPosition jobPositionDetails) {
        Optional<JobPosition> jobPositionOptional = jobPositionService.findById(id);
        if (!jobPositionOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        JobPosition jobPosition = jobPositionOptional.get();

        JobPosition updated = jobPositionService.save(jobPositionDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete job position by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosition(@PathVariable Long id) {
        if (!jobPositionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        jobPositionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
