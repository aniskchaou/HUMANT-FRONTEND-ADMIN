
package com.dev.delta.controllers;


import com.dev.delta.entities.Visa;
import com.dev.delta.services.VisaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/visas")
@Tag(name = "Visa", description = "Visa management APIs")
public class VisaController {
    @Autowired
    private VisaService visaService;

    @Operation(summary = "Get all visas")
    @GetMapping
    public List<Visa> getAllVisas() {
        return visaService.findAll();
    }

    @Operation(summary = "Get visa by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Visa> getVisaById(@PathVariable Long id) {
        Optional<Visa> visa = visaService.findById(id);
        return visa.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new visa")
    @PostMapping
    public Visa createVisa(@RequestBody Visa visa) {
        return visaService.save(visa);
    }

    @Operation(summary = "Update visa by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Visa> updateVisa(@PathVariable Long id, @RequestBody Visa visaDetails) {
        Optional<Visa> visaOptional = visaService.findById(id);
        if (!visaOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Visa visa = visaOptional.get();

        Visa updated = visaService.save(visaDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete visa by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVisa(@PathVariable Long id) {
        if (!visaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        visaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
