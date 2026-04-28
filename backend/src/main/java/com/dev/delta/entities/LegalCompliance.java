package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "legal_compliances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LegalCompliance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String complianceType;  // e.g., GDPR, OSHA, Labor Law

    private String description;

    private LocalDate effectiveDate;

    private LocalDate expiryDate;

    private boolean isCompliant;

    private String remarks;
}

