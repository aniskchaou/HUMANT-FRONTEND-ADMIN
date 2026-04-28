package com.dev.delta.services;

import com.dev.delta.dto.ReimbursementUpdateRequest;
import com.dev.delta.entities.ExpenseClaim;
import com.dev.delta.entities.Reimbursement;
import com.dev.delta.repositories.ExpenseClaimRepository;
import com.dev.delta.repositories.ReimbursementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReimbursementService {
    @Autowired
    private ReimbursementRepository reimbursementRepository;

    @Autowired
    private ExpenseClaimRepository expenseClaimRepository;

    public List<Reimbursement> findAll() {
        List<Reimbursement> reimbursements = reimbursementRepository.findAllByOrderByIdDesc();

        if (canManageReimbursements() || isManagerRole()) {
            return reimbursements;
        }

        String currentUsername = getCurrentUsername();
        return reimbursements.stream()
            .filter(item -> canAccess(item, currentUsername))
            .collect(Collectors.toList());
    }

    public Optional<Reimbursement> findById(Long id) {
        Optional<Reimbursement> reimbursement = reimbursementRepository.findById(id);

        if (!reimbursement.isPresent() || !canAccess(reimbursement.get(), getCurrentUsername())) {
            return Optional.empty();
        }

        return reimbursement;
    }

    public Reimbursement save(Reimbursement reimbursement) {
        if (!canManageReimbursements()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage reimbursements.");
        }

        reimbursement.setExpenseClaim(resolveExpenseClaim(reimbursement.getExpenseClaim()));

        if (reimbursement.getExpenseClaim() != null) {
            reimbursement.setEmployee(reimbursement.getExpenseClaim().getEmployee());
        }

        normalizeReimbursement(reimbursement);
        return reimbursementRepository.save(reimbursement);
    }

    public Reimbursement update(Long id, ReimbursementUpdateRequest reimbursementDetails) {
        if (!canManageReimbursements()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage reimbursements.");
        }

        Reimbursement reimbursement = getReimbursementById(id);

        reimbursement.setDescription(defaultText(reimbursementDetails.getDescription(), reimbursement.getDescription()));
        reimbursement.setNotes(defaultText(reimbursementDetails.getNotes(), reimbursement.getNotes()));
        reimbursement.setPaymentReference(defaultText(reimbursementDetails.getPaymentReference(), reimbursement.getPaymentReference()));
        reimbursement.setAmount(reimbursementDetails.getAmount() == null ? reimbursement.getAmount() : reimbursementDetails.getAmount());
        reimbursement.setReimbursementDate(
            reimbursementDetails.getReimbursementDate() == null
                ? reimbursement.getReimbursementDate()
                : reimbursementDetails.getReimbursementDate()
        );
        reimbursement.setStatus(resolveStatus(reimbursementDetails.getStatus(), reimbursement.getStatus()));
        reimbursement.setProcessedBy(getCurrentUsername());
        reimbursement.setProcessedAt(LocalDateTime.now());

        if (reimbursement.getExpenseClaim() != null) {
            reimbursement.setEmployee(reimbursement.getExpenseClaim().getEmployee());
        }

        normalizeReimbursement(reimbursement);
        return reimbursementRepository.save(reimbursement);
    }

    public void deleteById(Long id) {
        if (!canManageReimbursements()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage reimbursements.");
        }

        reimbursementRepository.delete(getReimbursementById(id));
    }

    private Reimbursement getReimbursementById(Long id) {
        return reimbursementRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Reimbursement could not be found.")
        );
    }

    private ExpenseClaim resolveExpenseClaim(ExpenseClaim expenseClaim) {
        if (expenseClaim == null || expenseClaim.getId() == null) {
            return null;
        }

        return expenseClaimRepository.findById(expenseClaim.getId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expense claim could not be resolved.")
        );
    }

    private void normalizeReimbursement(Reimbursement reimbursement) {
        ExpenseClaim expenseClaim = reimbursement.getExpenseClaim();

        reimbursement.setDescription(defaultText(reimbursement.getDescription(), expenseClaim != null ? expenseClaim.getClaimType() + " reimbursement" : "Expense reimbursement"));
        reimbursement.setNotes(defaultText(reimbursement.getNotes(), null));
        reimbursement.setPaymentReference(defaultText(reimbursement.getPaymentReference(), null));
        reimbursement.setAmount(reimbursement.getAmount() == null && expenseClaim != null ? expenseClaim.getAmount() : reimbursement.getAmount());
        reimbursement.setStatus(reimbursement.getStatus() == null ? Reimbursement.ReimbursementStatus.PENDING : reimbursement.getStatus());

        if (reimbursement.getStatus() == Reimbursement.ReimbursementStatus.REIMBURSED && reimbursement.getReimbursementDate() == null) {
            reimbursement.setReimbursementDate(LocalDate.now());
        }
    }

    private Reimbursement.ReimbursementStatus resolveStatus(String value, Reimbursement.ReimbursementStatus fallback) {
        String normalized = normalizeText(value);

        if (normalized == null) {
            return fallback;
        }

        try {
            return Reimbursement.ReimbursementStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reimbursement status.", exception);
        }
    }

    private boolean canAccess(Reimbursement reimbursement, String currentUsername) {
        if (reimbursement == null) {
            return false;
        }

        if (canManageReimbursements() || isManagerRole()) {
            return true;
        }

        if (reimbursement.getExpenseClaim() == null) {
            return false;
        }

        return currentUsername.equalsIgnoreCase(defaultText(reimbursement.getExpenseClaim().getSubmittedBy(), ""));
    }

    private boolean canManageReimbursements() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String authorityName = authority.getAuthority();
            if ("ROLE_ADMIN".equalsIgnoreCase(authorityName) || "ROLE_HR".equalsIgnoreCase(authorityName)) {
                return true;
            }
        }

        return false;
    }

    private boolean isManagerRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String authorityName = authority.getAuthority();
            if ("ROLE_MANAGER".equalsIgnoreCase(authorityName)) {
                return true;
            }
        }

        return false;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String defaultText(String value, String defaultValue) {
        String normalized = normalizeText(value);
        return normalized == null ? defaultValue : normalized;
    }
}
