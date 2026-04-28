package com.dev.delta.controllers;

import com.dev.delta.entities.RoleAccessPolicy;
import com.dev.delta.entities.User.UserRole;
import com.dev.delta.services.RoleAccessPolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/access-policies")
@Tag(name = "Admin Access Policies", description = "Admin-managed role access policies")
public class RoleAccessPolicyController {

    @Autowired
    private RoleAccessPolicyService roleAccessPolicyService;

    @Operation(summary = "Get all access policies")
    @GetMapping
    public ResponseEntity<List<RoleAccessPolicy>> getPolicies() {
        return ResponseEntity.ok(roleAccessPolicyService.getPolicies());
    }

    @Operation(summary = "Get access policy by role")
    @GetMapping("/{roleName}")
    public ResponseEntity<RoleAccessPolicy> getPolicy(@PathVariable String roleName) {
        return ResponseEntity.ok(roleAccessPolicyService.getPolicy(UserRole.valueOf(roleName.toUpperCase())));
    }

    @Operation(summary = "Update access policy by role")
    @PutMapping("/{roleName}")
    public ResponseEntity<RoleAccessPolicy> updatePolicy(@PathVariable String roleName, @RequestBody RoleAccessPolicy policyDetails) {
        return ResponseEntity.ok(
            roleAccessPolicyService.updatePolicy(UserRole.valueOf(roleName.toUpperCase()), policyDetails)
        );
    }
}