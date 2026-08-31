package com.dev.delta.controllers;

import com.dev.delta.entities.Payment;
import com.dev.delta.services.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/payments")
@CrossOrigin
@Tag(name = "Payments", description = "Payment management for Super Admin")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) { this.service = service; }

    @GetMapping
    public List<Payment> getAll() { return service.findAll(); }

    @GetMapping("/tenant/{code}")
    public List<Payment> getByTenant(@PathVariable String code) { return service.findByTenant(code); }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        return ResponseEntity.ok(service.save(payment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody Payment body) {
        return service.findById(id).map(existing -> {
            body.setId(existing.getId());
            return ResponseEntity.ok(service.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/retry")
    public ResponseEntity<Payment> retry(@PathVariable Long id) {
        return service.findById(id).map(p -> ResponseEntity.ok(service.retry(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/refund")
    public ResponseEntity<Payment> refund(@PathVariable Long id,
                                          @RequestBody Map<String, Long> body) {
        long amount = body.getOrDefault("amountCents", 0L);
        return service.findById(id).map(p -> ResponseEntity.ok(service.refund(p, amount)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.findById(id).map(p -> {
            service.delete(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
