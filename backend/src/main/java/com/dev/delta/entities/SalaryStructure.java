package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "salary_structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String structureName;

    private BigDecimal basicSalary;

    private BigDecimal hra; // House Rent Allowance

    private BigDecimal medicalAllowance;

    private BigDecimal travelAllowance;

    private BigDecimal otherAllowances;

    private BigDecimal deductions;

    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
