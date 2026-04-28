package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String description;

    private LocalDate effectiveDate;

    private LocalDate expiryDate;

    private String documentPath;
}

