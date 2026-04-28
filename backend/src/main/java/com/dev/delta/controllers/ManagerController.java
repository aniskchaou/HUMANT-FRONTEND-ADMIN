
package com.dev.delta.controllers;


import com.dev.delta.entities.Manager;
import com.dev.delta.services.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/managers")
@Tag(name = "Manager", description = "Manager management APIs")
public class ManagerController {
    @Autowired
    private ManagerService managerService;

    @Operation(summary = "Get all managers")
    @GetMapping
    public List<Manager> getAllManagers() {
        return managerService.findAll();
    }

    @Operation(summary = "Get manager by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Manager> getManagerById(@PathVariable Long id) {
        Optional<Manager> manager = managerService.findById(id);
        return manager.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new manager")
    @PostMapping
    public Manager createManager(@RequestBody Manager manager) {
        return managerService.save(manager);
    }

    @Operation(summary = "Update manager by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Manager> updateManager(@PathVariable Long id, @RequestBody Manager managerDetails) {
        Optional<Manager> managerOptional = managerService.findById(id);
        if (!managerOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Manager manager = managerOptional.get();

        Manager updated = managerService.save(managerDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete manager by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        if (!managerService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        managerService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
