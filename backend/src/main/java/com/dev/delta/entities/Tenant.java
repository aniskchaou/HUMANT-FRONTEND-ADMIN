package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
public class Tenant {

    public enum Plan { FREE, STARTER, PROFESSIONAL, ENTERPRISE }
    public enum Status { PENDING, ACTIVE, SUSPENDED, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique short code used on the login page, e.g. "acme" */
    @Column(nullable = false, unique = true, length = 80)
    private String tenantCode;

    @Column(nullable = false, length = 160)
    private String companyName;

    @Column(nullable = false, unique = true, length = 200)
    private String adminEmail;

    @Column(length = 200)
    private String adminPasswordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plan plan = Plan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    /** Stripe customer ID (cus_xxx) */
    @Column(length = 120)
    private String stripeCustomerId;

    /** Stripe subscription ID (sub_xxx) */
    @Column(length = 120)
    private String stripeSubscriptionId;

    /** Stripe price ID currently active */
    @Column(length = 120)
    private String stripePriceId;

    @Column(length = 30)
    private String maxUsers = "10";

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime trialEndsAt;

    private LocalDateTime subscriptionEndsAt;
}
