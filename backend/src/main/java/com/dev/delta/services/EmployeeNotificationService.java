package com.dev.delta.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.EmployeeNotification;
import com.dev.delta.entities.EmployeeNotification.NotificationPriority;
import com.dev.delta.entities.EmployeeNotification.NotificationType;
import com.dev.delta.repositories.EmployeeNotificationRepository;
import com.dev.delta.repositories.EmployeeRepository;

@Service
public class EmployeeNotificationService {

    @Autowired
    private EmployeeNotificationRepository employeeNotificationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<EmployeeNotification> findAll() {
        return employeeNotificationRepository.findAllByOrderByCreatedAtDescIdDesc();
    }

    public Optional<EmployeeNotification> findById(Long id) {
        return employeeNotificationRepository.findById(id);
    }

    public EmployeeNotification createInternalMessage(EmployeeNotification notification) {
        EmployeeNotification internalMessage = new EmployeeNotification();
        internalMessage.setEmployee(resolveEmployee(notification.getEmployee()));
        internalMessage.setType(NotificationType.INTERNAL_MESSAGE);
        internalMessage.setPriority(
            notification.getPriority() != null ? notification.getPriority() : NotificationPriority.MEDIUM
        );
        internalMessage.setTitle(defaultText(notification.getTitle(), "Internal message"));
        internalMessage.setMessage(defaultText(notification.getMessage(), ""));
        internalMessage.setRoute(defaultText(notification.getRoute(), "/communication"));
        internalMessage.setContextKey("internal-message-" + System.currentTimeMillis());
        internalMessage.setAuthorName(defaultText(notification.getAuthorName(), resolveCurrentActorName()));
        internalMessage.setRead(Boolean.FALSE);
        internalMessage.setCreatedAt(LocalDateTime.now());
        return employeeNotificationRepository.save(internalMessage);
    }

    public EmployeeNotification publishNotification(
        Employee employee,
        NotificationType type,
        String title,
        String message,
        String route,
        String contextKey,
        NotificationPriority priority,
        String authorName
    ) {
        if (employee == null || employee.getId() == null || type == null) {
            return null;
        }

        EmployeeNotification notification = employeeNotificationRepository
            .findFirstByEmployeeIdAndTypeAndContextKeyOrderByIdDesc(employee.getId(), type, defaultText(contextKey, type.name()))
            .orElseGet(EmployeeNotification::new);

        notification.setEmployee(resolveEmployee(employee));
        notification.setType(type);
        notification.setPriority(priority != null ? priority : NotificationPriority.MEDIUM);
        notification.setTitle(defaultText(title, "Notification"));
        notification.setMessage(defaultText(message, ""));
        notification.setRoute(defaultText(route, "/communication"));
        notification.setContextKey(defaultText(contextKey, type.name()));
        notification.setAuthorName(defaultText(authorName, "System"));
        notification.setRead(Boolean.FALSE);
        notification.setCreatedAt(LocalDateTime.now());
        return employeeNotificationRepository.save(notification);
    }

    public EmployeeNotification markAsRead(Long id) {
        EmployeeNotification notification = employeeNotificationRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification could not be found.")
        );
        notification.setRead(Boolean.TRUE);
        return employeeNotificationRepository.save(notification);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee is required.");
        }

        return employeeRepository.findById(employee.getId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee could not be resolved.")
        );
    }

    private String resolveCurrentActorName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null || authentication.getName().trim().isEmpty()) {
            return "System";
        }

        return authentication.getName().trim();
    }

    private String defaultText(String value, String defaultValue) {
        String normalizedValue = value != null ? value.trim() : "";
        return normalizedValue.isEmpty() ? defaultValue : normalizedValue;
    }
}