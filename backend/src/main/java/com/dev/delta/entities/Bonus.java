package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bonuses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bonus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reason;  // e.g., "Performance Bonus", "Holiday Bonus"

    private BigDecimal amount;

    private LocalDate dateGranted;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

