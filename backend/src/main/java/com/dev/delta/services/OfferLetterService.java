package com.dev.delta.services;

import com.dev.delta.entities.OfferLetter;
import com.dev.delta.repositories.OfferLetterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OfferLetterService {
    @Autowired
    private OfferLetterRepository offerLetterRepository;

    public List<OfferLetter> findAll() {
        return offerLetterRepository.findAll();
    }

    public Optional<OfferLetter> findById(Long id) {
        return offerLetterRepository.findById(id);
    }

    public OfferLetter save(OfferLetter offerLetter) {
        return offerLetterRepository.save(offerLetter);
    }

    public void deleteById(Long id) {
        offerLetterRepository.deleteById(id);
    }
}
