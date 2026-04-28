package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.EmployeeNotification.NotificationPriority;
import com.dev.delta.entities.EmployeeNotification.NotificationType;
import com.dev.delta.entities.Task;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeNotificationService employeeNotificationService;

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public Task save(Task task) {
        task.setAssignedTo(resolveEmployee(task.getAssignedTo()));
        task.setAssignedBy(resolveEmployee(task.getAssignedBy()));
        if (task.getStatus() == null) {
            task.setStatus(Task.TaskStatus.PENDING);
        }

        Task savedTask = taskRepository.save(task);
        publishTaskAssignmentNotification(savedTask);
        return savedTask;
    }

    public Task update(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setDueDate(taskDetails.getDueDate());
        task.setStatus(taskDetails.getStatus() != null ? taskDetails.getStatus() : task.getStatus());
        task.setAssignedTo(resolveEmployee(taskDetails.getAssignedTo()));
        task.setAssignedBy(resolveEmployee(taskDetails.getAssignedBy()));

        Task savedTask = taskRepository.save(task);
        publishTaskAssignmentNotification(savedTask);
        return savedTask;
    }

    public void deleteById(Long id) {
        taskRepository.deleteById(id);
    }

    private void publishTaskAssignmentNotification(Task task) {
        Employee assignedEmployee = task.getAssignedTo();

        if (assignedEmployee == null || assignedEmployee.getId() == null) {
            return;
        }

        String title = "Task assigned";
        String dueDateLabel = task.getDueDate() != null ? task.getDueDate().toString() : "soon";
        String message = "Task \"" + defaultText(task.getTitle(), "Untitled task") + "\" is assigned to "
            + resolveEmployeeName(assignedEmployee) + " and is due " + dueDateLabel + ".";

        employeeNotificationService.publishNotification(
            assignedEmployee,
            NotificationType.TASK_ASSIGNED,
            title,
            message,
            "/communication",
            "task-" + task.getId(),
            NotificationPriority.HIGH,
            resolveEmployeeName(task.getAssignedBy())
        );
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    private String resolveEmployeeName(Employee employee) {
        if (employee == null) {
            return "System";
        }

        if (employee.getFullName() != null && !employee.getFullName().trim().isEmpty()) {
            return employee.getFullName().trim();
        }

        return employee.getId() != null ? "Employee #" + employee.getId() : "System";
    }

    private String defaultText(String value, String defaultValue) {
        return value != null && !value.trim().isEmpty() ? value.trim() : defaultValue;
    }
}
