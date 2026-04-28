package com.dev.delta.services;

import com.dev.delta.entities.SalaryStructure;
import com.dev.delta.repositories.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalaryStructureService {
    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    public List<SalaryStructure> findAll() {
        return salaryStructureRepository.findAll();
    }

    public Optional<SalaryStructure> findById(Long id) {
        return salaryStructureRepository.findById(id);
    }

    public SalaryStructure save(SalaryStructure salaryStructure) {
        return salaryStructureRepository.save(salaryStructure);
    }

    public void deleteById(Long id) {
        salaryStructureRepository.deleteById(id);
    }
}
