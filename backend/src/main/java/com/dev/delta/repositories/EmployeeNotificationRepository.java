package com.dev.delta.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.delta.entities.EmployeeNotification;
import com.dev.delta.entities.EmployeeNotification.NotificationType;

@Repository
public interface EmployeeNotificationRepository extends JpaRepository<EmployeeNotification, Long> {
    List<EmployeeNotification> findAllByOrderByCreatedAtDescIdDesc();

    Optional<EmployeeNotification> findFirstByEmployeeIdAndTypeAndContextKeyOrderByIdDesc(
        Long employeeId,
        NotificationType type,
        String contextKey
    );
}