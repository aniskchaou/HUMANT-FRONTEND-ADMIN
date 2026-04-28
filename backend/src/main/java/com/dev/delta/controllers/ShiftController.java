
package com.dev.delta.controllers;


import com.dev.delta.entities.Shift;
import com.dev.delta.services.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shifts")
@Tag(name = "Shift", description = "Shift management APIs")
public class ShiftController {
    @Autowired
    private ShiftService shiftService;

    @Operation(summary = "Get all shifts")
    @GetMapping
    public List<Shift> getAllShifts() {
        return shiftService.findAll();
    }

    @Operation(summary = "Get shift by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Shift> getShiftById(@PathVariable Long id) {
        Optional<Shift> shift = shiftService.findById(id);
        return shift.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new shift")
    @PostMapping
    public Shift createShift(@RequestBody Shift shift) {
        return shiftService.save(shift);
    }

    @Operation(summary = "Update shift by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Shift> updateShift(@PathVariable Long id, @RequestBody Shift shiftDetails) {
        Optional<Shift> shiftOptional = shiftService.findById(id);
        if (!shiftOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Shift shift = shiftOptional.get();

        Shift updated = shiftService.save(shiftDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete shift by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        if (!shiftService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        shiftService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
