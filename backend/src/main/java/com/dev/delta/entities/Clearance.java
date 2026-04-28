package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "clearances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Clearance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clearanceType; // e.g., Exit clearance, Security clearance

    private LocalDate clearanceDate;

    private boolean isCleared;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

