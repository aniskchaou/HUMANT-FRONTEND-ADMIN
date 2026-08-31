package com.dev.delta.services;

import com.dev.delta.entities.Invoice;
import com.dev.delta.repositories.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InvoiceService {

    private final InvoiceRepository repo;
    private static final AtomicLong sequence = new AtomicLong(1000);

    public InvoiceService(InvoiceRepository repo) {
        this.repo = repo;
    }

    public List<Invoice> findAll() { return repo.findAllByOrderByIssuedAtDesc(); }
    public List<Invoice> findByTenant(String tenantCode) { return repo.findByTenantCodeOrderByIssuedAtDesc(tenantCode); }
    public Optional<Invoice> findById(Long id) { return repo.findById(id); }
    public Invoice save(Invoice invoice) { return repo.save(invoice); }
    public void delete(Long id) { repo.deleteById(id); }

    public long totalPaidCents() {
        return repo.findByStatusOrderByIssuedAtDesc(Invoice.Status.PAID)
                .stream().mapToLong(i -> i.getAmountCents() + i.getTaxAmountCents()).sum();
    }

    public long countByStatus(Invoice.Status status) { return repo.countByStatus(status); }

    public Invoice generate(String tenantCode, String companyName, long amountCents,
                            long taxAmountCents, String description, String currency) {
        Invoice inv = new Invoice();
        inv.setInvoiceNumber("INV-" + DateTimeFormatter.ofPattern("yyyyMM").format(LocalDateTime.now())
                + "-" + String.format("%04d", sequence.getAndIncrement()));
        inv.setTenantCode(tenantCode);
        inv.setCompanyName(companyName);
        inv.setAmountCents(amountCents);
        inv.setTaxAmountCents(taxAmountCents);
        inv.setCurrency(currency != null ? currency : "USD");
        inv.setDescription(description);
        inv.setStatus(Invoice.Status.DRAFT);
        inv.setDueAt(LocalDateTime.now().plusDays(30));
        return repo.save(inv);
    }

    public Invoice markSent(Invoice invoice) {
        invoice.setStatus(Invoice.Status.SENT);
        invoice.setSentAt(LocalDateTime.now());
        return repo.save(invoice);
    }

    public Invoice markPaid(Invoice invoice) {
        invoice.setStatus(Invoice.Status.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        return repo.save(invoice);
    }

    public Invoice voidInvoice(Invoice invoice) {
        invoice.setStatus(Invoice.Status.VOID);
        invoice.setVoidedAt(LocalDateTime.now());
        return repo.save(invoice);
    }

    public Invoice refundInvoice(Invoice invoice) {
        invoice.setStatus(Invoice.Status.REFUNDED);
        return repo.save(invoice);
    }
}
