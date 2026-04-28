package com.dev.delta.services;

import com.dev.delta.entities.Benefit;
import com.dev.delta.repositories.BenefitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BenefitService {
    @Autowired
    private BenefitRepository benefitRepository;

    public List<Benefit> findAll() {
        return benefitRepository.findAll();
    }

    public Optional<Benefit> findById(Long id) {
        return benefitRepository.findById(id);
    }

    public Benefit save(Benefit benefit) {
        return benefitRepository.save(benefit);
    }

    public void deleteById(Long id) {
        benefitRepository.deleteById(id);
    }
}
