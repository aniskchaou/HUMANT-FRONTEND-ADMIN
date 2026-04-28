package com.dev.delta.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BiometricAttendanceImportResponse {
    private String providerName;
    private String batchId;
    private LocalDateTime importedAt;
    private int importedCount;
    private int updatedCount;
    private int skippedCount;
    private List<String> errors;
}