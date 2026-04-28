
package com.dev.delta.controllers;


import com.dev.delta.entities.Referral;
import com.dev.delta.services.ReferralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/referrals")
@Tag(name = "Referral", description = "Referral management APIs")
public class ReferralController {
    @Autowired
    private ReferralService referralService;

    @Operation(summary = "Get all referrals")
    @GetMapping
    public List<Referral> getAllReferrals() {
        return referralService.findAll();
    }

    @Operation(summary = "Get referral by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Referral> getReferralById(@PathVariable Long id) {
        Optional<Referral> referral = referralService.findById(id);
        return referral.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new referral")
    @PostMapping
    public Referral createReferral(@RequestBody Referral referral) {
        return referralService.save(referral);
    }

    @Operation(summary = "Update referral by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Referral> updateReferral(@PathVariable Long id, @RequestBody Referral referralDetails) {
        Optional<Referral> referralOptional = referralService.findById(id);
        if (!referralOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Referral referral = referralOptional.get();

        Referral updated = referralService.save(referralDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete referral by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReferral(@PathVariable Long id) {
        if (!referralService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        referralService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
