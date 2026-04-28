package com.dev.delta.services;

import com.dev.delta.dto.BiometricAttendanceEntryRequest;
import com.dev.delta.dto.BiometricAttendanceImportRequest;
import com.dev.delta.dto.BiometricAttendanceImportResponse;
import com.dev.delta.entities.Attendance;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.AttendanceRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AttendanceService {
    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Attendance> findAll() {
        return attendanceRepository.findAll();
    }

    public Optional<Attendance> findById(Long id) {
        return attendanceRepository.findById(id);
    }

    public Attendance save(Attendance attendance) {
        attendance.setEmployee(resolveEmployee(attendance.getEmployee()));
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public BiometricAttendanceImportResponse importBiometricRecords(
        BiometricAttendanceImportRequest request
    ) {
        BiometricAttendanceImportResponse response = new BiometricAttendanceImportResponse();
        response.setProviderName(normalizeText(request != null ? request.getProviderName() : null));
        response.setBatchId(UUID.randomUUID().toString());
        response.setImportedAt(LocalDateTime.now());
        response.setErrors(new ArrayList<>());

        if (response.getProviderName().isEmpty()) {
            response.setProviderName("Biometric device");
        }

        if (request == null || request.getEntries() == null || request.getEntries().isEmpty()) {
            response.getErrors().add("No biometric entries were provided.");
            return response;
        }

        boolean overwriteExisting = Boolean.TRUE.equals(request.getOverwriteExisting());
        String defaultApprovalStatus = resolveApprovalStatus(request.getApprovalStatus(), "Pending");

        for (int index = 0; index < request.getEntries().size(); index++) {
            BiometricAttendanceEntryRequest entry = request.getEntries().get(index);

            try {
                Employee employee = resolveBiometricEmployee(entry);
                if (employee == null) {
                    skipImport(response, index, "Employee could not be resolved.");
                    continue;
                }

                LocalDate date = parseDate(entry != null ? entry.getDate() : null);
                if (date == null) {
                    skipImport(response, index, "Attendance date is missing or invalid.");
                    continue;
                }

                Attendance attendance = resolveBiometricAttendance(
                    entry,
                    employee,
                    date,
                    overwriteExisting
                );

                if (attendance == null) {
                    skipImport(
                        response,
                        index,
                        "An attendance record already exists for this employee and date. Enable overwrite to replace it."
                    );
                    continue;
                }

                boolean existingRecord = attendance.getId() != null;

                mergeBiometricAttendance(
                    attendance,
                    employee,
                    entry,
                    date,
                    response.getProviderName(),
                    response.getBatchId(),
                    response.getImportedAt(),
                    defaultApprovalStatus
                );

                attendanceRepository.save(attendance);

                if (existingRecord) {
                    response.setUpdatedCount(response.getUpdatedCount() + 1);
                } else {
                    response.setImportedCount(response.getImportedCount() + 1);
                }
            } catch (Exception exception) {
                skipImport(
                    response,
                    index,
                    exception.getMessage() != null
                        ? exception.getMessage()
                        : "Biometric import failed for this row."
                );
            }
        }

        return response;
    }

    public void deleteById(Long id) {
        attendanceRepository.deleteById(id);
    }

    private Attendance resolveBiometricAttendance(
        BiometricAttendanceEntryRequest entry,
        Employee employee,
        LocalDate date,
        boolean overwriteExisting
    ) {
        String externalRecordId = normalizeText(entry != null ? entry.getExternalRecordId() : null);

        if (!externalRecordId.isEmpty()) {
            Optional<Attendance> externalMatch = attendanceRepository.findFirstByExternalRecordId(
                externalRecordId
            );

            if (externalMatch.isPresent()) {
                return externalMatch.get();
            }
        }

        Optional<Attendance> employeeDayMatch = attendanceRepository.findFirstByEmployeeIdAndDateOrderByIdDesc(
            employee.getId(),
            date
        );

        if (!employeeDayMatch.isPresent()) {
            return new Attendance();
        }

        Attendance existingAttendance = employeeDayMatch.get();

        if (
            overwriteExisting ||
            isBiometricSource(existingAttendance.getSource()) ||
            existingAttendance.getCheckOutTime() == null
        ) {
            return existingAttendance;
        }

        return null;
    }

    private void mergeBiometricAttendance(
        Attendance attendance,
        Employee employee,
        BiometricAttendanceEntryRequest entry,
        LocalDate date,
        String providerName,
        String batchId,
        LocalDateTime importedAt,
        String defaultApprovalStatus
    ) {
        LocalTime checkInTime = parseTime(entry != null ? entry.getCheckInTime() : null);
        LocalTime checkOutTime = parseTime(entry != null ? entry.getCheckOutTime() : null);
        String externalRecordId = normalizeText(entry != null ? entry.getExternalRecordId() : null);
        String deviceId = normalizeText(entry != null ? entry.getDeviceId() : null);
        String approvalStatus = resolveApprovalStatus(
            entry != null ? entry.getApprovalStatus() : null,
            defaultApprovalStatus
        );

        attendance.setEmployee(employee);
        attendance.setDate(date);

        if (checkInTime != null || attendance.getCheckInTime() == null) {
            attendance.setCheckInTime(checkInTime);
        }

        if (checkOutTime != null || attendance.getCheckOutTime() == null) {
            attendance.setCheckOutTime(checkOutTime);
        }

        attendance.setSource("biometric");
        attendance.setSourceSystem(providerName);
        attendance.setDeviceId(deviceId.isEmpty() ? attendance.getDeviceId() : deviceId);
        attendance.setExternalRecordId(
            externalRecordId.isEmpty() ? attendance.getExternalRecordId() : externalRecordId
        );
        attendance.setSyncBatchId(batchId);
        attendance.setImportedAt(importedAt);
        attendance.setNotes(buildBiometricNotes(providerName, entry != null ? entry.getNotes() : null));
        attendance.setAttendanceStatus(
            resolveAttendanceStatus(
                entry != null ? entry.getAttendanceStatus() : null,
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()
            )
        );
        attendance.setApprovalStatus(approvalStatus);

        if ("Pending".equals(approvalStatus)) {
            attendance.setReviewedBy(null);
            attendance.setReviewedAt(null);
        } else {
            attendance.setReviewedBy(
                normalizeText(attendance.getReviewedBy()).isEmpty()
                    ? "Biometric sync"
                    : attendance.getReviewedBy()
            );
            attendance.setReviewedAt(attendance.getReviewedAt() == null ? importedAt : attendance.getReviewedAt());
        }
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    private Employee resolveBiometricEmployee(BiometricAttendanceEntryRequest entry) {
        if (entry == null) {
            return null;
        }

        if (entry.getEmployeeId() != null) {
            return employeeRepository.findById(entry.getEmployeeId()).orElse(null);
        }

        String employeeName = normalizeText(entry.getEmployeeName());
        if (employeeName.isEmpty()) {
            return null;
        }

        return employeeRepository.findFirstByFullNameIgnoreCase(employeeName).orElse(null);
    }

    private void skipImport(
        BiometricAttendanceImportResponse response,
        int index,
        String message
    ) {
        response.setSkippedCount(response.getSkippedCount() + 1);
        response.getErrors().add("Row " + (index + 1) + ": " + message);
    }

    private LocalDate parseDate(String value) {
        String normalizedValue = normalizeText(value);

        if (normalizedValue.isEmpty()) {
            return null;
        }

        try {
            return LocalDate.parse(normalizedValue);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private LocalTime parseTime(String value) {
        String normalizedValue = normalizeText(value);

        if (normalizedValue.isEmpty()) {
            return null;
        }

        String timeValue = normalizedValue.length() == 5 ? normalizedValue + ":00" : normalizedValue;

        try {
            return LocalTime.parse(timeValue);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private String resolveAttendanceStatus(
        String value,
        LocalTime checkInTime,
        LocalTime checkOutTime
    ) {
        String normalizedValue = normalizeText(value).toLowerCase();

        if ("remote".equals(normalizedValue)) {
            return "Remote";
        }

        if ("half day".equals(normalizedValue) || "half-day".equals(normalizedValue)) {
            return "Half day";
        }

        if ("on leave".equals(normalizedValue) || "leave".equals(normalizedValue)) {
            return "On leave";
        }

        if ("absent".equals(normalizedValue)) {
            return "Absent";
        }

        if ("present".equals(normalizedValue)) {
            return "Present";
        }

        return checkInTime != null || checkOutTime != null ? "Present" : "Absent";
    }

    private String resolveApprovalStatus(String value, String fallback) {
        String normalizedValue = normalizeText(value).toLowerCase();

        if ("approved".equals(normalizedValue)) {
            return "Approved";
        }

        if ("rejected".equals(normalizedValue)) {
            return "Rejected";
        }

        if ("pending".equals(normalizedValue)) {
            return "Pending";
        }

        return fallback;
    }

    private boolean isBiometricSource(String value) {
        return "biometric".equalsIgnoreCase(normalizeText(value));
    }

    private String buildBiometricNotes(String providerName, String note) {
        String normalizedNote = normalizeText(note);
        String prefix = "Synced from " + providerName;

        return normalizedNote.isEmpty() ? prefix + "." : prefix + ": " + normalizedNote;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}
