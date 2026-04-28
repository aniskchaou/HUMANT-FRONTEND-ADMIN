package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.ExitInterview;
import com.dev.delta.repositories.ExitInterviewRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ExitInterviewService {
    @Autowired
    private ExitInterviewRepository exitInterviewRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<ExitInterview> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.getCurrentEmployeeOrThrow();
            return exitInterviewRepository.findAllByEmployeeIdOrderByInterviewDateDescIdDesc(currentEmployee.getId());
        }

        return exitInterviewRepository.findAll();
    }

    public Optional<ExitInterview> findById(Long id) {
        return exitInterviewRepository.findById(id)
            .filter(interview -> employeeContextService.canAccessEmployee(interview.getEmployee()));
    }

    public ExitInterview save(ExitInterview exitInterview) {
        assertCanManageExitWorkflow();
        exitInterview.setEmployee(resolveEmployee(exitInterview.getEmployee()));
        return exitInterviewRepository.save(exitInterview);
    }

    public ExitInterview update(Long id, ExitInterview exitInterviewDetails) {
        assertCanManageExitWorkflow();

        ExitInterview exitInterview = findByIdOrThrow(id);
        exitInterview.setInterviewDate(
            exitInterviewDetails.getInterviewDate() != null
                ? exitInterviewDetails.getInterviewDate()
                : exitInterview.getInterviewDate()
        );
        exitInterview.setInterviewerName(defaultText(exitInterviewDetails.getInterviewerName(), exitInterview.getInterviewerName()));
        exitInterview.setFeedback(defaultText(exitInterviewDetails.getFeedback(), exitInterview.getFeedback()));
        exitInterview.setSuggestions(defaultText(exitInterviewDetails.getSuggestions(), exitInterview.getSuggestions()));
        Employee employee = resolveEmployee(exitInterviewDetails.getEmployee());
        exitInterview.setEmployee(employee != null ? employee : exitInterview.getEmployee());
        return exitInterviewRepository.save(exitInterview);
    }

    public void deleteById(Long id) {
        assertCanManageExitWorkflow();
        ExitInterview exitInterview = findByIdOrThrow(id);
        exitInterviewRepository.deleteById(exitInterview.getId());
    }

    private ExitInterview findByIdOrThrow(Long id) {
        return exitInterviewRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Exit interview not found.")
        );
    }

    private void assertCanManageExitWorkflow() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage exit interviews.");
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
