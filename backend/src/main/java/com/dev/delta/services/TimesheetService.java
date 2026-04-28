package com.dev.delta.services;

import com.dev.delta.entities.Timesheet;
import com.dev.delta.repositories.TimesheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimesheetService {
    @Autowired
    private TimesheetRepository timesheetRepository;

    public List<Timesheet> findAll() {
        return timesheetRepository.findAll();
    }

    public Optional<Timesheet> findById(Long id) {
        return timesheetRepository.findById(id);
    }

    public Timesheet save(Timesheet timesheet) {
        return timesheetRepository.save(timesheet);
    }

    public void deleteById(Long id) {
        timesheetRepository.deleteById(id);
    }
}
