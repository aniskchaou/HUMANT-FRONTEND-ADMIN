package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
public class Tenant {

    public enum Plan { FREE, STARTER, PROFESSIONAL, ENTERPRISE }
    public enum Status { PENDING, ACTIVE, TRIAL, SUSPENDED, CANCELLED, ARCHIVED }
    public enum BillingCycle { MONTHLY, ANNUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String tenantCode;

    @Column(nullable = false, length = 160)
    private String companyName;

    @Column(nullable = false, unique = true, length = 200)
    private String adminEmail;

    @Column(length = 200)
    private String adminPasswordHash;

    // ── Company profile ──────────────────────────────────────────────────────
    @Column(length = 120)
    private String industry;

    @Column(length = 60)
    private String companySize;

    @Column(length = 100)
    private String country;

    @Column(length = 10)
    private String currency = "USD";

    @Column(length = 80)
    private String timezone = "UTC";

    @Column(length = 20)
    private String language = "en";

    @Column(length = 200)
    private String domain;

    @Column(length = 120)
    private String subdomain;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String description;

    @Column(length = 40)
    private String phone;

    @Column(length = 120)
    private String ownerName;

    @Column(length = 200)
    private String ownerEmail;

    @Column(length = 500)
    private String notes;

    // ── Subscription ─────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plan plan = Plan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Column(length = 120)
    private String stripeCustomerId;

    @Column(length = 120)
    private String stripeSubscriptionId;

    @Column(length = 120)
    private String stripePriceId;

    @Column(length = 30)
    private String maxUsers = "10";

    @Column(length = 30)
    private String maxEmployees = "50";

    @Column(length = 30)
    private String seatsConsumed = "0";

    @Column(length = 120)
    private String couponCode;

    @Column(length = 30)
    private String discountPercent = "0";

    // ── Usage metrics ─────────────────────────────────────────────────────────
    @Column(nullable = false)
    private Long storageUsageMb = 0L;

    @Column(nullable = false)
    private Long apiCallsThisMonth = 0L;

    @Column(nullable = false)
    private Long totalEmployees = 0L;

    @Column(nullable = false)
    private Long totalUsers = 0L;

    // ── Timestamps ────────────────────────────────────────────────────────────
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime trialStartedAt;
    private LocalDateTime trialEndsAt;
    private LocalDateTime subscriptionEndsAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime archivedAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime lastActivityAt;
}
