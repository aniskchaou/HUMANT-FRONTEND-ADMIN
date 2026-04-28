package com.dev.delta.services;

import com.dev.delta.entities.Company;
import com.dev.delta.repositories.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private static final String DEFAULT_COMPANY_CODE = "humant-hq";

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Company> getCompanies() {
        return companyRepository.findAllByOrderByNameAsc();
    }

    public Company getCompany(Long id) {
        return companyRepository.findById(id).orElseThrow();
    }

    public Company getDefaultCompany() {
        return companyRepository.findFirstByDefaultCompanyTrueOrderByIdAsc()
            .orElseGet(this::ensureDefaultCompany);
    }

    public Company createCompany(Company companyDetails) {
        Company company = normalize(companyDetails, new Company());
        Company savedCompany = persistCompany(company);
        auditLogService.logCurrentUserAction(
            "CREATE",
            "COMPANY",
            savedCompany.getId() != null ? savedCompany.getId().toString() : savedCompany.getCode(),
            "Created company " + savedCompany.getName() + ".",
            "Company code: " + savedCompany.getCode()
        );
        return savedCompany;
    }

    public Company updateCompany(Long id, Company companyDetails) {
        Company company = companyRepository.findById(id).orElseThrow();
        Company savedCompany = persistCompany(normalize(companyDetails, company));
        auditLogService.logCurrentUserAction(
            "UPDATE",
            "COMPANY",
            savedCompany.getId() != null ? savedCompany.getId().toString() : savedCompany.getCode(),
            "Updated company " + savedCompany.getName() + ".",
            "Default company: " + savedCompany.getDefaultCompany()
        );
        return savedCompany;
    }

    public Company ensureDefaultCompany() {
        Company company = companyRepository.findByCodeIgnoreCase(DEFAULT_COMPANY_CODE)
            .orElseGet(this::buildDefaultCompany);

        company.setDefaultCompany(Boolean.TRUE);
        company.setActive(defaultBoolean(company.getActive(), Boolean.TRUE));
        company.setName(defaultText(company.getName(), "Humant HR Workspace"));
        company.setEmail(defaultText(company.getEmail(), "operations@humant.local"));
        company.setAddress(defaultText(company.getAddress(), "Head office administration floor"));
        company.setCurrency(defaultText(company.getCurrency(), "USD"));
        company.setTimezone(defaultText(company.getTimezone(), "UTC"));

        Company savedCompany = persistCompany(company);
        enforceSingleDefault(savedCompany);
        return savedCompany;
    }

    private Company persistCompany(Company company) {
        if (Boolean.TRUE.equals(company.getDefaultCompany())) {
            enforceSingleDefault(company);
        }

        return companyRepository.save(company);
    }

    private void enforceSingleDefault(Company preferredCompany) {
        for (Company existingCompany : companyRepository.findAll()) {
            boolean shouldBeDefault = existingCompany.getId() != null
                && existingCompany.getId().equals(preferredCompany.getId());

            if (preferredCompany.getId() == null && existingCompany.getCode() != null && preferredCompany.getCode() != null) {
                shouldBeDefault = existingCompany.getCode().equalsIgnoreCase(preferredCompany.getCode());
            }

            if (existingCompany.getDefaultCompany() == shouldBeDefault) {
                continue;
            }

            existingCompany.setDefaultCompany(shouldBeDefault);
            companyRepository.save(existingCompany);
        }
    }

    private Company normalize(Company source, Company target) {
        target.setCode(defaultText(source.getCode(), target.getCode()));
        target.setName(defaultText(source.getName(), target.getName()));
        target.setEmail(defaultText(source.getEmail(), target.getEmail()));
        target.setAddress(defaultText(source.getAddress(), target.getAddress()));
        target.setCurrency(defaultText(source.getCurrency(), target.getCurrency()));
        target.setTimezone(defaultText(source.getTimezone(), target.getTimezone()));
        target.setActive(defaultBoolean(source.getActive(), target.getActive()));
        target.setDefaultCompany(defaultBoolean(source.getDefaultCompany(), target.getDefaultCompany()));

        if (target.getCode() == null || target.getCode().trim().isEmpty()) {
            target.setCode(DEFAULT_COMPANY_CODE);
        }

        if (target.getName() == null || target.getName().trim().isEmpty()) {
            target.setName("Humant HR Workspace");
        }

        if (target.getActive() == null) {
            target.setActive(Boolean.TRUE);
        }

        if (target.getDefaultCompany() == null) {
            target.setDefaultCompany(Boolean.FALSE);
        }

        return target;
    }

    private Company buildDefaultCompany() {
        Company company = new Company();
        company.setCode(DEFAULT_COMPANY_CODE);
        company.setName("Humant HR Workspace");
        company.setEmail("operations@humant.local");
        company.setAddress("Head office administration floor");
        company.setCurrency("USD");
        company.setTimezone("UTC");
        company.setActive(Boolean.TRUE);
        company.setDefaultCompany(Boolean.TRUE);
        return company;
    }

    private Boolean defaultBoolean(Boolean value, Boolean fallback) {
        return value != null ? value : fallback;
    }

    private String defaultText(String value, String fallback) {
        String normalizedValue = value != null ? value.trim() : "";
        return normalizedValue.isEmpty() ? fallback : normalizedValue;
    }
}