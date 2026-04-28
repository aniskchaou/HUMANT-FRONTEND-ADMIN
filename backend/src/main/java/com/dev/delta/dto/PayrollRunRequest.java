package com.dev.delta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunRequest {
    private String cycleMonth;
    private Boolean generatePayslips;
    private Boolean overwriteExisting;
}