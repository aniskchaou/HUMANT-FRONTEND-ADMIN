package com.dev.delta.services;

import com.dev.delta.entities.Referral;
import com.dev.delta.repositories.ReferralRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReferralService {
    @Autowired
    private ReferralRepository referralRepository;

    public List<Referral> findAll() {
        return referralRepository.findAll();
    }

    public Optional<Referral> findById(Long id) {
        return referralRepository.findById(id);
    }

    public Referral save(Referral referral) {
        return referralRepository.save(referral);
    }

    public void deleteById(Long id) {
        referralRepository.deleteById(id);
    }
}
