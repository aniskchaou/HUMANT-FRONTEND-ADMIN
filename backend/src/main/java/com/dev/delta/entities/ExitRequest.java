package com.dev.delta.entities;

 

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exit_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExitRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate requestDate;

    private LocalDate lastWorkingDay;

    @Enumerated(EnumType.STRING)
    private ExitStatus status;

    private String reason;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    public enum ExitStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
