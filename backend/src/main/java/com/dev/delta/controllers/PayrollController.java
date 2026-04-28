
package com.dev.delta.controllers;


import com.dev.delta.dto.PayrollRunRequest;
import com.dev.delta.dto.PayrollRunResponse;
import com.dev.delta.entities.Payroll;
import com.dev.delta.services.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payrolls")
@CrossOrigin
@Tag(name = "Payroll", description = "Payroll management APIs")
public class PayrollController {
    @Autowired
    private PayrollService payrollService;

    @Operation(summary = "Get all payrolls")
    @GetMapping
    public List<Payroll> getAllPayrolls() {
        return payrollService.findAll();
    }

    @Operation(summary = "Get payroll by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        Optional<Payroll> payroll = payrollService.findById(id);
        return payroll.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new payroll")
    @PostMapping
    public Payroll createPayroll(@RequestBody Payroll payroll) {
        return payrollService.save(payroll);
    }

    @Operation(summary = "Update payroll by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id, @RequestBody Payroll payrollDetails) {
        Optional<Payroll> payrollOptional = payrollService.findById(id);
        if (!payrollOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

		Payroll updated = payrollService.update(id, payrollDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Run payroll calculation and generate pay slips for a cycle")
    @PostMapping("/run")
    public ResponseEntity<PayrollRunResponse> runPayroll(@RequestBody(required = false) PayrollRunRequest request) {
        return ResponseEntity.ok(payrollService.runPayroll(request));
    }

    @Operation(summary = "Delete payroll by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {
        if (!payrollService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        payrollService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
