package com.dev.delta.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "platform_roles")
@Data
@NoArgsConstructor
public class PlatformRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String roleName;

    @Column(length = 300)
    private String description;

    /** Comma-separated permission keys */
    @Column(length = 2000)
    private String permissions = "";

    /** System roles cannot be deleted */
    @Column(nullable = false)
    private Boolean systemRole = false;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
