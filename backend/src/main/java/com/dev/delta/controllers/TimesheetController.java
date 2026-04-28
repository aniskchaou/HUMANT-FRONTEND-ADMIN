
package com.dev.delta.controllers;


import com.dev.delta.entities.Timesheet;
import com.dev.delta.services.TimesheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/timesheets")
@Tag(name = "Timesheet", description = "Timesheet management APIs")
public class TimesheetController {
    @Autowired
    private TimesheetService timesheetService;

    @Operation(summary = "Get all timesheets")
    @GetMapping
    public List<Timesheet> getAllTimesheets() {
        return timesheetService.findAll();
    }

    @Operation(summary = "Get timesheet by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Timesheet> getTimesheetById(@PathVariable Long id) {
        Optional<Timesheet> timesheet = timesheetService.findById(id);
        return timesheet.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new timesheet")
    @PostMapping
    public Timesheet createTimesheet(@RequestBody Timesheet timesheet) {
        return timesheetService.save(timesheet);
    }

    @Operation(summary = "Update timesheet by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Timesheet> updateTimesheet(@PathVariable Long id, @RequestBody Timesheet timesheetDetails) {
        Optional<Timesheet> timesheetOptional = timesheetService.findById(id);
        if (!timesheetOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Timesheet timesheet = timesheetOptional.get();
        Timesheet updated = timesheetService.save(timesheetDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete timesheet by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimesheet(@PathVariable Long id) {
        if (!timesheetService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        timesheetService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
