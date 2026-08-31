package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flags")
@Data
@NoArgsConstructor
public class FeatureFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique machine key, e.g. "performance_management" */
    @Column(nullable = false, unique = true, length = 120)
    private String featureKey;

    @Column(nullable = false, length = 120)
    private String featureName;

    @Column(length = 500)
    private String description;

    /** UI module this feature belongs to, e.g. "HR", "Payroll" */
    @Column(length = 80)
    private String module;

    @Column(nullable = false)
    private Boolean enabledGlobally = false;

    /** Comma-separated plan keys where this feature is ON, e.g. "PROFESSIONAL,ENTERPRISE" */
    @Column(length = 500)
    private String enabledForPlans = "";

    /** Comma-separated tenant codes that override plan restriction */
    @Column(length = 2000)
    private String enabledForTenants = "";

    @Column(nullable = false)
    private Boolean betaFeature = false;

    /** 0-100 gradual rollout percentage (0 = off, 100 = all) */
    @Column(nullable = false)
    private Integer rolloutPercent = 0;

    private LocalDateTime scheduledActivationAt;
    private LocalDateTime scheduledDeactivationAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
