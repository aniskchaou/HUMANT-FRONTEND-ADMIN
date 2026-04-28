package com.dev.delta.services;

import com.dev.delta.entities.JobPosition;
import com.dev.delta.repositories.JobPositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobPositionService {
    @Autowired
    private JobPositionRepository jobPositionRepository;

    public List<JobPosition> findAll() {
        return jobPositionRepository.findAll();
    }

    public Optional<JobPosition> findById(Long id) {
        return jobPositionRepository.findById(id);
    }

    public JobPosition save(JobPosition jobPosition) {
        return jobPositionRepository.save(jobPosition);
    }

    public void deleteById(Long id) {
        jobPositionRepository.deleteById(id);
    }
}
