package com.dev.delta.services;

import com.dev.delta.entities.InsurancePlan;
import com.dev.delta.repositories.InsurancePlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InsurancePlanService {
    @Autowired
    private InsurancePlanRepository insurancePlanRepository;

    public List<InsurancePlan> findAll() {
        return insurancePlanRepository.findAll();
    }

    public Optional<InsurancePlan> findById(Long id) {
        return insurancePlanRepository.findById(id);
    }

    public InsurancePlan save(InsurancePlan insurancePlan) {
        return insurancePlanRepository.save(insurancePlan);
    }

    public void deleteById(Long id) {
        insurancePlanRepository.deleteById(id);
    }
}
