
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.Bonus;
import com.dev.delta.services.BonusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bonuses")
@CrossOrigin
@Tag(name = "Bonus", description = "Bonus management APIs")
public class BonusController {
    @Autowired
    private BonusService bonusService;


    @Operation(summary = "Get all bonuses")
    @GetMapping
    public List<Bonus> getAllBonuses() {
        return bonusService.findAll();
    }


    @Operation(summary = "Get bonus by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Bonus> getBonusById(@PathVariable Long id) {
        Optional<Bonus> bonus = bonusService.findById(id);
        return bonus.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new bonus")
    @PostMapping
    public Bonus createBonus(@RequestBody Bonus bonus) {
        return bonusService.save(bonus);
    }


    @Operation(summary = "Update bonus by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Bonus> updateBonus(@PathVariable Long id, @RequestBody Bonus bonusDetails) {
        Optional<Bonus> bonusOptional = bonusService.findById(id);
        if (!bonusOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Bonus updated = bonusService.update(id, bonusDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete bonus by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBonus(@PathVariable Long id) {
        if (!bonusService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        bonusService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
