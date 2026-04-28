package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate payrollDate;

    private String cycleMonth;

    private BigDecimal basicSalary;

    private BigDecimal allowanceTotal;

    private BigDecimal grossSalary;

    private BigDecimal bonus;

    private BigDecimal deductions;

    private BigDecimal taxAmount;

    private BigDecimal netSalary;

    private String salaryStructureName;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
