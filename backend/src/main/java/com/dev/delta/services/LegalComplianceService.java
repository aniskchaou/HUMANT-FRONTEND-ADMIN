package com.dev.delta.services;

import com.dev.delta.entities.LegalCompliance;
import com.dev.delta.repositories.LegalComplianceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LegalComplianceService {
    @Autowired
    private LegalComplianceRepository legalComplianceRepository;

    public List<LegalCompliance> findAll() {
        return legalComplianceRepository.findAll();
    }

    public Optional<LegalCompliance> findById(Long id) {
        return legalComplianceRepository.findById(id);
    }

    public LegalCompliance save(LegalCompliance legalCompliance) {
        return legalComplianceRepository.save(legalCompliance);
    }

    public void deleteById(Long id) {
        legalComplianceRepository.deleteById(id);
    }
}
