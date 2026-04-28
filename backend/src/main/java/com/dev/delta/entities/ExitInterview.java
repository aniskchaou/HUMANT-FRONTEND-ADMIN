package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "exit_interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate interviewDate;

    private String interviewerName;

    private String feedback;

    private String suggestions;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}

