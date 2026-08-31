package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "integrations")
@Data
@NoArgsConstructor
public class Integration {

    public enum Category { IDENTITY, HR, COMMUNICATION, ANALYTICS, OTHER }
    public enum SyncStatus { IDLE, SYNCING, SUCCESS, FAILED, NOT_CONFIGURED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique key per integration type, e.g. "microsoft_entra_id" */
    @Column(nullable = false, unique = true, length = 100)
    private String integrationKey;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 200)
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category = Category.OTHER;

    @Column(nullable = false)
    private Boolean enabled = false;

    /** JSON string of integration credentials (never exposed to frontend) */
    @Column(length = 4000)
    private String credentialsJson;

    /** Configuration metadata visible to frontend (no secrets) */
    @Column(length = 2000)
    private String configJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SyncStatus syncStatus = SyncStatus.NOT_CONFIGURED;

    @Column(nullable = false)
    private Integer failedSyncs = 0;

    @Column(length = 1000)
    private String lastSyncError;

    /** Comma-separated log entries (last 5) */
    @Column(length = 4000)
    private String recentLogs;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime lastSyncAt;
    private LocalDateTime lastTestedAt;
}
