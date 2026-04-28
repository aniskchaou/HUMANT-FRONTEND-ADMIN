package com.dev.delta.services;

import com.dev.delta.entities.LearningMaterial;
import com.dev.delta.repositories.LearningMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LearningMaterialService {
    @Autowired
    private LearningMaterialRepository learningMaterialRepository;

    public List<LearningMaterial> findAll() {
        return learningMaterialRepository.findAll();
    }

    public Optional<LearningMaterial> findById(Long id) {
        return learningMaterialRepository.findById(id);
    }

    public LearningMaterial save(LearningMaterial learningMaterial) {
        return learningMaterialRepository.save(learningMaterial);
    }

    public void deleteById(Long id) {
        learningMaterialRepository.deleteById(id);
    }
}
