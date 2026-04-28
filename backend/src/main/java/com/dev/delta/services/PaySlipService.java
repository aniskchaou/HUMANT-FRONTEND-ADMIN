package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.PaySlip;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.PaySlipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class PaySlipService {
    @Autowired
    private PaySlipRepository paySlipRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<PaySlip> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.findCurrentEmployee().orElse(null);

            if (currentEmployee == null || currentEmployee.getId() == null) {
                return List.of();
            }

            return paySlipRepository.findAllByEmployeeIdOrderByIssueDateDescIdDesc(currentEmployee.getId());
        }

        return paySlipRepository.findAllByOrderByIssueDateDescIdDesc();
    }

    public Optional<PaySlip> findById(Long id) {
        Optional<PaySlip> paySlip = paySlipRepository.findById(id);

        if (!paySlip.isPresent()) {
            return Optional.empty();
        }

        if (employeeContextService.isEmployeeOnlyRole() && !employeeContextService.canAccessEmployee(paySlip.get().getEmployee())) {
            return Optional.empty();
        }

        return paySlip;
    }

    public PaySlip save(PaySlip paySlip) {
        assertCanManagePaySlips();
        paySlip.setEmployee(resolveEmployee(paySlip.getEmployee()));
        return paySlipRepository.save(paySlip);
    }

    public PaySlip update(Long id, PaySlip paySlipDetails) {
        assertCanManagePaySlips();
        PaySlip paySlip = paySlipRepository.findById(id).orElseThrow();
        paySlip.setIssueDate(paySlipDetails.getIssueDate());
        paySlip.setCycleMonth(
            paySlipDetails.getCycleMonth() != null ? paySlipDetails.getCycleMonth() : paySlip.getCycleMonth()
        );
        paySlip.setBasicSalary(paySlipDetails.getBasicSalary());
        paySlip.setAllowanceTotal(
            paySlipDetails.getAllowanceTotal() != null
                ? paySlipDetails.getAllowanceTotal()
                : paySlip.getAllowanceTotal()
        );
        paySlip.setGrossSalary(
            paySlipDetails.getGrossSalary() != null ? paySlipDetails.getGrossSalary() : paySlip.getGrossSalary()
        );
        paySlip.setBonus(paySlipDetails.getBonus());
        paySlip.setDeductions(paySlipDetails.getDeductions());
        paySlip.setTaxAmount(
            paySlipDetails.getTaxAmount() != null ? paySlipDetails.getTaxAmount() : paySlip.getTaxAmount()
        );
        paySlip.setNetSalary(paySlipDetails.getNetSalary());
        paySlip.setEmployee(resolveEmployee(paySlipDetails.getEmployee()));
        paySlip.setSalaryStructureName(
            paySlipDetails.getSalaryStructureName() != null
                ? paySlipDetails.getSalaryStructureName()
                : paySlip.getSalaryStructureName()
        );
        paySlip.setRemarks(paySlipDetails.getRemarks());
        return paySlipRepository.save(paySlip);
    }

    public void deleteById(Long id) {
        assertCanManagePaySlips();
        paySlipRepository.deleteById(id);
    }

    private void assertCanManagePaySlips() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage pay slips.");
        }
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
