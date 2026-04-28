package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.EmployeeNotification.NotificationPriority;
import com.dev.delta.entities.EmployeeNotification.NotificationType;
import com.dev.delta.entities.LeaveRequest;
import com.dev.delta.entities.LeaveRequest.LeaveStatus;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LeaveRequestService {
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeNotificationService employeeNotificationService;

    public List<LeaveRequest> findAll() {
        return leaveRequestRepository.findAll();
    }

    public Optional<LeaveRequest> findById(Long id) {
        return leaveRequestRepository.findById(id);
    }

    public LeaveRequest save(LeaveRequest leaveRequest) {
        leaveRequest.setEmployee(resolveEmployee(leaveRequest.getEmployee()));
        if (leaveRequest.getStatus() == null) {
            leaveRequest.setStatus(LeaveStatus.PENDING);
        }

        LeaveRequest savedLeaveRequest = leaveRequestRepository.save(leaveRequest);
        publishLeaveDecisionNotification(savedLeaveRequest, null);
        return savedLeaveRequest;
    }

    public LeaveRequest update(Long id, LeaveRequest leaveRequestDetails) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id).orElseThrow();
        LeaveStatus previousStatus = leaveRequest.getStatus();

        leaveRequest.setStartDate(leaveRequestDetails.getStartDate());
        leaveRequest.setEndDate(leaveRequestDetails.getEndDate());
        leaveRequest.setStatus(
            leaveRequestDetails.getStatus() != null ? leaveRequestDetails.getStatus() : leaveRequest.getStatus()
        );
        leaveRequest.setEmployee(resolveEmployee(leaveRequestDetails.getEmployee()));

        LeaveRequest savedLeaveRequest = leaveRequestRepository.save(leaveRequest);
        publishLeaveDecisionNotification(savedLeaveRequest, previousStatus);
        return savedLeaveRequest;
    }

    public void deleteById(Long id) {
        leaveRequestRepository.deleteById(id);
    }

    private void publishLeaveDecisionNotification(LeaveRequest leaveRequest, LeaveStatus previousStatus) {
        if (leaveRequest == null || leaveRequest.getEmployee() == null || leaveRequest.getStatus() == null) {
            return;
        }

        if (leaveRequest.getStatus() == LeaveStatus.PENDING) {
            return;
        }

        if (previousStatus == leaveRequest.getStatus()) {
            return;
        }

        NotificationType notificationType = leaveRequest.getStatus() == LeaveStatus.APPROVED
            ? NotificationType.LEAVE_APPROVED
            : NotificationType.LEAVE_REJECTED;
        String title = leaveRequest.getStatus() == LeaveStatus.APPROVED
            ? "Leave request approved"
            : "Leave request rejected";
        String message = "Leave request from " + leaveRequest.getStartDate() + " to " + leaveRequest.getEndDate()
            + " was " + leaveRequest.getStatus().name().toLowerCase() + ".";

        employeeNotificationService.publishNotification(
            leaveRequest.getEmployee(),
            notificationType,
            title,
            message,
            "/leave",
            "leave-request-" + leaveRequest.getId(),
            NotificationPriority.HIGH,
            "System"
        );
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
