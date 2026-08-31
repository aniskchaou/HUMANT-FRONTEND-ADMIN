package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
public class Payment {

    public enum Status { PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED, CHARGEBACK }
    public enum Method { CARD, BANK_TRANSFER, PAYPAL, STRIPE, MANUAL, OTHER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String tenantCode;

    @Column(nullable = false, length = 160)
    private String companyName;

    @Column(nullable = false)
    private Long amountCents = 0L;

    @Column(nullable = false)
    private Long refundedAmountCents = 0L;

    @Column(length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    private Method method = Method.STRIPE;

    @Column(length = 200)
    private String description;

    @Column(length = 120)
    private String stripePaymentIntentId;

    @Column(length = 120)
    private String stripeInvoiceId;

    @Column(length = 500)
    private String failureReason;

    @Column(nullable = false)
    private Long invoiceId = 0L;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;
    private LocalDateTime refundedAt;
}
