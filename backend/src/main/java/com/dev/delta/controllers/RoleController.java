
package com.dev.delta.controllers;


import com.dev.delta.entities.Role;
import com.dev.delta.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin
@Tag(name = "Role", description = "Role management APIs")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @Operation(summary = "Get all roles")
    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.findAll();
    }

    @Operation(summary = "Get role by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        Optional<Role> role = roleService.findById(id);
        return role.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new role")
    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleService.save(role);
    }

    @Operation(summary = "Update role by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role roleDetails) {
        Optional<Role> roleOptional = roleService.findById(id);
        if (!roleOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

		Role role = roleOptional.get();
		role.setName(roleDetails.getName());

		Role updated = roleService.save(role);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete role by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        roleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
