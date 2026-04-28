package com.dev.delta.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BiometricAttendanceImportRequest {
    private String providerName;
    private String approvalStatus;
    private Boolean overwriteExisting;
    private List<BiometricAttendanceEntryRequest> entries;
}