package com.dev.delta.services;

import com.dev.delta.entities.Certification;
import com.dev.delta.repositories.CertificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CertificationService {
    @Autowired
    private CertificationRepository certificationRepository;

    public List<Certification> findAll() {
        return certificationRepository.findAll();
    }

    public Optional<Certification> findById(Long id) {
        return certificationRepository.findById(id);
    }

    public Certification save(Certification certification) {
        return certificationRepository.save(certification);
    }

    public void deleteById(Long id) {
        certificationRepository.deleteById(id);
    }
}
