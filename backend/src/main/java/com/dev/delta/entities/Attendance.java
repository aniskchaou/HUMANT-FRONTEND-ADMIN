package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String source;
    private String sourceSystem;
    private String deviceId;
    private String externalRecordId;
    private String syncBatchId;
    private LocalDateTime importedAt;
    private String notes;
    private String attendanceStatus;
    private String approvalStatus;
    private String reviewedBy;
    private LocalDateTime reviewedAt;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

