package com.dev.delta.services;

import com.dev.delta.entities.ExpenseClaim;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Reimbursement;
import com.dev.delta.repositories.ExpenseClaimRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.ReimbursementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExpenseClaimService {
    private final Path storageRoot = Paths.get("storage", "expense-receipts").toAbsolutePath().normalize();

    @Autowired
    private ExpenseClaimRepository expenseClaimRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ReimbursementRepository reimbursementRepository;

    @Autowired
    private UserService userService;

    public List<ExpenseClaim> findAll() {
        List<ExpenseClaim> claims = expenseClaimRepository.findAllByOrderBySubmittedAtDescIdDesc();

        if (isPrivilegedRole()) {
            return claims;
        }

        String currentUsername = getCurrentUsername();
        return claims.stream()
            .filter(claim -> canAccess(claim, currentUsername))
            .collect(Collectors.toList());
    }

    public Optional<ExpenseClaim> findById(Long id) {
        Optional<ExpenseClaim> expenseClaim = expenseClaimRepository.findById(id);

        if (!expenseClaim.isPresent() || !canAccess(expenseClaim.get(), getCurrentUsername())) {
            return Optional.empty();
        }

        return expenseClaim;
    }

    public ExpenseClaim save(ExpenseClaim expenseClaim) {
        assertValidClaim(
            expenseClaim.getClaimType(),
            expenseClaim.getDescription(),
            expenseClaim.getAmount(),
            expenseClaim.getClaimDate()
        );

        if (isEmployeeOnlyRole()) {
            expenseClaim.setEmployee(inferEmployeeForCurrentUser());
        } else {
            expenseClaim.setEmployee(resolveEmployee(expenseClaim.getEmployee()));
        }

        expenseClaim.setStatus(ExpenseClaim.ClaimStatus.PENDING);
        expenseClaim.setSubmittedBy(getCurrentUsername());
        expenseClaim.setSubmittedAt(LocalDateTime.now());
        expenseClaim.setReviewedBy(null);
        expenseClaim.setReviewedAt(null);
        expenseClaim.setReviewNotes(null);

        normalizeMetadata(expenseClaim);
        return expenseClaimRepository.save(expenseClaim);
    }

    public ExpenseClaim submitClaim(
        Long employeeId,
        String claimType,
        String description,
        BigDecimal amount,
        LocalDate claimDate,
        String notes,
        MultipartFile receipt
    ) {
        assertValidClaim(claimType, description, amount, claimDate);

        ExpenseClaim expenseClaim = new ExpenseClaim();
        expenseClaim.setClaimType(claimType);
        expenseClaim.setDescription(description);
        expenseClaim.setAmount(amount);
        expenseClaim.setClaimDate(claimDate);
        expenseClaim.setNotes(notes);
        expenseClaim.setStatus(ExpenseClaim.ClaimStatus.PENDING);
        expenseClaim.setSubmittedBy(getCurrentUsername());
        expenseClaim.setSubmittedAt(LocalDateTime.now());
        expenseClaim.setEmployee(resolveEmployeeForSubmission(employeeId));

        normalizeMetadata(expenseClaim);

        if (receipt != null && !receipt.isEmpty()) {
            populateReceiptMetadata(expenseClaim, receipt);
            persistReceipt(expenseClaim, receipt);
        }

        return expenseClaimRepository.save(expenseClaim);
    }

    public ExpenseClaim update(Long id, ExpenseClaim expenseClaimDetails) {
        ExpenseClaim expenseClaim = getExpenseClaimById(id);

        if (!canEdit(expenseClaim)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot update this expense claim.");
        }

        assertValidClaim(
            expenseClaimDetails.getClaimType(),
            expenseClaimDetails.getDescription(),
            expenseClaimDetails.getAmount(),
            expenseClaimDetails.getClaimDate()
        );

        expenseClaim.setClaimType(expenseClaimDetails.getClaimType());
        expenseClaim.setDescription(expenseClaimDetails.getDescription());
        expenseClaim.setAmount(expenseClaimDetails.getAmount());
        expenseClaim.setClaimDate(expenseClaimDetails.getClaimDate());
        expenseClaim.setNotes(expenseClaimDetails.getNotes());

        if (isPrivilegedRole()) {
            expenseClaim.setEmployee(resolveEmployee(expenseClaimDetails.getEmployee()));
        }

        normalizeMetadata(expenseClaim);
        return expenseClaimRepository.save(expenseClaim);
    }

    public ExpenseClaim reviewClaim(Long id, ExpenseClaim.ClaimStatus status, String reviewNotes) {
        if (!isPrivilegedRole()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot review expense claims.");
        }

        if (status == null || status == ExpenseClaim.ClaimStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A review status is required.");
        }

        ExpenseClaim expenseClaim = getExpenseClaimById(id);
        expenseClaim.setStatus(status);
        expenseClaim.setReviewedBy(getCurrentUsername());
        expenseClaim.setReviewedAt(LocalDateTime.now());
        expenseClaim.setReviewNotes(normalizeText(reviewNotes));
        normalizeMetadata(expenseClaim);

        ExpenseClaim savedExpenseClaim = expenseClaimRepository.save(expenseClaim);

        if (status == ExpenseClaim.ClaimStatus.APPROVED) {
            syncApprovedClaimReimbursement(savedExpenseClaim);
        } else {
            markReimbursementCancelled(savedExpenseClaim);
        }

        return savedExpenseClaim;
    }

    public ExpenseClaim replaceReceipt(Long id, MultipartFile receipt) {
        ExpenseClaim expenseClaim = getExpenseClaimById(id);

        if (!canEdit(expenseClaim)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot update this receipt.");
        }

        if (receipt == null || receipt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A receipt file is required.");
        }

        deleteStoredReceipt(expenseClaim);
        populateReceiptMetadata(expenseClaim, receipt);
        persistReceipt(expenseClaim, receipt);
        normalizeMetadata(expenseClaim);
        return expenseClaimRepository.save(expenseClaim);
    }

    public ExpenseClaim findAccessibleById(Long id) {
        ExpenseClaim expenseClaim = getExpenseClaimById(id);

        if (!canAccess(expenseClaim, getCurrentUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this expense claim.");
        }

        return expenseClaim;
    }

    public Resource loadReceiptAsResource(Long id) {
        ExpenseClaim expenseClaim = findAccessibleById(id);

        if (expenseClaim.getReceiptFilePath() == null || expenseClaim.getReceiptFilePath().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This expense claim does not have a receipt.");
        }

        Path filePath = resolveStoredPath(expenseClaim.getReceiptFilePath());

        try {
            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receipt file could not be found.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receipt file is not readable.");
            }

            return resource;
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to access the stored receipt.",
                exception
            );
        }
    }

    public void deleteById(Long id) {
        ExpenseClaim expenseClaim = getExpenseClaimById(id);

        if (!canDelete(expenseClaim)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this expense claim.");
        }

        reimbursementRepository.findByExpenseClaim_Id(id).ifPresent(reimbursementRepository::delete);
        deleteStoredReceipt(expenseClaim);
        expenseClaimRepository.delete(expenseClaim);
    }

    private ExpenseClaim getExpenseClaimById(Long id) {
        return expenseClaimRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense claim could not be found.")
        );
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee could not be resolved.")
        );
    }

    private Employee resolveEmployeeForSubmission(Long employeeId) {
        if (isEmployeeOnlyRole()) {
            return inferEmployeeForCurrentUser();
        }

        if (employeeId == null) {
            return null;
        }

        return employeeRepository.findById(employeeId).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee could not be resolved.")
        );
    }

    private Employee inferEmployeeForCurrentUser() {
        String currentUsername = getCurrentUsername();
        String currentDisplayName = userService.findByUsername(currentUsername)
            .map(user -> user.getDisplayName())
            .orElse(currentUsername);

        String normalizedUsername = normalizeLookup(currentUsername);
        String normalizedDisplayName = normalizeLookup(currentDisplayName);

        for (Employee employee : employeeRepository.findAll()) {
            String normalizedEmployeeName = normalizeLookup(employee.getFullName());
            if (
                !normalizedEmployeeName.isEmpty() &&
                (normalizedEmployeeName.equals(normalizedUsername) || normalizedEmployeeName.equals(normalizedDisplayName))
            ) {
                return employee;
            }
        }

        return null;
    }

    private void assertValidClaim(String claimType, String description, BigDecimal amount, LocalDate claimDate) {
        if (normalizeText(claimType) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Claim type is required.");
        }

        if (normalizeText(description) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required.");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero.");
        }

        if (claimDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Claim date is required.");
        }
    }

    private void normalizeMetadata(ExpenseClaim expenseClaim) {
        expenseClaim.setClaimNumber(defaultText(expenseClaim.getClaimNumber(), generateClaimNumber()));
        expenseClaim.setClaimType(defaultText(expenseClaim.getClaimType(), "General"));
        expenseClaim.setDescription(defaultText(expenseClaim.getDescription(), expenseClaim.getClaimType()));
        expenseClaim.setNotes(normalizeText(expenseClaim.getNotes()));
        expenseClaim.setSubmittedBy(defaultText(expenseClaim.getSubmittedBy(), getCurrentUsername()));
        expenseClaim.setSubmittedAt(expenseClaim.getSubmittedAt() == null ? LocalDateTime.now() : expenseClaim.getSubmittedAt());
        expenseClaim.setReceiptOriginalFileName(normalizeText(expenseClaim.getReceiptOriginalFileName()));
        expenseClaim.setReceiptStoredFileName(normalizeText(expenseClaim.getReceiptStoredFileName()));
        expenseClaim.setReceiptFilePath(normalizeText(expenseClaim.getReceiptFilePath()));
        expenseClaim.setReceiptContentType(defaultText(expenseClaim.getReceiptContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE));
        expenseClaim.setReviewNotes(normalizeText(expenseClaim.getReviewNotes()));
        expenseClaim.setStatus(expenseClaim.getStatus() == null ? ExpenseClaim.ClaimStatus.PENDING : expenseClaim.getStatus());
    }

    private void populateReceiptMetadata(ExpenseClaim expenseClaim, MultipartFile receipt) {
        String originalFilename = StringUtils.cleanPath(defaultText(receipt.getOriginalFilename(), "receipt"));
        String extension = extractExtension(originalFilename);
        String storedFileName = expenseClaim.getClaimNumber().toLowerCase() + "-" + UUID.randomUUID().toString() +
            (extension.isEmpty() ? "" : "." + extension);

        expenseClaim.setReceiptOriginalFileName(originalFilename);
        expenseClaim.setReceiptStoredFileName(storedFileName);
        expenseClaim.setReceiptFilePath(storedFileName);
        expenseClaim.setReceiptContentType(defaultText(receipt.getContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE));
    }

    private void persistReceipt(ExpenseClaim expenseClaim, MultipartFile receipt) {
        Path target = resolveStoredPath(expenseClaim.getReceiptFilePath());

        try {
            Files.createDirectories(storageRoot);

            try (InputStream inputStream = receipt.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Receipt could not be stored.",
                exception
            );
        }
    }

    private void deleteStoredReceipt(ExpenseClaim expenseClaim) {
        if (expenseClaim.getReceiptFilePath() == null || expenseClaim.getReceiptFilePath().trim().isEmpty()) {
            return;
        }

        try {
            Files.deleteIfExists(resolveStoredPath(expenseClaim.getReceiptFilePath()));
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "The receipt record was removed but the stored file could not be deleted.",
                exception
            );
        }
    }

    private Path resolveStoredPath(String filePath) {
        return storageRoot.resolve(filePath).normalize();
    }

    private void syncApprovedClaimReimbursement(ExpenseClaim expenseClaim) {
        Reimbursement reimbursement = reimbursementRepository.findByExpenseClaim_Id(expenseClaim.getId()).orElseGet(Reimbursement::new);

        reimbursement.setExpenseClaim(expenseClaim);
        reimbursement.setEmployee(expenseClaim.getEmployee());
        reimbursement.setDescription(defaultText(reimbursement.getDescription(), expenseClaim.getClaimType() + " reimbursement"));
        reimbursement.setAmount(expenseClaim.getAmount());
        reimbursement.setStatus(
            reimbursement.getStatus() == null || reimbursement.getStatus() == Reimbursement.ReimbursementStatus.CANCELLED
                ? Reimbursement.ReimbursementStatus.PENDING
                : reimbursement.getStatus()
        );

        reimbursementRepository.save(reimbursement);
    }

    private void markReimbursementCancelled(ExpenseClaim expenseClaim) {
        reimbursementRepository.findByExpenseClaim_Id(expenseClaim.getId()).ifPresent(reimbursement -> {
            if (reimbursement.getStatus() != Reimbursement.ReimbursementStatus.REIMBURSED) {
                reimbursement.setStatus(Reimbursement.ReimbursementStatus.CANCELLED);
                reimbursement.setProcessedBy(getCurrentUsername());
                reimbursement.setProcessedAt(LocalDateTime.now());
                reimbursementRepository.save(reimbursement);
            }
        });
    }

    private boolean canAccess(ExpenseClaim expenseClaim, String currentUsername) {
        if (expenseClaim == null) {
            return false;
        }

        if (isPrivilegedRole()) {
            return true;
        }

        return currentUsername.equalsIgnoreCase(defaultText(expenseClaim.getSubmittedBy(), ""));
    }

    private boolean canEdit(ExpenseClaim expenseClaim) {
        if (expenseClaim == null) {
            return false;
        }

        if (isPrivilegedRole()) {
            return expenseClaim.getStatus() != ExpenseClaim.ClaimStatus.APPROVED;
        }

        return expenseClaim.getStatus() == ExpenseClaim.ClaimStatus.PENDING &&
            getCurrentUsername().equalsIgnoreCase(defaultText(expenseClaim.getSubmittedBy(), ""));
    }

    private boolean canDelete(ExpenseClaim expenseClaim) {
        if (expenseClaim == null) {
            return false;
        }

        if (isPrivilegedRole()) {
            return true;
        }

        return expenseClaim.getStatus() == ExpenseClaim.ClaimStatus.PENDING &&
            getCurrentUsername().equalsIgnoreCase(defaultText(expenseClaim.getSubmittedBy(), ""));
    }

    private boolean isPrivilegedRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String authorityName = authority.getAuthority();
            if (
                "ROLE_ADMIN".equalsIgnoreCase(authorityName) ||
                "ROLE_HR".equalsIgnoreCase(authorityName) ||
                "ROLE_MANAGER".equalsIgnoreCase(authorityName)
            ) {
                return true;
            }
        }

        return false;
    }

    private boolean isEmployeeOnlyRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || isPrivilegedRole()) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("ROLE_EMPLOYEE".equalsIgnoreCase(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private String defaultText(String value, String defaultValue) {
        String normalizedValue = normalizeText(value);
        return normalizedValue == null ? defaultValue : normalizedValue;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeLookup(String value) {
        String normalized = normalizeText(value);

        if (normalized == null) {
            return "";
        }

        return normalized.toLowerCase().replace('-', ' ').replace('_', ' ').replaceAll("\\s+", " ").trim();
    }

    private String generateClaimNumber() {
        return "EXP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private String extractExtension(String fileName) {
        if (fileName == null) {
            return "";
        }

        int extensionSeparator = fileName.lastIndexOf('.');
        if (extensionSeparator < 0 || extensionSeparator == fileName.length() - 1) {
            return "";
        }

        return fileName.substring(extensionSeparator + 1);
    }
}
