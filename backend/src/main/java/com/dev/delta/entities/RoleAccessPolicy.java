package com.dev.delta.entities;

import com.dev.delta.entities.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_access_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleAccessPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private UserRole roleName;

    @Column(length = 2400)
    private String allowedRoutePrefixes;

    private Boolean canViewSensitiveData;

    private Boolean canManageUsers;

    private Boolean canManageConfiguration;

    private Boolean canManageCompanies;

    private Boolean canViewAuditLogs;

    private String defaultLandingRoute;

    private LocalDateTime updatedAt;
}