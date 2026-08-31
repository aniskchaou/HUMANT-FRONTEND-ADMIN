package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
public class Invoice {

    public enum Status { DRAFT, SENT, PAID, VOID, REFUNDED, OVERDUE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String invoiceNumber;

    @Column(nullable = false, length = 80)
    private String tenantCode;

    @Column(nullable = false, length = 160)
    private String companyName;

    @Column(nullable = false)
    private Long amountCents = 0L;

    @Column(nullable = false)
    private Long taxAmountCents = 0L;

    @Column(length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.DRAFT;

    @Column(length = 500)
    private String description;

    /** Stripe invoice / payment intent ID */
    @Column(length = 120)
    private String stripeInvoiceId;

    @Column(length = 120)
    private String stripePriceId;

    @Column(length = 200)
    private String downloadUrl;

    @CreationTimestamp
    private LocalDateTime issuedAt;

    private LocalDateTime dueAt;
    private LocalDateTime paidAt;
    private LocalDateTime voidedAt;
    private LocalDateTime sentAt;
}
