package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reviewerName;

    private LocalDate reviewDate;

    private String reviewCycle;

    private LocalDate reviewPeriodStart;

    private LocalDate reviewPeriodEnd;

    private String goalTitle;

    @Column(length = 2000)
    private String objective;

    private String kpiName;

    private Double kpiTarget;

    private Double kpiActual;

    private String status;

    @Column(length = 2000)
    private String feedback;

    @Column(length = 1200)
    private String strengths;

    @Column(length = 1200)
    private String improvementAreas;

    private int rating;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

