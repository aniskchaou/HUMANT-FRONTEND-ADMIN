package com.dev.delta.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String claimNumber;

    private String claimType;  // e.g., "Travel", "Meals", "Supplies"

    @Column(length = 1000)
    private String description;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    private LocalDate claimDate;

    @Column(length = 600)
    private String notes;

    private String submittedBy;

    private LocalDateTime submittedAt;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(length = 600)
    private String reviewNotes;

    private String receiptOriginalFileName;

    @JsonIgnore
    private String receiptStoredFileName;

    private String receiptContentType;

    @JsonIgnore
    private String receiptFilePath;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({
        "manager",
        "coach",
        "teamMembers",
        "mentees",
        "leaveRequests",
        "attendances",
        "payrolls",
        "performanceReviews",
        "documents",
        "mentorshipsAsMentor",
        "mentorshipsAsMentee",
        "teams",
        "managedTeams",
        "skills"
    })
    private Employee employee;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Boolean getHasReceipt() {
        return receiptFilePath != null && !receiptFilePath.trim().isEmpty();
    }

    public enum ClaimStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}

