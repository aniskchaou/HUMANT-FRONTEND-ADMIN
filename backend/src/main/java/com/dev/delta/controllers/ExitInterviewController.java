
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.ExitInterview;
import com.dev.delta.services.ExitInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exit-interviews")
@Tag(name = "ExitInterview", description = "Exit Interview management APIs")
public class ExitInterviewController {
    @Autowired
    private ExitInterviewService exitInterviewService;


    @Operation(summary = "Get all exit interviews")
    @GetMapping
    public List<ExitInterview> getAllExitInterviews() {
        return exitInterviewService.findAll();
    }


    @Operation(summary = "Get exit interview by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ExitInterview> getExitInterviewById(@PathVariable Long id) {
        Optional<ExitInterview> exitInterview = exitInterviewService.findById(id);
        return exitInterview.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new exit interview")
    @PostMapping
    public ExitInterview createExitInterview(@RequestBody ExitInterview exitInterview) {
        return exitInterviewService.save(exitInterview);
    }


    @Operation(summary = "Update exit interview by ID")
    @PutMapping("/{id}")
    public ResponseEntity<ExitInterview> updateExitInterview(@PathVariable Long id, @RequestBody ExitInterview exitInterviewDetails) {
        ExitInterview updated = exitInterviewService.update(id, exitInterviewDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete exit interview by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExitInterview(@PathVariable Long id) {
        exitInterviewService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
