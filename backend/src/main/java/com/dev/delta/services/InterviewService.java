package com.dev.delta.services;

import com.dev.delta.entities.Interview;
import com.dev.delta.repositories.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {
    @Autowired
    private InterviewRepository interviewRepository;

    public List<Interview> findAll() {
        return interviewRepository.findAll();
    }

    public Optional<Interview> findById(Long id) {
        return interviewRepository.findById(id);
    }

    public Interview save(Interview interview) {
        return interviewRepository.save(interview);
    }

    public void deleteById(Long id) {
        interviewRepository.deleteById(id);
    }
}
