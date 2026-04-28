package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String issuedBy;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
