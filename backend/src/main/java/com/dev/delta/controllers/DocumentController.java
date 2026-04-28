
package com.dev.delta.controllers;


import com.dev.delta.entities.Document;
import com.dev.delta.services.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin
@Tag(name = "Document", description = "Document management APIs")
public class DocumentController {
    @Autowired
    private DocumentService documentService;

    @Operation(summary = "Get all documents")
    @GetMapping
    public List<Document> getAllDocuments() {
        return documentService.findAll();
    }

    @Operation(summary = "Get document by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        Optional<Document> document = documentService.findById(id);
        return document.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new document")
    @PostMapping
    public Document createDocument(@RequestBody Document document) {
        return documentService.save(document);
    }

    @Operation(summary = "Upload and store a new employee document")
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
        @RequestParam("employeeId") Long employeeId,
        @RequestParam("documentName") String documentName,
        @RequestParam(value = "documentCategory", required = false) String documentCategory,
        @RequestParam(value = "accessLevel", required = false) String accessLevel,
        @RequestParam(value = "notes", required = false) String notes,
        @RequestParam(value = "versionGroup", required = false) String versionGroup,
        @RequestParam("file") MultipartFile file
    ) {
        Document createdDocument = documentService.uploadDocument(
            employeeId,
            documentName,
            documentCategory,
            accessLevel,
            notes,
            versionGroup,
            file
        );
        return new ResponseEntity<Document>(createdDocument, HttpStatus.CREATED);
    }

    @Operation(summary = "Upload a new version of an existing document")
    @PostMapping("/{id}/versions")
    public ResponseEntity<Document> uploadDocumentVersion(
        @PathVariable Long id,
        @RequestParam(value = "documentName", required = false) String documentName,
        @RequestParam(value = "documentCategory", required = false) String documentCategory,
        @RequestParam(value = "accessLevel", required = false) String accessLevel,
        @RequestParam(value = "notes", required = false) String notes,
        @RequestParam("file") MultipartFile file
    ) {
        Document createdDocument = documentService.uploadNewVersion(
            id,
            documentName,
            documentCategory,
            accessLevel,
            notes,
            file
        );
        return new ResponseEntity<Document>(createdDocument, HttpStatus.CREATED);
    }

    @Operation(summary = "Update document by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody Document documentDetails) {
        Optional<Document> documentOptional = documentService.findById(id);
        if (!documentOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

		Document updated = documentService.update(id, documentDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Download a stored document by ID")
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Document document = documentService.findAccessibleById(id);
        Resource resource = documentService.loadAsResource(id);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (document.getContentType() != null && !document.getContentType().trim().isEmpty()) {
            mediaType = MediaType.parseMediaType(document.getContentType());
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + document.getOriginalFileName() + "\""
            )
            .body(resource);
    }

    @Operation(summary = "Delete document by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        if (!documentService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        documentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
