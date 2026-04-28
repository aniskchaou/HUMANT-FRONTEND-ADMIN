
package com.dev.delta.controllers;


import com.dev.delta.entities.PaySlip;
import com.dev.delta.services.PaySlipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pay-slips")
@CrossOrigin
@Tag(name = "PaySlip", description = "Pay slip management APIs")
public class PaySlipController {
    @Autowired
    private PaySlipService paySlipService;

    @Operation(summary = "Get all pay slips")
    @GetMapping
    public List<PaySlip> getAllPaySlips() {
        return paySlipService.findAll();
    }

    @Operation(summary = "Get pay slip by ID")
    @GetMapping("/{id}")
    public ResponseEntity<PaySlip> getPaySlipById(@PathVariable Long id) {
        Optional<PaySlip> paySlip = paySlipService.findById(id);
        return paySlip.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new pay slip")
    @PostMapping
    public PaySlip createPaySlip(@RequestBody PaySlip paySlip) {
        return paySlipService.save(paySlip);
    }

    @Operation(summary = "Update pay slip by ID")
    @PutMapping("/{id}")
    public ResponseEntity<PaySlip> updatePaySlip(@PathVariable Long id, @RequestBody PaySlip paySlipDetails) {
        Optional<PaySlip> paySlipOptional = paySlipService.findById(id);
        if (!paySlipOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        PaySlip updated = paySlipService.update(id, paySlipDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete pay slip by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaySlip(@PathVariable Long id) {
        if (!paySlipService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        paySlipService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
