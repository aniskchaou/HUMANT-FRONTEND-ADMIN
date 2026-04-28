package com.dev.delta.services;

import com.dev.delta.entities.Objective;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.ObjectiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ObjectiveService {
    @Autowired
    private ObjectiveRepository objectiveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Objective> findAll() {
        return objectiveRepository.findAll();
    }

    public Optional<Objective> findById(Long id) {
        return objectiveRepository.findById(id);
    }

    public Objective save(Objective objective) {
        objective.setEmployee(resolveEmployee(objective.getEmployee()));
        return objectiveRepository.save(objective);
    }

    public void deleteById(Long id) {
        objectiveRepository.deleteById(id);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
