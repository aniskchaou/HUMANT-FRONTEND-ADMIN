package com.dev.delta.services;

import com.dev.delta.entities.Visa;
import com.dev.delta.repositories.VisaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisaService {
    @Autowired
    private VisaRepository visaRepository;

    public List<Visa> findAll() {
        return visaRepository.findAll();
    }

    public Optional<Visa> findById(Long id) {
        return visaRepository.findById(id);
    }

    public Visa save(Visa visa) {
        return visaRepository.save(visa);
    }

    public void deleteById(Long id) {
        visaRepository.deleteById(id);
    }
}
