
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.Candidate;
import com.dev.delta.services.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@Tag(name = "Candidate", description = "Candidate management APIs")
public class CandidateController {
    @Autowired
    private CandidateService candidateService;


    @Operation(summary = "Get all candidates")
    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateService.findAll();
    }


    @Operation(summary = "Get candidate by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        Optional<Candidate> candidate = candidateService.findById(id);
        return candidate.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new candidate")
    @PostMapping
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return candidateService.save(candidate);
    }


    @Operation(summary = "Update candidate by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidateDetails) {
        Optional<Candidate> candidateOptional = candidateService.findById(id);
        if (!candidateOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Candidate candidate = candidateOptional.get();

        Candidate updated = candidateService.save(candidateDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete candidate by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        if (!candidateService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        candidateService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Upload resume for a candidate")
    @PostMapping("/{id}/resume")
    public ResponseEntity<Candidate> uploadResume(@PathVariable Long id,
                                                   @RequestParam("file") MultipartFile file) throws IOException {
        Optional<Candidate> candidateOptional = candidateService.findById(id);
        if (!candidateOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        String uploadsDir = System.getProperty("user.home") + "/humant-uploads/resumes/";
        Files.createDirectories(Paths.get(uploadsDir));
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = Paths.get(uploadsDir + filename);
        Files.write(target, file.getBytes());
        Candidate candidate = candidateOptional.get();
        candidate.setResumePath(uploadsDir + filename);
        Candidate saved = candidateService.save(candidate);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Update candidate status")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Candidate> updateStatus(@PathVariable Long id,
                                                   @RequestParam("status") Candidate.CandidateStatus status) {
        Optional<Candidate> candidateOptional = candidateService.findById(id);
        if (!candidateOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Candidate candidate = candidateOptional.get();
        candidate.setStatus(status);
        return ResponseEntity.ok(candidateService.save(candidate));
    }
}
