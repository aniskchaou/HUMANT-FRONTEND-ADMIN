
package com.dev.delta.controllers;


import com.dev.delta.entities.OnboardingChecklist;
import com.dev.delta.services.OnboardingChecklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/onboarding-checklists")
@CrossOrigin
@Tag(name = "OnboardingChecklist", description = "Onboarding checklist management APIs")
public class OnboardingChecklistController {
    @Autowired
    private OnboardingChecklistService onboardingChecklistService;

    @Operation(summary = "Get all onboarding checklists")
    @GetMapping
    public List<OnboardingChecklist> getAllOnboardingChecklists() {
        return onboardingChecklistService.findAll();
    }

    @Operation(summary = "Get onboarding checklist by ID")
    @GetMapping("/{id}")
    public ResponseEntity<OnboardingChecklist> getOnboardingChecklistById(@PathVariable Long id) {
        Optional<OnboardingChecklist> onboardingChecklist = onboardingChecklistService.findById(id);
        return onboardingChecklist.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get onboarding checklist items for an employee")
    @GetMapping("/employee/{employeeId}")
    public List<OnboardingChecklist> getEmployeeOnboardingChecklist(@PathVariable Long employeeId) {
        return onboardingChecklistService.findByEmployeeId(employeeId);
    }

    @Operation(summary = "Create a new onboarding checklist")
    @PostMapping
    public OnboardingChecklist createOnboardingChecklist(@RequestBody OnboardingChecklist onboardingChecklist) {
        return onboardingChecklistService.save(onboardingChecklist);
    }

    @Operation(summary = "Assign the starter onboarding checklist to an employee")
    @PostMapping("/assign-starter/{employeeId}")
    public List<OnboardingChecklist> assignStarterChecklist(@PathVariable Long employeeId) {
        return onboardingChecklistService.assignStarterChecklist(employeeId);
    }

    @Operation(summary = "Update onboarding checklist by ID")
    @PutMapping("/{id}")
    public ResponseEntity<OnboardingChecklist> updateOnboardingChecklist(@PathVariable Long id, @RequestBody OnboardingChecklist onboardingChecklistDetails) {
        if (!onboardingChecklistService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        OnboardingChecklist updated = onboardingChecklistService.update(id, onboardingChecklistDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete onboarding checklist by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOnboardingChecklist(@PathVariable Long id) {
        if (!onboardingChecklistService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        onboardingChecklistService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
