
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.entities.ExitRequest;
import com.dev.delta.services.ExitRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exit-requests")
@Tag(name = "ExitRequest", description = "Exit Request management APIs")
public class ExitRequestController {
    @Autowired
    private ExitRequestService exitRequestService;


    @Operation(summary = "Get all exit requests")
    @GetMapping
    public List<ExitRequest> getAllExitRequests() {
        return exitRequestService.findAll();
    }


    @Operation(summary = "Get exit request by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ExitRequest> getExitRequestById(@PathVariable Long id) {
        Optional<ExitRequest> exitRequest = exitRequestService.findById(id);
        return exitRequest.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new exit request")
    @PostMapping
    public ExitRequest createExitRequest(@RequestBody ExitRequest exitRequest) {
        return exitRequestService.save(exitRequest);
    }


    @Operation(summary = "Update exit request by ID")
    @PutMapping("/{id}")
    public ResponseEntity<ExitRequest> updateExitRequest(@PathVariable Long id, @RequestBody ExitRequest exitRequestDetails) {
        ExitRequest updated = exitRequestService.update(id, exitRequestDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete exit request by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExitRequest(@PathVariable Long id) {
        exitRequestService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
