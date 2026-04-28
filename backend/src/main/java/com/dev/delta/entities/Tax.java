package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "taxes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taxType;  // e.g., "Income Tax", "Social Security"

    private BigDecimal amount;

    private LocalDate taxDate;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
