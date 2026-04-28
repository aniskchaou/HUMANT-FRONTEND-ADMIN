package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.OnboardingChecklist;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.OnboardingChecklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OnboardingChecklistService {
    @Autowired
    private OnboardingChecklistRepository onboardingChecklistRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<OnboardingChecklist> findAll() {
        return onboardingChecklistRepository.findAllByOrderByAssignedAtDescIdDesc();
    }

    public List<OnboardingChecklist> findByEmployeeId(Long employeeId) {
        resolveEmployeeById(employeeId);
        return onboardingChecklistRepository.findAllByEmployeeIdOrderByTaskOrderAscDueDateAscIdAsc(employeeId);
    }

    public Optional<OnboardingChecklist> findById(Long id) {
        return onboardingChecklistRepository.findById(id);
    }

    public OnboardingChecklist save(OnboardingChecklist onboardingChecklist) {
        onboardingChecklist.setEmployee(resolveEmployee(onboardingChecklist.getEmployee()));
        normalizeChecklist(onboardingChecklist);
        return onboardingChecklistRepository.save(onboardingChecklist);
    }

    public OnboardingChecklist update(Long id, OnboardingChecklist onboardingChecklistDetails) {
        OnboardingChecklist onboardingChecklist = getChecklistById(id);

        if (onboardingChecklistDetails.getEmployee() != null) {
            onboardingChecklist.setEmployee(resolveEmployee(onboardingChecklistDetails.getEmployee()));
        }

        onboardingChecklist.setTaskName(defaultText(onboardingChecklistDetails.getTaskName(), onboardingChecklist.getTaskName()));
        onboardingChecklist.setTaskDescription(defaultText(onboardingChecklistDetails.getTaskDescription(), onboardingChecklist.getTaskDescription()));
        onboardingChecklist.setTaskCategory(defaultText(onboardingChecklistDetails.getTaskCategory(), onboardingChecklist.getTaskCategory()));
        onboardingChecklist.setRequiredDocumentCategory(
            defaultText(
                onboardingChecklistDetails.getRequiredDocumentCategory(),
                onboardingChecklist.getRequiredDocumentCategory()
            )
        );
        onboardingChecklist.setDueDate(
            onboardingChecklistDetails.getDueDate() != null
                ? onboardingChecklistDetails.getDueDate()
                : onboardingChecklist.getDueDate()
        );
        onboardingChecklist.setCompleted(
            onboardingChecklistDetails.getCompleted() != null
                ? onboardingChecklistDetails.getCompleted()
                : onboardingChecklist.getCompleted()
        );
        onboardingChecklist.setAssignedBy(defaultText(onboardingChecklistDetails.getAssignedBy(), onboardingChecklist.getAssignedBy()));
        onboardingChecklist.setTaskOrder(
            onboardingChecklistDetails.getTaskOrder() != null
                ? onboardingChecklistDetails.getTaskOrder()
                : onboardingChecklist.getTaskOrder()
        );
        onboardingChecklist.setNotes(
            onboardingChecklistDetails.getNotes() != null
                ? onboardingChecklistDetails.getNotes()
                : onboardingChecklist.getNotes()
        );

        if (onboardingChecklistDetails.getAssignedAt() != null) {
            onboardingChecklist.setAssignedAt(onboardingChecklistDetails.getAssignedAt());
        }

        normalizeChecklist(onboardingChecklist);
        return onboardingChecklistRepository.save(onboardingChecklist);
    }

    public List<OnboardingChecklist> assignStarterChecklist(Long employeeId) {
        Employee employee = resolveEmployeeById(employeeId);
        List<OnboardingChecklist> existingChecklists = new ArrayList<>(
            onboardingChecklistRepository.findAllByEmployeeIdOrderByTaskOrderAscDueDateAscIdAsc(employeeId)
        );
        LocalDate anchorDate = employee.getJoiningDate() != null ? employee.getJoiningDate() : LocalDate.now();

        createStarterTask(
            existingChecklists,
            employee,
            1,
            "Review and sign offer letter",
            "Share the signed offer letter and confirm the agreed start date.",
            "PREBOARDING",
            "OFFER_LETTER",
            anchorDate
        );
        createStarterTask(
            existingChecklists,
            employee,
            2,
            "Upload ID and payroll documents",
            "Collect identity, tax, and payroll onboarding files before the first payroll cycle.",
            "DOCUMENTS",
            "ID",
            anchorDate.plusDays(1)
        );
        createStarterTask(
            existingChecklists,
            employee,
            3,
            "Review contract and handbook",
            "Confirm employment terms, policies, and the manager welcome pack.",
            "COMPLIANCE",
            "CONTRACT",
            anchorDate.plusDays(2)
        );
        createStarterTask(
            existingChecklists,
            employee,
            4,
            "Complete employee profile setup",
            "Capture contact information, emergency details, and salary profile setup.",
            "SETUP",
            null,
            anchorDate.plusDays(3)
        );
        createStarterTask(
            existingChecklists,
            employee,
            5,
            "Finish first-week orientation",
            "Track equipment, introductions, and first-week orientation tasks.",
            "FIRST_WEEK",
            null,
            anchorDate.plusDays(5)
        );

        return onboardingChecklistRepository.findAllByEmployeeIdOrderByTaskOrderAscDueDateAscIdAsc(employeeId);
    }

    public void deleteById(Long id) {
        getChecklistById(id);
        onboardingChecklistRepository.deleteById(id);
    }

    private void createStarterTask(
        List<OnboardingChecklist> existingChecklists,
        Employee employee,
        Integer taskOrder,
        String taskName,
        String taskDescription,
        String taskCategory,
        String requiredDocumentCategory,
        LocalDate dueDate
    ) {
        if (hasTask(existingChecklists, taskName)) {
            return;
        }

        OnboardingChecklist onboardingChecklist = new OnboardingChecklist();
        onboardingChecklist.setEmployee(employee);
        onboardingChecklist.setTaskName(taskName);
        onboardingChecklist.setTaskDescription(taskDescription);
        onboardingChecklist.setTaskCategory(taskCategory);
        onboardingChecklist.setRequiredDocumentCategory(requiredDocumentCategory);
        onboardingChecklist.setDueDate(dueDate);
        onboardingChecklist.setTaskOrder(taskOrder);
        onboardingChecklist.setCompleted(Boolean.FALSE);
        normalizeChecklist(onboardingChecklist);
        onboardingChecklistRepository.save(onboardingChecklist);
        existingChecklists.add(onboardingChecklist);
    }

    private boolean hasTask(List<OnboardingChecklist> existingChecklists, String taskName) {
        String normalizedTaskName = normalizeText(taskName).toLowerCase();

        for (OnboardingChecklist item : existingChecklists) {
            if (normalizeText(item.getTaskName()).toLowerCase().equals(normalizedTaskName)) {
                return true;
            }
        }

        return false;
    }

    private void normalizeChecklist(OnboardingChecklist onboardingChecklist) {
        onboardingChecklist.setTaskName(defaultText(onboardingChecklist.getTaskName(), "Onboarding task"));
        onboardingChecklist.setTaskDescription(normalizeText(onboardingChecklist.getTaskDescription()));
        onboardingChecklist.setTaskCategory(defaultText(onboardingChecklist.getTaskCategory(), "GENERAL").toUpperCase());
        onboardingChecklist.setRequiredDocumentCategory(
            normalizeRequiredDocumentCategory(onboardingChecklist.getRequiredDocumentCategory())
        );
        onboardingChecklist.setAssignedBy(defaultText(onboardingChecklist.getAssignedBy(), getCurrentUsername()));
        onboardingChecklist.setAssignedAt(
            onboardingChecklist.getAssignedAt() != null ? onboardingChecklist.getAssignedAt() : LocalDateTime.now()
        );
        onboardingChecklist.setTaskOrder(onboardingChecklist.getTaskOrder() != null ? onboardingChecklist.getTaskOrder() : 0);
        onboardingChecklist.setNotes(normalizeText(onboardingChecklist.getNotes()));

        boolean completed = onboardingChecklist.getCompleted() != null && onboardingChecklist.getCompleted();
        onboardingChecklist.setCompleted(completed);

        if (completed) {
            onboardingChecklist.setCompletedAt(
                onboardingChecklist.getCompletedAt() != null ? onboardingChecklist.getCompletedAt() : LocalDateTime.now()
            );
        } else {
            onboardingChecklist.setCompletedAt(null);
        }
    }

    private String normalizeRequiredDocumentCategory(String value) {
        String normalizedValue = normalizeText(value).toUpperCase();

        if (!StringUtils.hasText(normalizedValue)) {
            return null;
        }

        if (normalizedValue.contains("OFFER")) {
            return "OFFER_LETTER";
        }

        if (normalizedValue.startsWith("CONTRACT")) {
            return "CONTRACT";
        }

        if (normalizedValue.equals("ID") || normalizedValue.startsWith("IDENT")) {
            return "ID";
        }

        if (normalizedValue.startsWith("CERT")) {
            return "CERTIFICATE";
        }

        if (normalizedValue.startsWith("OTHER")) {
            return "OTHER";
        }

        return normalizedValue;
    }

    private OnboardingChecklist getChecklistById(Long id) {
        return onboardingChecklistRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Onboarding checklist item not found.")
        );
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee is required.");
        }

        return resolveEmployeeById(employee.getId());
    }

    private Employee resolveEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee was not found.")
        );
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            return "system";
        }

        return authentication.getName();
    }

    private String defaultText(String value, String fallback) {
        String normalizedValue = normalizeText(value);
        return StringUtils.hasText(normalizedValue) ? normalizedValue : normalizeText(fallback);
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}
