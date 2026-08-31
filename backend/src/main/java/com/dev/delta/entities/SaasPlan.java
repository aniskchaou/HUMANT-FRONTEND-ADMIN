package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "saas_plans")
@Data
@NoArgsConstructor
public class SaasPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String planKey;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer monthlyPriceCents = 0;

    @Column(nullable = false)
    private Integer annualPriceCents = 0;

    @Column(nullable = false)
    private Integer setupFeeCents = 0;

    @Column(nullable = false)
    private Integer trialDays = 14;

    @Column(length = 10)
    private String currency = "USD";

    @Column(nullable = false)
    private Integer minUsers = 1;

    @Column(nullable = false)
    private Integer maxUsers = 10;

    @Column(nullable = false)
    private Integer maxEmployees = 50;

    @Column(nullable = false)
    private Integer maxStorageMb = 1024;

    @Column(nullable = false)
    private Integer apiLimitPerMonth = 10000;

    /** Comma-separated feature keys included in this plan */
    @Column(length = 2000)
    private String features;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private Boolean hidden = false;

    @Column(nullable = false)
    private Boolean popular = false;

    @Column(nullable = false)
    private Boolean publicPlan = true;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Column(length = 120)
    private String stripePriceIdMonthly;

    @Column(length = 120)
    private String stripePriceIdAnnual;
}
