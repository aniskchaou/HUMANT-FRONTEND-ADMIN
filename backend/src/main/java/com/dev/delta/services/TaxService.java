package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Tax;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaxService {
    @Autowired
    private TaxRepository taxRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Tax> findAll() {
        return taxRepository.findAll();
    }

    public Optional<Tax> findById(Long id) {
        return taxRepository.findById(id);
    }

    public Tax save(Tax tax) {
        tax.setEmployee(resolveEmployee(tax.getEmployee()));
        return taxRepository.save(tax);
    }

    public Tax update(Long id, Tax taxDetails) {
        Tax tax = taxRepository.findById(id).orElseThrow();
        tax.setTaxType(taxDetails.getTaxType());
        tax.setAmount(taxDetails.getAmount());
        tax.setTaxDate(taxDetails.getTaxDate());
        tax.setEmployee(resolveEmployee(taxDetails.getEmployee()));
        return taxRepository.save(tax);
    }

    public void deleteById(Long id) {
        taxRepository.deleteById(id);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
