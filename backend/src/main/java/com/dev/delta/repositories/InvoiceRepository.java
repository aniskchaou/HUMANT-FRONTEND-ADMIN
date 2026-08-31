package com.dev.delta.repositories;

import com.dev.delta.entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByTenantCodeOrderByIssuedAtDesc(String tenantCode);
    List<Invoice> findByStatusOrderByIssuedAtDesc(Invoice.Status status);
    List<Invoice> findAllByOrderByIssuedAtDesc();
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    long countByStatus(Invoice.Status status);
    List<Invoice> findByTenantCodeAndStatus(String tenantCode, Invoice.Status status);
}
