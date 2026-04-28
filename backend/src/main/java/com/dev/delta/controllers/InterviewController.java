
package com.dev.delta.controllers;


import com.dev.delta.entities.Interview;
import com.dev.delta.services.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/interviews")
@Tag(name = "Interview", description = "Interview management APIs")
public class InterviewController {
    @Autowired
    private InterviewService interviewService;

    @Operation(summary = "Get all interviews")
    @GetMapping
    public List<Interview> getAllInterviews() {
        return interviewService.findAll();
    }

    @Operation(summary = "Get interview by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable Long id) {
        Optional<Interview> interview = interviewService.findById(id);
        return interview.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new interview")
    @PostMapping
    public Interview createInterview(@RequestBody Interview interview) {
        return interviewService.save(interview);
    }

    @Operation(summary = "Update interview by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(@PathVariable Long id, @RequestBody Interview interviewDetails) {
        Optional<Interview> interviewOptional = interviewService.findById(id);
        if (!interviewOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Interview interview = interviewOptional.get();

        Interview updated = interviewService.save(interviewDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete interview by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        if (!interviewService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        interviewService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
