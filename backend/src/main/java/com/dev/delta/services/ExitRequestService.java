package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.ExitRequest;
import com.dev.delta.repositories.ExitRequestRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ExitRequestService {
    @Autowired
    private ExitRequestRepository exitRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<ExitRequest> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.getCurrentEmployeeOrThrow();
            return exitRequestRepository.findAllByEmployeeIdOrderBySubmittedAtDescIdDesc(currentEmployee.getId());
        }

        return exitRequestRepository.findAll();
    }

    public Optional<ExitRequest> findById(Long id) {
        return exitRequestRepository.findById(id)
            .filter(request -> employeeContextService.canAccessEmployee(request.getEmployee()));
    }

    public ExitRequest save(ExitRequest exitRequest) {
        exitRequest.setEmployee(resolveEmployeeForSave(exitRequest.getEmployee()));
        exitRequest.setStatus(resolveStatusForCreate(exitRequest.getStatus()));
        return exitRequestRepository.save(exitRequest);
    }

    public ExitRequest update(Long id, ExitRequest exitRequestDetails) {
        ExitRequest exitRequest = findByIdOrThrow(id);

        exitRequest.setRequestDate(
            exitRequestDetails.getRequestDate() != null ? exitRequestDetails.getRequestDate() : exitRequest.getRequestDate()
        );
        exitRequest.setLastWorkingDay(
            exitRequestDetails.getLastWorkingDay() != null ? exitRequestDetails.getLastWorkingDay() : exitRequest.getLastWorkingDay()
        );
        exitRequest.setReason(defaultText(exitRequestDetails.getReason(), exitRequest.getReason()));

        if (employeeContextService.isEmployeeOnlyRole()) {
            exitRequest.setEmployee(employeeContextService.getCurrentEmployeeOrThrow());
        } else {
            Employee employee = resolveEmployee(exitRequestDetails.getEmployee());
            exitRequest.setEmployee(employee != null ? employee : exitRequest.getEmployee());
            exitRequest.setStatus(
                exitRequestDetails.getStatus() != null ? exitRequestDetails.getStatus() : exitRequest.getStatus()
            );
        }

        return exitRequestRepository.save(exitRequest);
    }

    public void deleteById(Long id) {
        ExitRequest exitRequest = findByIdOrThrow(id);
        exitRequestRepository.deleteById(exitRequest.getId());
    }

    private ExitRequest findByIdOrThrow(Long id) {
        ExitRequest exitRequest = exitRequestRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Exit request not found.")
        );

        if (!employeeContextService.canAccessEmployee(exitRequest.getEmployee())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this exit request.");
        }

        return exitRequest;
    }

    private Employee resolveEmployeeForSave(Employee employee) {
        if (employeeContextService.isEmployeeOnlyRole()) {
            return employeeContextService.getCurrentEmployeeOrThrow();
        }

        return resolveEmployee(employee);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found.")
        );
    }

    private ExitRequest.ExitStatus resolveStatusForCreate(ExitRequest.ExitStatus status) {
        if (employeeContextService.isEmployeeOnlyRole()) {
            return ExitRequest.ExitStatus.PENDING;
        }

        return status != null ? status : ExitRequest.ExitStatus.PENDING;
    }

    private String defaultText(String value, String fallback) {
        String normalizedValue = normalizeText(value);
        return normalizedValue.isEmpty() ? fallback : normalizedValue;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}
