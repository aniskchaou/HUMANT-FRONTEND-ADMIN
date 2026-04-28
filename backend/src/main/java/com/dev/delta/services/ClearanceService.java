package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Clearance;
import com.dev.delta.repositories.ClearanceRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ClearanceService {
    @Autowired
    private ClearanceRepository clearanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<Clearance> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.getCurrentEmployeeOrThrow();
            return clearanceRepository.findAllByEmployeeIdOrderByClearanceDateDescIdDesc(currentEmployee.getId());
        }

        return clearanceRepository.findAll();
    }

    public Optional<Clearance> findById(Long id) {
        return clearanceRepository.findById(id)
            .filter(clearance -> employeeContextService.canAccessEmployee(clearance.getEmployee()));
    }

    public Clearance save(Clearance clearance) {
        assertCanManageExitWorkflow();
        clearance.setEmployee(resolveEmployee(clearance.getEmployee()));
        return clearanceRepository.save(clearance);
    }

    public Clearance update(Long id, Clearance clearanceDetails) {
        assertCanManageExitWorkflow();

        Clearance clearance = findByIdOrThrow(id);
        clearance.setClearanceType(defaultText(clearanceDetails.getClearanceType(), clearance.getClearanceType()));
        clearance.setClearanceDate(
            clearanceDetails.getClearanceDate() != null ? clearanceDetails.getClearanceDate() : clearance.getClearanceDate()
        );
        clearance.setCleared(clearanceDetails.isCleared());
        clearance.setRemarks(defaultText(clearanceDetails.getRemarks(), clearance.getRemarks()));
        Employee employee = resolveEmployee(clearanceDetails.getEmployee());
        clearance.setEmployee(employee != null ? employee : clearance.getEmployee());
        return clearanceRepository.save(clearance);
    }

    public void deleteById(Long id) {
        assertCanManageExitWorkflow();
        Clearance clearance = findByIdOrThrow(id);
        clearanceRepository.deleteById(clearance.getId());
    }

    private Clearance findByIdOrThrow(Long id) {
        return clearanceRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Clearance record not found.")
        );
    }

    private void assertCanManageExitWorkflow() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage clearance records.");
        }
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found.")
        );
    }

    private String defaultText(String value, String fallback) {
        String normalizedValue = value == null ? "" : value.trim();
        return normalizedValue.isEmpty() ? fallback : normalizedValue;
    }
}
