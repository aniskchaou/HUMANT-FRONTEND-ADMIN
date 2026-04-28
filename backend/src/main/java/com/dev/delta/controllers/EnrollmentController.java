
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.Enrollment;
import com.dev.delta.services.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/enrollments")
@Tag(name = "Enrollment", description = "Enrollment management APIs")
public class EnrollmentController {
    @Autowired
    private EnrollmentService enrollmentService;


    @Operation(summary = "Get all enrollments")
    @GetMapping
    public List<Enrollment> getAllEnrollments() {
        return enrollmentService.findAll();
    }


    @Operation(summary = "Get enrollment by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable Long id) {
        Optional<Enrollment> enrollment = enrollmentService.findById(id);
        return enrollment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new enrollment")
    @PostMapping
    public Enrollment createEnrollment(@RequestBody Enrollment enrollment) {
        return enrollmentService.save(enrollment);
    }


    @Operation(summary = "Update enrollment by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Enrollment> updateEnrollment(@PathVariable Long id, @RequestBody Enrollment enrollmentDetails) {
        Optional<Enrollment> enrollmentOptional = enrollmentService.findById(id);
        if (!enrollmentOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Enrollment enrollment = enrollmentOptional.get();

        Enrollment updated = enrollmentService.save(enrollmentDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete enrollment by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        if (!enrollmentService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        enrollmentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
