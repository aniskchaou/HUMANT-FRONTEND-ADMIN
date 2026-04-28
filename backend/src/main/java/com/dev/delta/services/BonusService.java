package com.dev.delta.services;

import com.dev.delta.entities.Bonus;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.BonusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BonusService {
    @Autowired
    private BonusRepository bonusRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Bonus> findAll() {
        return bonusRepository.findAll();
    }

    public Optional<Bonus> findById(Long id) {
        return bonusRepository.findById(id);
    }

    public Bonus save(Bonus bonus) {
        bonus.setEmployee(resolveEmployee(bonus.getEmployee()));
        return bonusRepository.save(bonus);
    }

    public Bonus update(Long id, Bonus bonusDetails) {
        Bonus bonus = bonusRepository.findById(id).orElseThrow();
        bonus.setReason(bonusDetails.getReason());
        bonus.setAmount(bonusDetails.getAmount());
        bonus.setDateGranted(bonusDetails.getDateGranted());
        bonus.setEmployee(resolveEmployee(bonusDetails.getEmployee()));
        return bonusRepository.save(bonus);
    }

    public void deleteById(Long id) {
        bonusRepository.deleteById(id);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
