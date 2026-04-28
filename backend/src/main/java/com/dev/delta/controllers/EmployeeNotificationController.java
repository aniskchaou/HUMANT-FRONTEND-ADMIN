package com.dev.delta.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.delta.entities.EmployeeNotification;
import com.dev.delta.services.EmployeeNotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
@Tag(name = "EmployeeNotification", description = "Employee notification APIs")
public class EmployeeNotificationController {

    @Autowired
    private EmployeeNotificationService employeeNotificationService;

    @Operation(summary = "Get all employee notifications")
    @GetMapping
    public List<EmployeeNotification> getAllNotifications() {
        return employeeNotificationService.findAll();
    }

    @Operation(summary = "Get employee notification by ID")
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeNotification> getNotificationById(@PathVariable Long id) {
        Optional<EmployeeNotification> notification = employeeNotificationService.findById(id);
        return notification.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create an internal message for an employee")
    @PostMapping("/internal-message")
    public ResponseEntity<EmployeeNotification> createInternalMessage(@RequestBody EmployeeNotification notification) {
        EmployeeNotification createdNotification = employeeNotificationService.createInternalMessage(notification);
        return new ResponseEntity<EmployeeNotification>(createdNotification, HttpStatus.CREATED);
    }

    @Operation(summary = "Mark an employee notification as read")
    @PutMapping("/{id}/read")
    public ResponseEntity<EmployeeNotification> markNotificationAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(employeeNotificationService.markAsRead(id));
    }
}