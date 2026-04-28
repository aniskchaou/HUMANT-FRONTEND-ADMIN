package com.dev.delta.services;

import com.dev.delta.entities.TrainingSession;
import com.dev.delta.repositories.TrainingSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrainingSessionService {
    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    public List<TrainingSession> findAll() {
        return trainingSessionRepository.findAll();
    }

    public Optional<TrainingSession> findById(Long id) {
        return trainingSessionRepository.findById(id);
    }

    public TrainingSession save(TrainingSession trainingSession) {
        return trainingSessionRepository.save(trainingSession);
    }

    public void deleteById(Long id) {
        trainingSessionRepository.deleteById(id);
    }
}
