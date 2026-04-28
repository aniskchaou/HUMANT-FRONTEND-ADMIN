
package com.dev.delta.controllers;


import com.dev.delta.entities.OfferLetter;
import com.dev.delta.services.OfferLetterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/offer-letters")
@Tag(name = "OfferLetter", description = "Offer letter management APIs")
public class OfferLetterController {
    @Autowired
    private OfferLetterService offerLetterService;

    @Operation(summary = "Get all offer letters")
    @GetMapping
    public List<OfferLetter> getAllOfferLetters() {
        return offerLetterService.findAll();
    }

    @Operation(summary = "Get offer letter by ID")
    @GetMapping("/{id}")
    public ResponseEntity<OfferLetter> getOfferLetterById(@PathVariable Long id) {
        Optional<OfferLetter> offerLetter = offerLetterService.findById(id);
        return offerLetter.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new offer letter")
    @PostMapping
    public OfferLetter createOfferLetter(@RequestBody OfferLetter offerLetter) {
        return offerLetterService.save(offerLetter);
    }

    @Operation(summary = "Update offer letter by ID")
    @PutMapping("/{id}")
    public ResponseEntity<OfferLetter> updateOfferLetter(@PathVariable Long id, @RequestBody OfferLetter offerLetterDetails) {
        Optional<OfferLetter> offerLetterOptional = offerLetterService.findById(id);
        if (!offerLetterOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        OfferLetter offerLetter = offerLetterOptional.get();

        OfferLetter updated = offerLetterService.save(offerLetterDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete offer letter by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOfferLetter(@PathVariable Long id) {
        if (!offerLetterService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        offerLetterService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
