
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.dev.delta.dto.BiometricAttendanceImportRequest;
import com.dev.delta.dto.BiometricAttendanceImportResponse;
import com.dev.delta.entities.Attendance;
import com.dev.delta.services.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendances")
@CrossOrigin
@Tag(name = "Attendance", description = "Attendance management APIs")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;


    @Operation(summary = "Get all attendances")
    @GetMapping
    public List<Attendance> getAllAttendances() {
        return attendanceService.findAll();
    }


    @Operation(summary = "Get attendance by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        Optional<Attendance> attendance = attendanceService.findById(id);
        return attendance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(summary = "Create a new attendance")
    @PostMapping
    public Attendance createAttendance(@RequestBody Attendance attendance) {
        return attendanceService.save(attendance);
    }


    @Operation(summary = "Import biometric attendance entries")
    @PostMapping("/biometric-import")
    public ResponseEntity<BiometricAttendanceImportResponse> importBiometricAttendances(
        @RequestBody BiometricAttendanceImportRequest request
    ) {
        return ResponseEntity.ok(attendanceService.importBiometricRecords(request));
    }


    @Operation(summary = "Update attendance by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id, @RequestBody Attendance attendanceDetails) {
        Optional<Attendance> attendanceOptional = attendanceService.findById(id);
        if (!attendanceOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Attendance attendance = attendanceOptional.get();

		attendance.setDate(attendanceDetails.getDate());
		attendance.setCheckInTime(attendanceDetails.getCheckInTime());
		attendance.setCheckOutTime(attendanceDetails.getCheckOutTime());
		attendance.setSource(attendanceDetails.getSource());
		attendance.setNotes(attendanceDetails.getNotes());
        attendance.setSourceSystem(
            attendanceDetails.getSourceSystem() != null
                ? attendanceDetails.getSourceSystem()
                : attendance.getSourceSystem()
        );
        attendance.setDeviceId(
            attendanceDetails.getDeviceId() != null
                ? attendanceDetails.getDeviceId()
                : attendance.getDeviceId()
        );
        attendance.setExternalRecordId(
            attendanceDetails.getExternalRecordId() != null
                ? attendanceDetails.getExternalRecordId()
                : attendance.getExternalRecordId()
        );
        attendance.setSyncBatchId(
            attendanceDetails.getSyncBatchId() != null
                ? attendanceDetails.getSyncBatchId()
                : attendance.getSyncBatchId()
        );
        attendance.setImportedAt(
            attendanceDetails.getImportedAt() != null
                ? attendanceDetails.getImportedAt()
                : attendance.getImportedAt()
        );
        attendance.setAttendanceStatus(attendanceDetails.getAttendanceStatus());
        attendance.setApprovalStatus(attendanceDetails.getApprovalStatus());
        attendance.setReviewedBy(attendanceDetails.getReviewedBy());
        attendance.setReviewedAt(attendanceDetails.getReviewedAt());
		attendance.setEmployee(attendanceDetails.getEmployee());

		Attendance updated = attendanceService.save(attendance);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete attendance by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        if (!attendanceService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        attendanceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
