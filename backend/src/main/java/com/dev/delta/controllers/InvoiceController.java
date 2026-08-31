package com.dev.delta.controllers;

import com.dev.delta.entities.Invoice;
import com.dev.delta.services.InvoiceService;
import com.dev.delta.services.PaymentService;
import com.dev.delta.services.TenantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/invoices")
@CrossOrigin
@Tag(name = "Invoices", description = "Invoice management for Super Admin")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final TenantService tenantService;

    public InvoiceController(InvoiceService invoiceService,
                             PaymentService paymentService,
                             TenantService tenantService) {
        this.invoiceService = invoiceService;
        this.paymentService = paymentService;
        this.tenantService = tenantService;
    }

    @GetMapping
    public List<Invoice> getAll() { return invoiceService.findAll(); }

    @GetMapping("/tenant/{code}")
    public List<Invoice> getByTenant(@PathVariable String code) { return invoiceService.findByTenant(code); }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return invoiceService.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    public ResponseEntity<Invoice> generate(@RequestBody Map<String, Object> body) {
        String tenantCode  = (String) body.get("tenantCode");
        String companyName = (String) body.getOrDefault("companyName", tenantCode);
        long amount   = toLong(body.getOrDefault("amountCents", 0));
        long tax      = toLong(body.getOrDefault("taxAmountCents", 0));
        String desc   = (String) body.getOrDefault("description", "Subscription");
        String cur    = (String) body.getOrDefault("currency", "USD");
        Invoice inv = invoiceService.generate(tenantCode, companyName, amount, tax, desc, cur);
        return ResponseEntity.ok(inv);
    }

    @PutMapping("/{id}/send")
    public ResponseEntity<Invoice> send(@PathVariable Long id) {
        return invoiceService.findById(id).map(inv -> ResponseEntity.ok(invoiceService.markSent(inv)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<Invoice> markPaid(@PathVariable Long id) {
        return invoiceService.findById(id).map(inv -> ResponseEntity.ok(invoiceService.markPaid(inv)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/void")
    public ResponseEntity<Invoice> voidInvoice(@PathVariable Long id) {
        return invoiceService.findById(id).map(inv -> ResponseEntity.ok(invoiceService.voidInvoice(inv)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/refund")
    public ResponseEntity<Invoice> refund(@PathVariable Long id) {
        return invoiceService.findById(id).map(inv -> ResponseEntity.ok(invoiceService.refundInvoice(inv)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return invoiceService.findById(id).map(i -> {
            invoiceService.delete(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Billing dashboard stats. GET /api/super-admin/invoices/billing-stats */
    @GetMapping("/billing-stats")
    public ResponseEntity<Map<String, Object>> billingStats() {
        List<Invoice> all = invoiceService.findAll();
        long totalRevenueCents   = all.stream().filter(i -> i.getStatus() == Invoice.Status.PAID)
                .mapToLong(i -> i.getAmountCents() + i.getTaxAmountCents()).sum();
        long outstandingCents    = all.stream().filter(i -> i.getStatus() == Invoice.Status.SENT)
                .mapToLong(i -> i.getAmountCents() + i.getTaxAmountCents()).sum();
        long overdueCents        = all.stream().filter(i -> i.getStatus() == Invoice.Status.OVERDUE)
                .mapToLong(i -> i.getAmountCents() + i.getTaxAmountCents()).sum();
        long failedPayments      = paymentService.countFailed();
        long totalRefundedCents  = paymentService.refundedCents();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay   = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        long paymentsToday = all.stream().filter(i -> i.getStatus() == Invoice.Status.PAID
                && i.getPaidAt() != null && i.getPaidAt().isAfter(startOfDay))
                .mapToLong(i -> i.getAmountCents() + i.getTaxAmountCents()).sum();
        long paymentsThisMonth = all.stream().filter(i -> i.getStatus() == Invoice.Status.PAID
                && i.getPaidAt() != null && i.getPaidAt().isAfter(startOfMonth))
                .mapToLong(i -> i.getAmountCents() + i.getTaxAmountCents()).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenueCents",    totalRevenueCents);
        stats.put("outstandingCents",     outstandingCents);
        stats.put("overdueCents",         overdueCents);
        stats.put("paymentsTodayCents",   paymentsToday);
        stats.put("paymentsThisMonthCents", paymentsThisMonth);
        stats.put("failedPayments",       failedPayments);
        stats.put("totalRefundedCents",   totalRefundedCents);
        stats.put("totalInvoices",        all.size());
        stats.put("paidInvoices",         invoiceService.countByStatus(Invoice.Status.PAID));
        stats.put("draftInvoices",        invoiceService.countByStatus(Invoice.Status.DRAFT));
        stats.put("overdueInvoices",      invoiceService.countByStatus(Invoice.Status.OVERDUE));
        return ResponseEntity.ok(stats);
    }

    private long toLong(Object val) {
        if (val instanceof Number) { return ((Number) val).longValue(); }
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return 0L; }
    }
}
