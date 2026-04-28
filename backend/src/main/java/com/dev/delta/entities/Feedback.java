package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String comment;

    private String givenBy; // name or employee ID of the feedback giver

    private LocalDateTime givenAt;

    @Enumerated(EnumType.STRING)
    private FeedbackType type;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    public enum FeedbackType {
        POSITIVE,
        NEGATIVE,
        NEUTRAL
    }
}

