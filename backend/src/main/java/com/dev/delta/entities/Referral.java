package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "referrals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String candidateName;

    private String candidateEmail;

    private String candidatePhone;

    private LocalDate referralDate;

    @Enumerated(EnumType.STRING)
    private ReferralStatus status;

    @ManyToOne
    @JoinColumn(name = "referrer_id")
    private Employee referrer;

    public enum ReferralStatus {
        PENDING,
        INTERVIEWING,
        HIRED,
        REJECTED
    }
}

