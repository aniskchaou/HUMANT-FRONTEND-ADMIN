package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Feedback;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<Feedback> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.findCurrentEmployee().orElse(null);

            if (currentEmployee == null || currentEmployee.getId() == null) {
                return List.of();
            }

            return feedbackRepository.findAllByEmployeeIdOrderByGivenAtDescIdDesc(currentEmployee.getId());
        }

        return feedbackRepository.findAllByOrderByGivenAtDescIdDesc();
    }

    public Optional<Feedback> findById(Long id) {
        Optional<Feedback> feedback = feedbackRepository.findById(id);

        if (!feedback.isPresent()) {
            return Optional.empty();
        }

        if (employeeContextService.isEmployeeOnlyRole() && !employeeContextService.canAccessEmployee(feedback.get().getEmployee())) {
            return Optional.empty();
        }

        return feedback;
    }

    public Feedback save(Feedback feedback) {
        assertCanManagePerformance();
        feedback.setEmployee(resolveEmployee(feedback.getEmployee()));
        feedback.setComment(normalizeText(feedback.getComment()));
        feedback.setGivenBy(defaultText(feedback.getGivenBy(), "Manager"));
        if (feedback.getGivenAt() == null) {
            feedback.setGivenAt(LocalDateTime.now());
        }
        if (feedback.getType() == null) {
            feedback.setType(Feedback.FeedbackType.NEUTRAL);
        }
        return feedbackRepository.save(feedback);
    }

    public Feedback update(Long id, Feedback feedbackDetails) {
        assertCanManagePerformance();
        Feedback feedback = feedbackRepository.findById(id).orElseThrow();
        feedback.setEmployee(resolveEmployee(feedbackDetails.getEmployee()));
        feedback.setComment(feedbackDetails.getComment());
        feedback.setGivenBy(feedbackDetails.getGivenBy());
        feedback.setGivenAt(feedbackDetails.getGivenAt());
        feedback.setType(feedbackDetails.getType());
        return save(feedback);
    }

    public void deleteById(Long id) {
        assertCanManagePerformance();
        feedbackRepository.delete(feedbackRepository.findById(id).orElseThrow());
    }

    private void assertCanManagePerformance() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage employee feedback.");
        }
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    private String defaultText(String value, String defaultValue) {
        String normalizedValue = normalizeText(value);
        return normalizedValue.isEmpty() ? defaultValue : normalizedValue;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}
