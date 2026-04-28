package com.dev.delta.entities;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employee_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority;

    private String title;

    @Column(length = 2000)
    private String message;

    private String route;

    private String contextKey;

    private String authorName;

    private Boolean read;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    public enum NotificationType {
        LEAVE_APPROVED,
        LEAVE_REJECTED,
        PAYROLL_PROCESSED,
        TASK_ASSIGNED,
        ANNOUNCEMENT,
        INTERNAL_MESSAGE
    }

    public enum NotificationPriority {
        LOW,
        MEDIUM,
        HIGH
    }
}