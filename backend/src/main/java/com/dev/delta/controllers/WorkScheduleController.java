
package com.dev.delta.controllers;


import com.dev.delta.entities.WorkSchedule;
import com.dev.delta.services.WorkScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/work-schedules")
@Tag(name = "WorkSchedule", description = "Work schedule management APIs")
public class WorkScheduleController {
    @Autowired
    private WorkScheduleService workScheduleService;

    @Operation(summary = "Get all work schedules")
    @GetMapping
    public List<WorkSchedule> getAllWorkSchedules() {
        return workScheduleService.findAll();
    }

    @Operation(summary = "Get work schedule by ID")
    @GetMapping("/{id}")
    public ResponseEntity<WorkSchedule> getWorkScheduleById(@PathVariable Long id) {
        Optional<WorkSchedule> workSchedule = workScheduleService.findById(id);
        return workSchedule.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new work schedule")
    @PostMapping
    public WorkSchedule createWorkSchedule(@RequestBody WorkSchedule workSchedule) {
        return workScheduleService.save(workSchedule);
    }

    @Operation(summary = "Update work schedule by ID")
    @PutMapping("/{id}")
    public ResponseEntity<WorkSchedule> updateWorkSchedule(@PathVariable Long id, @RequestBody WorkSchedule workScheduleDetails) {
        Optional<WorkSchedule> workScheduleOptional = workScheduleService.findById(id);
        if (!workScheduleOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        WorkSchedule workSchedule = workScheduleOptional.get();

        WorkSchedule updated = workScheduleService.save(workScheduleDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete work schedule by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkSchedule(@PathVariable Long id) {
        if (!workScheduleService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        workScheduleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
