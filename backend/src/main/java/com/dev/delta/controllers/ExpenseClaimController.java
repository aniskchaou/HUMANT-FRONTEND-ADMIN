
package com.dev.delta.controllers;


import com.dev.delta.dto.ExpenseClaimReviewRequest;
import com.dev.delta.entities.ExpenseClaim;
import com.dev.delta.services.ExpenseClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expense-claims")
@CrossOrigin
@Tag(name = "ExpenseClaim", description = "Expense claim management APIs")
public class ExpenseClaimController {
    @Autowired
    private ExpenseClaimService expenseClaimService;

    @Operation(summary = "Get all expense claims")
    @GetMapping
    public List<ExpenseClaim> getAllExpenseClaims() {
        return expenseClaimService.findAll();
    }

    @Operation(summary = "Get expense claim by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseClaim> getExpenseClaimById(@PathVariable Long id) {
        Optional<ExpenseClaim> expenseClaim = expenseClaimService.findById(id);
        return expenseClaim.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new expense claim")
    @PostMapping
    public ExpenseClaim createExpenseClaim(@RequestBody ExpenseClaim expenseClaim) {
        return expenseClaimService.save(expenseClaim);
    }

    @Operation(summary = "Submit a new expense claim with an optional receipt")
    @PostMapping("/submit")
    public ResponseEntity<ExpenseClaim> submitExpenseClaim(
        @RequestParam(value = "employeeId", required = false) Long employeeId,
        @RequestParam("claimType") String claimType,
        @RequestParam("description") String description,
        @RequestParam("amount") BigDecimal amount,
        @RequestParam("claimDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate claimDate,
        @RequestParam(value = "notes", required = false) String notes,
        @RequestParam(value = "receipt", required = false) MultipartFile receipt
    ) {
        ExpenseClaim createdExpenseClaim = expenseClaimService.submitClaim(
            employeeId,
            claimType,
            description,
            amount,
            claimDate,
            notes,
            receipt
        );
        return new ResponseEntity<ExpenseClaim>(createdExpenseClaim, HttpStatus.CREATED);
    }

    @Operation(summary = "Upload or replace an expense claim receipt")
    @PostMapping("/{id}/receipt")
    public ResponseEntity<ExpenseClaim> uploadExpenseReceipt(
        @PathVariable Long id,
        @RequestParam("receipt") MultipartFile receipt
    ) {
        ExpenseClaim updatedExpenseClaim = expenseClaimService.replaceReceipt(id, receipt);
        return ResponseEntity.ok(updatedExpenseClaim);
    }

    @Operation(summary = "Download an expense claim receipt")
    @GetMapping("/{id}/receipt")
    public ResponseEntity<Resource> downloadExpenseReceipt(@PathVariable Long id) {
        ExpenseClaim expenseClaim = expenseClaimService.findAccessibleById(id);
        Resource resource = expenseClaimService.loadReceiptAsResource(id);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (expenseClaim.getReceiptContentType() != null && !expenseClaim.getReceiptContentType().trim().isEmpty()) {
            mediaType = MediaType.parseMediaType(expenseClaim.getReceiptContentType());
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + expenseClaim.getReceiptOriginalFileName() + "\""
            )
            .body(resource);
    }

    @Operation(summary = "Update expense claim by ID")
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseClaim> updateExpenseClaim(@PathVariable Long id, @RequestBody ExpenseClaim expenseClaimDetails) {
        Optional<ExpenseClaim> expenseClaimOptional = expenseClaimService.findById(id);
        if (!expenseClaimOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ExpenseClaim updated = expenseClaimService.update(id, expenseClaimDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Approve or reject an expense claim")
    @PutMapping("/{id}/review")
    public ResponseEntity<ExpenseClaim> reviewExpenseClaim(
        @PathVariable Long id,
        @RequestBody ExpenseClaimReviewRequest reviewRequest
    ) {
        ExpenseClaim.ClaimStatus status = null;

        if (reviewRequest.getStatus() != null && !reviewRequest.getStatus().trim().isEmpty()) {
            try {
                status = ExpenseClaim.ClaimStatus.valueOf(reviewRequest.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid expense claim status.", exception);
            }
        }

        ExpenseClaim updatedExpenseClaim = expenseClaimService.reviewClaim(id, status, reviewRequest.getReviewNotes());
        return ResponseEntity.ok(updatedExpenseClaim);
    }

    @Operation(summary = "Delete expense claim by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpenseClaim(@PathVariable Long id) {
        if (!expenseClaimService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        expenseClaimService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
