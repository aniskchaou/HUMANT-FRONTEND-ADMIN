package com.dev.delta.services;

import com.dev.delta.entities.Policy;
import com.dev.delta.repositories.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PolicyService {
    @Autowired
    private PolicyRepository policyRepository;

    public List<Policy> findAll() {
        return policyRepository.findAll();
    }

    public Optional<Policy> findById(Long id) {
        return policyRepository.findById(id);
    }

    public Policy save(Policy policy) {
        return policyRepository.save(policy);
    }

    public Policy update(Long id, Policy policyDetails) {
        Policy policy = policyRepository.findById(id).orElseThrow();
        policy.setTitle(policyDetails.getTitle());
        policy.setDescription(policyDetails.getDescription());
        policy.setEffectiveDate(policyDetails.getEffectiveDate());
        policy.setExpiryDate(policyDetails.getExpiryDate());
        policy.setDocumentPath(policyDetails.getDocumentPath());
        return policyRepository.save(policy);
    }

    public void deleteById(Long id) {
        policyRepository.deleteById(id);
    }
}
