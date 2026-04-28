package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.FinalSettlement;
import com.dev.delta.repositories.FinalSettlementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class FinalSettlementService {
    @Autowired
    private FinalSettlementRepository finalSettlementRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<FinalSettlement> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.getCurrentEmployeeOrThrow();
            return finalSettlementRepository.findAllByEmployeeIdOrderBySettlementDateDescIdDesc(currentEmployee.getId());
        }

        return finalSettlementRepository.findAll();
    }

    public Optional<FinalSettlement> findById(Long id) {
        return finalSettlementRepository.findById(id)
            .filter(settlement -> employeeContextService.canAccessEmployee(settlement.getEmployee()));
    }

    public FinalSettlement save(FinalSettlement finalSettlement) {
        assertCanManageFinalSettlement();
        finalSettlement.setEmployee(resolveEmployee(finalSettlement.getEmployee()));
        return finalSettlementRepository.save(finalSettlement);
    }

    public FinalSettlement update(Long id, FinalSettlement finalSettlementDetails) {
        assertCanManageFinalSettlement();

        FinalSettlement finalSettlement = findByIdOrThrow(id);
        finalSettlement.setSettlementDate(
            finalSettlementDetails.getSettlementDate() != null
                ? finalSettlementDetails.getSettlementDate()
                : finalSettlement.getSettlementDate()
        );
        finalSettlement.setTotalAmount(
            finalSettlementDetails.getTotalAmount() != null
                ? finalSettlementDetails.getTotalAmount()
                : finalSettlement.getTotalAmount()
        );
        finalSettlement.setRemarks(defaultText(finalSettlementDetails.getRemarks(), finalSettlement.getRemarks()));
        Employee employee = resolveEmployee(finalSettlementDetails.getEmployee());
        finalSettlement.setEmployee(employee != null ? employee : finalSettlement.getEmployee());
        return finalSettlementRepository.save(finalSettlement);
    }

    public void deleteById(Long id) {
        assertCanManageFinalSettlement();
        FinalSettlement finalSettlement = findByIdOrThrow(id);
        finalSettlementRepository.deleteById(finalSettlement.getId());
    }

    private FinalSettlement findByIdOrThrow(Long id) {
        return finalSettlementRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Final settlement not found.")
        );
    }

    private void assertCanManageFinalSettlement() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage final settlements.");
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
