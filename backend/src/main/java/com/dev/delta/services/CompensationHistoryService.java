package com.dev.delta.services;

import com.dev.delta.entities.CompensationHistory;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.CompensationHistoryRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompensationHistoryService {
    @Autowired
    private CompensationHistoryRepository compensationHistoryRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<CompensationHistory> findAll() {
        return compensationHistoryRepository.findAll();
    }

    public Optional<CompensationHistory> findById(Long id) {
        return compensationHistoryRepository.findById(id);
    }

    public CompensationHistory save(CompensationHistory compensationHistory) {
        compensationHistory.setEmployee(resolveEmployee(compensationHistory.getEmployee()));
        return compensationHistoryRepository.save(compensationHistory);
    }

    public void deleteById(Long id) {
        compensationHistoryRepository.deleteById(id);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElse(employee);
    }
}
