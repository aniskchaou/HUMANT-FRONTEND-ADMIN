package com.dev.delta.entities;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "pipelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pipeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PipelineStage stage;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    public enum PipelineStage {
        APPLIED,
        SCREENING,
        INTERVIEW,
        OFFER,
        HIRED,
        REJECTED
    }
}
