
package com.dev.delta.controllers;


import com.dev.delta.entities.Tax;
import com.dev.delta.services.TaxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/taxes")
@CrossOrigin
@Tag(name = "Tax", description = "Tax management APIs")
public class TaxController {
    @Autowired
    private TaxService taxService;

    @Operation(summary = "Get all taxes")
    @GetMapping
    public List<Tax> getAllTaxes() {
        return taxService.findAll();
    }

    @Operation(summary = "Get tax by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Tax> getTaxById(@PathVariable Long id) {
        Optional<Tax> tax = taxService.findById(id);
        return tax.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new tax")
    @PostMapping
    public Tax createTax(@RequestBody Tax tax) {
        return taxService.save(tax);
    }

    @Operation(summary = "Update tax by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Tax> updateTax(@PathVariable Long id, @RequestBody Tax taxDetails) {
        Optional<Tax> taxOptional = taxService.findById(id);
        if (!taxOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Tax updated = taxService.update(id, taxDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete tax by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTax(@PathVariable Long id) {
        if (!taxService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        taxService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
