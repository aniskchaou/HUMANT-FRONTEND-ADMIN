package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "final_settlements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinalSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate settlementDate;

    private BigDecimal totalAmount;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

