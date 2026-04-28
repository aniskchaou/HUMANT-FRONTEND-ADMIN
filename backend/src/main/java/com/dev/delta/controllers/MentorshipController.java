
package com.dev.delta.controllers;


import com.dev.delta.entities.Mentorship;
import com.dev.delta.services.MentorshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mentorships")
@Tag(name = "Mentorship", description = "Mentorship management APIs")
public class MentorshipController {
    @Autowired
    private MentorshipService mentorshipService;

    @Operation(summary = "Get all mentorships")
    @GetMapping
    public List<Mentorship> getAllMentorships() {
        return mentorshipService.findAll();
    }

    @Operation(summary = "Get mentorship by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Mentorship> getMentorshipById(@PathVariable Long id) {
        Optional<Mentorship> mentorship = mentorshipService.findById(id);
        return mentorship.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new mentorship")
    @PostMapping
    public Mentorship createMentorship(@RequestBody Mentorship mentorship) {
        return mentorshipService.save(mentorship);
    }

    @Operation(summary = "Update mentorship by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Mentorship> updateMentorship(@PathVariable Long id, @RequestBody Mentorship mentorshipDetails) {
        Optional<Mentorship> mentorshipOptional = mentorshipService.findById(id);
        if (!mentorshipOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Mentorship mentorship = mentorshipOptional.get();

        Mentorship updated = mentorshipService.save(mentorshipDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete mentorship by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMentorship(@PathVariable Long id) {
        if (!mentorshipService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        mentorshipService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
