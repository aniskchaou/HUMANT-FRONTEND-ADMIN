package com.dev.delta.services;

import com.dev.delta.entities.WorkSchedule;
import com.dev.delta.repositories.WorkScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkScheduleService {
    @Autowired
    private WorkScheduleRepository workScheduleRepository;

    public List<WorkSchedule> findAll() {
        return workScheduleRepository.findAll();
    }

    public Optional<WorkSchedule> findById(Long id) {
        return workScheduleRepository.findById(id);
    }

    public WorkSchedule save(WorkSchedule workSchedule) {
        return workScheduleRepository.save(workSchedule);
    }

    public void deleteById(Long id) {
        workScheduleRepository.deleteById(id);
    }
}
