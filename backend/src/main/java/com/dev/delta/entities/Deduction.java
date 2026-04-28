package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "deductions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;  // e.g., "Tax", "Loan Repayment", "Insurance"

    private BigDecimal amount;

    private LocalDate deductionDate;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
