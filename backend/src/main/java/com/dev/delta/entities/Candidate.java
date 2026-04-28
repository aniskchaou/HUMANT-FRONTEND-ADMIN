package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private LocalDate applicationDate;

    private String resumePath;

    @Enumerated(EnumType.STRING)
    private CandidateStatus status;

    @ManyToOne
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    public enum CandidateStatus {
        APPLIED,
        INTERVIEW_SCHEDULED,
        OFFERED,
        REJECTED,
        HIRED
    }
}

