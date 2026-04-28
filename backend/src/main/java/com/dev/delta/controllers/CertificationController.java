
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.Certification;
import com.dev.delta.services.CertificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/certifications")
@Tag(name = "Certification", description = "Certification management APIs")
public class CertificationController {
    @Autowired
    private CertificationService certificationService;


    @Operation(summary = "Get all certifications")
    @GetMapping
    public List<Certification> getAllCertifications() {
        return certificationService.findAll();
    }


    @Operation(summary = "Get certification by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Certification> getCertificationById(@PathVariable Long id) {
        Optional<Certification> certification = certificationService.findById(id);
        return certification.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new certification")
    @PostMapping
    public Certification createCertification(@RequestBody Certification certification) {
        return certificationService.save(certification);
    }


    @Operation(summary = "Update certification by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Certification> updateCertification(@PathVariable Long id, @RequestBody Certification certificationDetails) {
        Optional<Certification> certificationOptional = certificationService.findById(id);
        if (!certificationOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Certification certification = certificationOptional.get();

        Certification updated = certificationService.save(certificationDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete certification by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertification(@PathVariable Long id) {
        if (!certificationService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        certificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
