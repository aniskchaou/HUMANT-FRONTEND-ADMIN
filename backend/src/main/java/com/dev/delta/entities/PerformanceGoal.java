package com.dev.delta.entities;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "performance_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String objective;

    private String reviewCycle;

    private String kpiName;

    private Double kpiTarget;

    private Double kpiCurrentValue;

    private String kpiUnit;

    private String priority;

    private String status;

    private LocalDate dueDate;

    @Column(length = 1200)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}