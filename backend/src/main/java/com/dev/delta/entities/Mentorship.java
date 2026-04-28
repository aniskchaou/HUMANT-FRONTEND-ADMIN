package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "mentorships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mentorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private Employee mentor;

    @ManyToOne
    @JoinColumn(name = "mentee_id")
    private Employee mentee;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;  // e.g., Active, Completed, Paused

    private String notes;
}

