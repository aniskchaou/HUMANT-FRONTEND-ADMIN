package com.dev.delta.entities;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taskName;

    @Column(length = 1200)
    private String taskDescription;

    private String taskCategory;

    private String requiredDocumentCategory;

    private LocalDate dueDate;

    private Boolean completed;

    private LocalDateTime assignedAt;

    private LocalDateTime completedAt;

    private String assignedBy;

    private Integer taskOrder;

    @Column(length = 1500)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

