package com.dev.delta.services;

import com.dev.delta.entities.Document;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.DocumentRepository;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {
    private static final String CATEGORY_OFFER_LETTER = "OFFER_LETTER";
    private static final String CATEGORY_CONTRACT = "CONTRACT";
    private static final String CATEGORY_ID = "ID";
    private static final String CATEGORY_CERTIFICATE = "CERTIFICATE";
    private static final String CATEGORY_OTHER = "OTHER";

    private static final String ACCESS_ADMIN_ONLY = "ADMIN_ONLY";
    private static final String ACCESS_EMPLOYEE_AND_ADMIN = "EMPLOYEE_AND_ADMIN";

    private final Path storageRoot = Paths.get("storage", "employee-documents").toAbsolutePath().normalize();

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Document> findAll() {
        List<Document> documents = documentRepository.findAllByOrderByUploadedAtDescIdDesc();
        List<Document> accessibleDocuments = new ArrayList<>();

        for (Document document : documents) {
            if (canAccess(document)) {
                accessibleDocuments.add(document);
            }
        }

        return accessibleDocuments;
    }

    public Optional<Document> findById(Long id) {
        Optional<Document> document = documentRepository.findById(id);

        if (!document.isPresent() || !canAccess(document.get())) {
            return Optional.empty();
        }

        return document;
    }

    public Document save(Document document) {
        document.setEmployee(resolveEmployee(document.getEmployee()));
        normalizeMetadata(document);
        return documentRepository.save(document);
    }

    public Document update(Long id, Document documentDetails) {
        Document document = getDocumentById(id);

        document.setEmployee(resolveEmployee(documentDetails.getEmployee()));
        document.setDocumentName(defaultText(documentDetails.getDocumentName(), document.getDocumentName()));
        document.setDocumentCategory(defaultText(documentDetails.getDocumentCategory(), document.getDocumentCategory()));
        document.setAccessLevel(defaultText(documentDetails.getAccessLevel(), document.getAccessLevel()));
        document.setNotes(documentDetails.getNotes());
        document.setLastModifiedAt(LocalDateTime.now());

        normalizeMetadata(document);
        return documentRepository.save(document);
    }

    public Document uploadDocument(
        Long employeeId,
        String documentName,
        String documentCategory,
        String accessLevel,
        String notes,
        String versionGroup,
        MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A file is required.");
        }

        Employee employee = resolveEmployeeById(employeeId);
        String normalizedDocumentName = defaultText(documentName, "Employee document");
        String normalizedCategory = normalizeCategory(documentCategory);
        String normalizedAccessLevel = normalizeAccessLevel(accessLevel);
        String normalizedVersionGroup = resolveVersionGroup(employeeId, normalizedCategory, versionGroup, normalizedDocumentName);

        markExistingVersionsAsArchived(normalizedVersionGroup);

        Document document = new Document();
        document.setEmployee(employee);
        document.setDocumentName(normalizedDocumentName);
        document.setDocumentCategory(normalizedCategory);
        document.setAccessLevel(normalizedAccessLevel);
        document.setNotes(normalizeText(notes));
        document.setVersionGroup(normalizedVersionGroup);
        document.setVersionNumber(resolveNextVersion(normalizedVersionGroup));
        document.setActiveVersion(Boolean.TRUE);
        document.setUploadedAt(LocalDateTime.now());
        document.setLastModifiedAt(LocalDateTime.now());
        document.setUploadedBy(getCurrentUsername());

        populateFileMetadata(document, file);
        persistFile(document, file);
        normalizeMetadata(document);
        return documentRepository.save(document);
    }

    public Document uploadNewVersion(
        Long documentId,
        String documentName,
        String documentCategory,
        String accessLevel,
        String notes,
        MultipartFile file
    ) {
        Document sourceDocument = getDocumentById(documentId);

        return uploadDocument(
            sourceDocument.getEmployee() != null ? sourceDocument.getEmployee().getId() : null,
            defaultText(documentName, sourceDocument.getDocumentName()),
            defaultText(documentCategory, sourceDocument.getDocumentCategory()),
            defaultText(accessLevel, sourceDocument.getAccessLevel()),
            defaultText(notes, sourceDocument.getNotes()),
            sourceDocument.getVersionGroup(),
            file
        );
    }

    public Document findAccessibleById(Long id) {
        Document document = getDocumentById(id);

        if (!canAccess(document)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this document.");
        }

        return document;
    }

    public Resource loadAsResource(Long id) {
        Document document = findAccessibleById(id);
        Path filePath = resolveStoredPath(document.getFilePath());

        try {
            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file could not be found.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file is not readable.");
            }

            return resource;
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to access the stored document.",
                exception
            );
        }
    }

    public void deleteById(Long id) {
        Document document = getDocumentById(id);
        String versionGroup = document.getVersionGroup();
        Path filePath = resolveStoredPath(document.getFilePath());

        documentRepository.delete(document);

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "The document record was removed but the stored file could not be deleted.",
                exception
            );
        }

        restoreLatestVersionMarker(versionGroup);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee could not be resolved.")
        );
    }

    private Employee resolveEmployeeById(Long employeeId) {
        if (employeeId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee is required.");
        }

        return employeeRepository.findById(employeeId).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee could not be resolved.")
        );
    }

    private Document getDocumentById(Long id) {
        return documentRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Document could not be found.")
        );
    }

    private void normalizeMetadata(Document document) {
        document.setDocumentName(defaultText(document.getDocumentName(), "Employee document"));
        document.setDocumentCategory(normalizeCategory(document.getDocumentCategory()));
        document.setAccessLevel(normalizeAccessLevel(document.getAccessLevel()));
        document.setNotes(normalizeText(document.getNotes()));
        document.setDocumentType(defaultText(document.getDocumentType(), "FILE"));
        document.setVersionGroup(defaultText(document.getVersionGroup(), buildVersionGroup(document)));
        document.setVersionNumber(document.getVersionNumber() == null || document.getVersionNumber() < 1 ? 1 : document.getVersionNumber());
        document.setActiveVersion(document.getActiveVersion() == null ? Boolean.TRUE : document.getActiveVersion());
        document.setUploadedBy(defaultText(document.getUploadedBy(), getCurrentUsername()));
        document.setUploadedAt(document.getUploadedAt() == null ? LocalDateTime.now() : document.getUploadedAt());
        document.setLastModifiedAt(document.getLastModifiedAt() == null ? document.getUploadedAt() : document.getLastModifiedAt());
        document.setOriginalFileName(defaultText(document.getOriginalFileName(), document.getDocumentName()));
        document.setStoredFileName(defaultText(document.getStoredFileName(), document.getOriginalFileName()));
        document.setContentType(defaultText(document.getContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE));
    }

    private void populateFileMetadata(Document document, MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(defaultText(file.getOriginalFilename(), document.getDocumentName()));
        String safeFilename = sanitizeForPath(originalFilename);
        String extension = extractExtension(originalFilename);
        String storedFileName = "v" + document.getVersionNumber() + "-" + UUID.randomUUID().toString() +
            (extension.isEmpty() ? "" : "." + extension);

        document.setOriginalFileName(originalFilename);
        document.setStoredFileName(storedFileName);
        document.setDocumentType(extension.isEmpty() ? "FILE" : extension.toUpperCase());
        document.setContentType(defaultText(file.getContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE));
        document.setFileSize(file.getSize());
        document.setFilePath(buildRelativeFilePath(document, storedFileName, safeFilename));
    }

    private void persistFile(Document document, MultipartFile file) {
        ensureStorageRootExists();
        Path targetPath = resolveStoredPath(document.getFilePath());

        try {
            Files.createDirectories(targetPath.getParent());
            InputStream inputStream = file.getInputStream();
            try {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            } finally {
                inputStream.close();
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to store the uploaded document.",
                exception
            );
        }
    }

    private void markExistingVersionsAsArchived(String versionGroup) {
        List<Document> documents = documentRepository.findAllByVersionGroupOrderByVersionNumberDesc(versionGroup);

        for (Document document : documents) {
            if (Boolean.TRUE.equals(document.getActiveVersion())) {
                document.setActiveVersion(Boolean.FALSE);
                document.setLastModifiedAt(LocalDateTime.now());
                documentRepository.save(document);
            }
        }
    }

    private void restoreLatestVersionMarker(String versionGroup) {
        if (!StringUtils.hasText(versionGroup)) {
            return;
        }

        List<Document> documents = documentRepository.findAllByVersionGroupOrderByVersionNumberDesc(versionGroup);
        boolean markedActive = false;

        for (Document document : documents) {
            boolean shouldBeActive = !markedActive;
            document.setActiveVersion(shouldBeActive);
            document.setLastModifiedAt(LocalDateTime.now());
            documentRepository.save(document);
            markedActive = true;
        }
    }

    private int resolveNextVersion(String versionGroup) {
        Optional<Document> latestDocument = documentRepository.findTopByVersionGroupOrderByVersionNumberDesc(versionGroup);
        return latestDocument.map(document -> Math.max(document.getVersionNumber(), 0) + 1).orElse(1);
    }

    private String buildRelativeFilePath(Document document, String storedFileName, String safeFilename) {
        String employeeSegment = document.getEmployee() != null && document.getEmployee().getId() != null
            ? "employee-" + document.getEmployee().getId()
            : "employee-unassigned";
        String groupSegment = sanitizeForPath(document.getVersionGroup());
        String nameSegment = safeFilename.isEmpty() ? sanitizeForPath(document.getDocumentName()) : safeFilename;
        return employeeSegment + "/" + sanitizeForPath(document.getDocumentCategory()) + "/" + groupSegment + "/" + nameSegment + "/" + storedFileName;
    }

    private String buildVersionGroup(Document document) {
        Long employeeId = document.getEmployee() != null ? document.getEmployee().getId() : null;
        return resolveVersionGroup(employeeId, document.getDocumentCategory(), null, document.getDocumentName());
    }

    private String resolveVersionGroup(Long employeeId, String documentCategory, String explicitVersionGroup, String documentName) {
        String normalizedExplicitGroup = normalizeText(explicitVersionGroup);
        if (!normalizedExplicitGroup.isEmpty()) {
            return sanitizeForPath(normalizedExplicitGroup);
        }

        String employeeSegment = employeeId == null ? "employee-unassigned" : "employee-" + employeeId;
        return employeeSegment + "-" + sanitizeForPath(documentCategory) + "-" + sanitizeForPath(documentName);
    }

    private Path resolveStoredPath(String relativeFilePath) {
        ensureStorageRootExists();
        return storageRoot.resolve(defaultText(relativeFilePath, "")).normalize();
    }

    private void ensureStorageRootExists() {
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to prepare document storage.",
                exception
            );
        }
    }

    private boolean canAccess(Document document) {
        if (document == null) {
            return false;
        }

        if (isAdmin()) {
            return true;
        }

        return !ACCESS_ADMIN_ONLY.equalsIgnoreCase(normalizeAccessLevel(document.getAccessLevel()));
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String value = authority.getAuthority();
            if (value != null && value.toLowerCase().contains("admin")) {
                return true;
            }
        }

        return false;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            return "system";
        }

        return authentication.getName();
    }

    private String normalizeCategory(String value) {
        String normalizedValue = normalizeText(value).toUpperCase();

        if (normalizedValue.contains("OFFER")) {
            return CATEGORY_OFFER_LETTER;
        }

        if (normalizedValue.startsWith("CONTRACT")) {
            return CATEGORY_CONTRACT;
        }

        if (normalizedValue.equals("ID") || normalizedValue.equals("IDS") || normalizedValue.startsWith("IDENT")) {
            return CATEGORY_ID;
        }

        if (normalizedValue.startsWith("CERT")) {
            return CATEGORY_CERTIFICATE;
        }

        return CATEGORY_OTHER;
    }

    private String normalizeAccessLevel(String value) {
        String normalizedValue = normalizeText(value).toUpperCase();

        if (normalizedValue.contains("EMPLOYEE") || normalizedValue.contains("SHARED")) {
            return ACCESS_EMPLOYEE_AND_ADMIN;
        }

        return ACCESS_ADMIN_ONLY;
    }

    private String extractExtension(String filename) {
        String normalizedFilename = normalizeText(filename);
        int separatorIndex = normalizedFilename.lastIndexOf('.');

        if (separatorIndex < 0 || separatorIndex == normalizedFilename.length() - 1) {
            return "";
        }

        return sanitizeForPath(normalizedFilename.substring(separatorIndex + 1));
    }

    private String sanitizeForPath(String value) {
        String normalizedValue = normalizeText(value).toLowerCase();
        String sanitizedValue = normalizedValue.replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return sanitizedValue.isEmpty() ? "document" : sanitizedValue;
    }

    private String defaultText(String value, String defaultValue) {
        String normalizedValue = normalizeText(value);
        return normalizedValue.isEmpty() ? defaultValue : normalizedValue;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}
