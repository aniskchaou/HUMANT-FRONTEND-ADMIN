package com.dev.delta.controllers;

import com.dev.delta.entities.Company;
import com.dev.delta.services.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@Tag(name = "Companies", description = "Multi-company configuration APIs")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Operation(summary = "Get all companies")
    @GetMapping
    public ResponseEntity<List<Company>> getCompanies() {
        return ResponseEntity.ok(companyService.getCompanies());
    }

    @Operation(summary = "Get a company by id")
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompany(id));
    }

    @Operation(summary = "Create a company")
    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Company companyDetails) {
        return ResponseEntity.ok(companyService.createCompany(companyDetails));
    }

    @Operation(summary = "Update a company")
    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company companyDetails) {
        return ResponseEntity.ok(companyService.updateCompany(id, companyDetails));
    }
}