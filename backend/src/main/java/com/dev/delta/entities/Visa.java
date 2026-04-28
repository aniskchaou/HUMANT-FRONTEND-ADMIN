package com.dev.delta.entities;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "visas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String visaType;

    private String visaNumber;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
