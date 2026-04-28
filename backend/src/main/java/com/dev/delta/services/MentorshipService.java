package com.dev.delta.services;

import com.dev.delta.entities.Mentorship;
import com.dev.delta.repositories.MentorshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MentorshipService {
    @Autowired
    private MentorshipRepository mentorshipRepository;

    public List<Mentorship> findAll() {
        return mentorshipRepository.findAll();
    }

    public Optional<Mentorship> findById(Long id) {
        return mentorshipRepository.findById(id);
    }

    public Mentorship save(Mentorship mentorship) {
        return mentorshipRepository.save(mentorship);
    }

    public void deleteById(Long id) {
        mentorshipRepository.deleteById(id);
    }
}
