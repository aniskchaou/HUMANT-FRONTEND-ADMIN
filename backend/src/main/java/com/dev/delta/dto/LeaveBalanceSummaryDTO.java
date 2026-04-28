package com.dev.delta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceSummaryDTO {
    private Long employeeId;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private int allocatedDays;
    private int usedDays;
    private int remainingDays;
    private double usagePercent;
    private String status;
}