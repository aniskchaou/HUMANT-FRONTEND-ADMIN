package com.dev.delta.entities;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String documentName;

    private String documentType;

    private String documentCategory;

    private String originalFileName;

    private String storedFileName;

    private String contentType;

    private Long fileSize;

    private String versionGroup;

    private Integer versionNumber;

    private Boolean activeVersion;

    private String accessLevel;

    @Column(length = 1500)
    private String notes;

    private String uploadedBy;

    private String filePath;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private LocalDateTime uploadedAt;

    private LocalDateTime lastModifiedAt;
}

