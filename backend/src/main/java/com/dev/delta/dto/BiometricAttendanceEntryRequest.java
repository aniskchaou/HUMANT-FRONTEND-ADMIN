package com.dev.delta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BiometricAttendanceEntryRequest {
    private Long employeeId;
    private String employeeName;
    private String date;
    private String checkInTime;
    private String checkOutTime;
    private String attendanceStatus;
    private String approvalStatus;
    private String deviceId;
    private String externalRecordId;
    private String notes;
}