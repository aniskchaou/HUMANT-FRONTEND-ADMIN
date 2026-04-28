package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.PerformanceReview;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.PerformanceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class PerformanceReviewService {

    private static final DateTimeFormatter REVIEW_CYCLE_FORMATTER =
        DateTimeFormatter.ofPattern("MMMM uuuu", Locale.ENGLISH);

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeContextService employeeContextService;

    public List<PerformanceReview> findAll() {
        if (employeeContextService.isEmployeeOnlyRole()) {
            Employee currentEmployee = employeeContextService.findCurrentEmployee().orElse(null);

            if (currentEmployee == null || currentEmployee.getId() == null) {
                return List.of();
            }

            return performanceReviewRepository.findAllByEmployeeIdOrderByReviewDateDescIdDesc(currentEmployee.getId());
        }

        return performanceReviewRepository.findAllByOrderByReviewDateDescIdDesc();
    }

    public Optional<PerformanceReview> findById(Long id) {
        Optional<PerformanceReview> performanceReview = performanceReviewRepository.findById(id);

        if (!performanceReview.isPresent()) {
            return Optional.empty();
        }

        if (
            employeeContextService.isEmployeeOnlyRole() &&
            !employeeContextService.canAccessEmployee(performanceReview.get().getEmployee())
        ) {
            return Optional.empty();
        }

        return performanceReview;
    }

    public PerformanceReview save(PerformanceReview performanceReview) {
        assertCanManagePerformance();
        performanceReview.setEmployee(resolveEmployee(performanceReview.getEmployee()));
        normalizePerformanceReview(performanceReview);
        return performanceReviewRepository.save(performanceReview);
    }

    public PerformanceReview update(Long id, PerformanceReview performanceReviewDetails) {
        assertCanManagePerformance();
        PerformanceReview performanceReview = performanceReviewRepository.findById(id).orElseThrow();
        performanceReview.setEmployee(resolveEmployee(performanceReviewDetails.getEmployee()));
        performanceReview.setReviewerName(performanceReviewDetails.getReviewerName());
        performanceReview.setReviewDate(performanceReviewDetails.getReviewDate());
        performanceReview.setReviewCycle(performanceReviewDetails.getReviewCycle());
        performanceReview.setReviewPeriodStart(performanceReviewDetails.getReviewPeriodStart());
        performanceReview.setReviewPeriodEnd(performanceReviewDetails.getReviewPeriodEnd());
        performanceReview.setGoalTitle(performanceReviewDetails.getGoalTitle());
        performanceReview.setObjective(performanceReviewDetails.getObjective());
        performanceReview.setKpiName(performanceReviewDetails.getKpiName());
        performanceReview.setKpiTarget(performanceReviewDetails.getKpiTarget());
        performanceReview.setKpiActual(performanceReviewDetails.getKpiActual());
        performanceReview.setStatus(performanceReviewDetails.getStatus());
        performanceReview.setFeedback(performanceReviewDetails.getFeedback());
        performanceReview.setStrengths(performanceReviewDetails.getStrengths());
        performanceReview.setImprovementAreas(performanceReviewDetails.getImprovementAreas());
        performanceReview.setRating(Math.max(0, performanceReviewDetails.getRating()));
        normalizePerformanceReview(performanceReview);
        return performanceReviewRepository.save(performanceReview);
    }

    public void deleteById(Long id) {
        assertCanManagePerformance();
        performanceReviewRepository.delete(performanceReviewRepository.findById(id).orElseThrow());
    }

    private void assertCanManagePerformance() {
        if (!employeeContextService.hasAnyRole("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage performance reviews.");
        }
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    private void normalizePerformanceReview(PerformanceReview performanceReview) {
        performanceReview.setReviewerName(normalizeText(performanceReview.getReviewerName()));
        performanceReview.setGoalTitle(normalizeText(performanceReview.getGoalTitle()));
        performanceReview.setObjective(normalizeText(performanceReview.getObjective()));
        performanceReview.setKpiName(normalizeText(performanceReview.getKpiName()));
        performanceReview.setFeedback(normalizeText(performanceReview.getFeedback()));
        performanceReview.setStrengths(normalizeText(performanceReview.getStrengths()));
        performanceReview.setImprovementAreas(normalizeText(performanceReview.getImprovementAreas()));
        performanceReview.setStatus(defaultText(performanceReview.getStatus(), "Completed"));

        if (normalizeText(performanceReview.getReviewCycle()).isEmpty()) {
            performanceReview.setReviewCycle(resolveReviewCycle(performanceReview));
        } else {
            performanceReview.setReviewCycle(performanceReview.getReviewCycle().trim());
        }
    }

    private String resolveReviewCycle(PerformanceReview performanceReview) {
        LocalDate referenceDate = performanceReview.getReviewDate();

        if (referenceDate == null) {
            referenceDate = performanceReview.getReviewPeriodEnd();
        }

        if (referenceDate == null) {
            referenceDate = performanceReview.getReviewPeriodStart();
        }

        if (referenceDate == null) {
            referenceDate = LocalDate.now();
        }

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
