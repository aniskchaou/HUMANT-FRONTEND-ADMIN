package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "offer_letters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate issueDate;

    private String positionOffered;

    private String salaryOffered;

    private String termsAndConditions;

    private String filePath;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;
}

