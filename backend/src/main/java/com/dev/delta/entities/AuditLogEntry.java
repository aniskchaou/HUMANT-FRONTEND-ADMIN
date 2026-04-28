package com.dev.delta.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actorUsername;

    private String actorRole;

    private String actionType;

    private String targetType;

    private String targetId;

    @Column(length = 800)
    private String summary;

    @Column(length = 4000)
    private String details;

    private String requestPath;

    private String companyCode;

    @CreationTimestamp
    private LocalDateTime createdAt;
}