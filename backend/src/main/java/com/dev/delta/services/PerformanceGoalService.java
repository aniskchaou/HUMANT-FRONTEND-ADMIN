package com.dev.delta.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.PerformanceGoal;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.PerformanceGoalRepository;

@Service
public class PerformanceGoalService {

    private static final DateTimeFormatter REVIEW_CYCLE_FORMATTER =
        DateTimeFormatter.ofPattern("MMMM uuuu", Locale.ENGLISH);

    @Autowired
    private PerformanceGoalRepository performanceGoalRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<PerformanceGoal> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.findCurrentEmployee().orElse(null);

            if (currentEmployee == null || currentEmployee.getId() == null) {
                return List.of();
            }

            return performanceGoalRepository.findAllByEmployeeIdOrderByDueDateAscIdDesc(currentEmployee.getId());
        }

        return performanceGoalRepository.findAllByOrderByDueDateAscIdDesc();
    }

    public Optional<PerformanceGoal> findById(Long id) {
        Optional<PerformanceGoal> performanceGoal = performanceGoalRepository.findById(id);

        if (!performanceGoal.isPresent()) {
            return Optional.empty();
        }

        if (
            employeeContextService.isEmployeeOnlyRole() &&
            !employeeContextService.canAccessEmployee(performanceGoal.get().getEmployee())
        ) {
            return Optional.empty();
        }

        return performanceGoal;
    }

    public PerformanceGoal save(PerformanceGoal performanceGoal) {
        assertCanManagePerformance();
        performanceGoal.setEmployee(resolveEmployee(performanceGoal.getEmployee()));
        normalizePerformanceGoal(performanceGoal);
        return performanceGoalRepository.save(performanceGoal);
    }

    public PerformanceGoal update(Long id, PerformanceGoal performanceGoalDetails) {
        assertCanManagePerformance();
        PerformanceGoal performanceGoal = performanceGoalRepository.findById(id).orElseThrow();
        performanceGoal.setEmployee(resolveEmployee(performanceGoalDetails.getEmployee()));
        performanceGoal.setTitle(performanceGoalDetails.getTitle());
        performanceGoal.setObjective(performanceGoalDetails.getObjective());
        performanceGoal.setReviewCycle(performanceGoalDetails.getReviewCycle());
        performanceGoal.setKpiName(performanceGoalDetails.getKpiName());
        performanceGoal.setKpiTarget(performanceGoalDetails.getKpiTarget());
        performanceGoal.setKpiCurrentValue(performanceGoalDetails.getKpiCurrentValue());
        performanceGoal.setKpiUnit(performanceGoalDetails.getKpiUnit());
        performanceGoal.setPriority(performanceGoalDetails.getPriority());
        performanceGoal.setStatus(performanceGoalDetails.getStatus());
        performanceGoal.setDueDate(performanceGoalDetails.getDueDate());
        performanceGoal.setNotes(performanceGoalDetails.getNotes());
        normalizePerformanceGoal(performanceGoal);
        return performanceGoalRepository.save(performanceGoal);
    }

    public void deleteById(Long id) {
        assertCanManagePerformance();
        performanceGoalRepository.delete(performanceGoalRepository.findById(id).orElseThrow());
    }

    private void assertCanManagePerformance() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage performance goals.");
        }
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    private void normalizePerformanceGoal(PerformanceGoal performanceGoal) {
        performanceGoal.setTitle(normalizeText(performanceGoal.getTitle()));
        performanceGoal.setObjective(normalizeText(performanceGoal.getObjective()));
        performanceGoal.setKpiName(normalizeText(performanceGoal.getKpiName()));
        performanceGoal.setKpiUnit(normalizeText(performanceGoal.getKpiUnit()));
        performanceGoal.setPriority(defaultText(performanceGoal.getPriority(), "Medium"));
        performanceGoal.setStatus(defaultText(performanceGoal.getStatus(), "On track"));
        performanceGoal.setNotes(normalizeText(performanceGoal.getNotes()));

        if (normalizeText(performanceGoal.getReviewCycle()).isEmpty()) {
            performanceGoal.setReviewCycle(resolveReviewCycle(performanceGoal.getDueDate()));
        } else {
            performanceGoal.setReviewCycle(performanceGoal.getReviewCycle().trim());
        }
    }

    private String resolveReviewCycle(LocalDate dueDate) {
        LocalDate referenceDate = dueDate == null ? LocalDate.now() : dueDate;
        return REVIEW_CYCLE_FORMATTER.format(referenceDate);
    }

    private String defaultText(String value, String defaultValue) {
        String normalizedValue = normalizeText(value);
        return normalizedValue.isEmpty() ? defaultValue : normalizedValue;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}