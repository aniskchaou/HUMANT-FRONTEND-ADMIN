package com.dev.delta.services;

import com.dev.delta.entities.Payment;
import com.dev.delta.repositories.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository repo;

    public PaymentService(PaymentRepository repo) { this.repo = repo; }

    public List<Payment> findAll() { return repo.findAllByOrderByCreatedAtDesc(); }
    public List<Payment> findByTenant(String tenantCode) { return repo.findByTenantCodeOrderByCreatedAtDesc(tenantCode); }
    public Optional<Payment> findById(Long id) { return repo.findById(id); }
    public Payment save(Payment payment) { return repo.save(payment); }
    public void delete(Long id) { repo.deleteById(id); }

    public long countFailed() { return repo.countByStatus(Payment.Status.FAILED); }

    public long totalRevenueCents() {
        return repo.findByStatusOrderByCreatedAtDesc(Payment.Status.COMPLETED)
                .stream().mapToLong(Payment::getAmountCents).sum();
    }

    public long refundedCents() {
        return repo.findByStatusOrderByCreatedAtDesc(Payment.Status.REFUNDED)
                .stream().mapToLong(Payment::getRefundedAmountCents).sum();
    }

    public Payment refund(Payment payment, long refundCents) {
        long total = payment.getRefundedAmountCents() + refundCents;
        payment.setRefundedAmountCents(total);
        payment.setStatus(total >= payment.getAmountCents()
                ? Payment.Status.REFUNDED : Payment.Status.PARTIALLY_REFUNDED);
        payment.setRefundedAt(LocalDateTime.now());
        return repo.save(payment);
    }

    public Payment retry(Payment payment) {
        payment.setStatus(Payment.Status.PENDING);
        payment.setFailureReason(null);
        return repo.save(payment);
    }
}
