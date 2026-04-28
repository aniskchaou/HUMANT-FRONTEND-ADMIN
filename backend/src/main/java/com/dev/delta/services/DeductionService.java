package com.dev.delta.services;

import com.dev.delta.entities.Deduction;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.DeductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeductionService {
    @Autowired
    private DeductionRepository deductionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Deduction> findAll() {
        return deductionRepository.findAll();
    }

    public Optional<Deduction> findById(Long id) {
        return deductionRepository.findById(id);
    }

    public Deduction save(Deduction deduction) {
        deduction.setEmployee(resolveEmployee(deduction.getEmployee()));
        return deductionRepository.save(deduction);
    }

    public Deduction update(Long id, Deduction deductionDetails) {
        Deduction deduction = deductionRepository.findById(id).orElseThrow();
        deduction.setType(deductionDetails.getType());
        deduction.setAmount(deductionDetails.getAmount());
        deduction.setDeductionDate(deductionDetails.getDeductionDate());
        deduction.setEmployee(resolveEmployee(deductionDetails.getEmployee()));
        return deductionRepository.save(deduction);
    }

    public void deleteById(Long id) {
        deductionRepository.deleteById(id);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
