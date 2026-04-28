package com.dev.delta.services;

import com.dev.delta.entities.Shift;
import com.dev.delta.repositories.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShiftService {
    @Autowired
    private ShiftRepository shiftRepository;

    public List<Shift> findAll() {
        return shiftRepository.findAll();
    }

    public Optional<Shift> findById(Long id) {
        return shiftRepository.findById(id);
    }

    public Shift save(Shift shift) {
        return shiftRepository.save(shift);
    }

    public void deleteById(Long id) {
        shiftRepository.deleteById(id);
    }
}
