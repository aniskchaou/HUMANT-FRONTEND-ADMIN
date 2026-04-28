
package com.dev.delta.controllers;


import com.dev.delta.entities.LeaveRequest;
import com.dev.delta.services.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin
@Tag(name = "LeaveRequest", description = "Leave request management APIs")
public class LeaveRequestController {
    @Autowired
    private LeaveRequestService leaveRequestService;

    @Operation(summary = "Get all leave requests")
    @GetMapping
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestService.findAll();
    }

    @Operation(summary = "Get leave request by ID")
    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable Long id) {
        Optional<LeaveRequest> leaveRequest = leaveRequestService.findById(id);
        return leaveRequest.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new leave request")
    @PostMapping
    public LeaveRequest createLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        return leaveRequestService.save(leaveRequest);
    }

    @Operation(summary = "Update leave request by ID")
    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(@PathVariable Long id, @RequestBody LeaveRequest leaveRequestDetails) {
        Optional<LeaveRequest> leaveRequestOptional = leaveRequestService.findById(id);
        if (!leaveRequestOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        LeaveRequest updated = leaveRequestService.update(id, leaveRequestDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete leave request by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable Long id) {
        if (!leaveRequestService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        leaveRequestService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
