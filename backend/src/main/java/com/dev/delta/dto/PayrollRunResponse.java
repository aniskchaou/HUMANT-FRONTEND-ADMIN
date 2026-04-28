package com.dev.delta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunResponse {
    private String cycleMonth;
    private LocalDate generatedOn;
    private int createdPayrollCount;
    private int updatedPayrollCount;
    private int createdPaySlipCount;
    private int updatedPaySlipCount;
    private int skippedEmployees;
    private int employeesProcessed;
    private BigDecimal totalGrossPay = BigDecimal.ZERO;
    private BigDecimal totalNetPay = BigDecimal.ZERO;
    private List<String> warnings = new ArrayList<>();
}