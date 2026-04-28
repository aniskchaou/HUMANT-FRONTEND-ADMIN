package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "compensation_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompensationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate effectiveDate;

    private BigDecimal salary;

    private BigDecimal bonus;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
