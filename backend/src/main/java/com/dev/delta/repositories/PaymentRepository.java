package com.dev.delta.repositories;

import com.dev.delta.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTenantCodeOrderByCreatedAtDesc(String tenantCode);
    List<Payment> findByStatusOrderByCreatedAtDesc(Payment.Status status);
    List<Payment> findAllByOrderByCreatedAtDesc();
    long countByStatus(Payment.Status status);
}
