
package com.dev.delta.controllers;


import com.dev.delta.entities.Policy;
import com.dev.delta.services.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/policies")
@Tag(name = "Policy", description = "Policy management APIs")
public class PolicyController {
    @Autowired
    private PolicyService policyService;

    @Operation(summary = "Get all policies")
    @GetMapping
    public List<Policy> getAllPolicies() {
        return policyService.findAll();
    }

    @Operation(summary = "Get policy by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Policy> getPolicyById(@PathVariable Long id) {
        Optional<Policy> policy = policyService.findById(id);
        return policy.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new policy")
    @PostMapping
    public Policy createPolicy(@RequestBody Policy policy) {
        return policyService.save(policy);
    }

    @Operation(summary = "Update policy by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Policy> updatePolicy(@PathVariable Long id, @RequestBody Policy policyDetails) {
        Optional<Policy> policyOptional = policyService.findById(id);
        if (!policyOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Policy updated = policyService.update(id, policyDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete policy by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        if (!policyService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        policyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
