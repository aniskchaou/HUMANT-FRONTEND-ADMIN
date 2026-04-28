package com.dev.delta.entities;

import com.dev.delta.entities.Employee;
import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payslips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaySlip {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private LocalDate issueDate;

	private String cycleMonth;

	private BigDecimal basicSalary;
	private BigDecimal allowanceTotal;
	private BigDecimal grossSalary;
	private BigDecimal bonus;
	private BigDecimal deductions;
	private BigDecimal taxAmount;
	private BigDecimal netSalary;
	private String salaryStructureName;

	@ManyToOne
	@JoinColumn(name = "employee_id")
	private Employee employee;

	private String remarks; // optional notes
}
