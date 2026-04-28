package com.dev.delta.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reimbursements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reimbursement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "expense_claim_id", unique = true)
    @JsonIgnoreProperties({
        "employee",
        "receiptStoredFileName",
        "receiptFilePath",
        "createdAt",
        "updatedAt"
    })
    private ExpenseClaim expenseClaim;

    @Column(length = 300)
    private String description;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    private LocalDate reimbursementDate;

    @Enumerated(EnumType.STRING)
    private ReimbursementStatus status;

    private String paymentReference;

    @Column(length = 600)
    private String notes;

    private String processedBy;

    private LocalDateTime processedAt;

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

    public Long getExpenseClaimId() {
        return expenseClaim != null ? expenseClaim.getId() : null;
    }

    public enum ReimbursementStatus {
        PENDING,
        PROCESSING,
        REIMBURSED,
        CANCELLED
    }
}

