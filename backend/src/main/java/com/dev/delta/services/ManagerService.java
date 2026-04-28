package com.dev.delta.services;

import com.dev.delta.entities.Manager;
import com.dev.delta.repositories.ManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ManagerService {
    @Autowired
    private ManagerRepository managerRepository;

    public List<Manager> findAll() {
        return managerRepository.findAll();
    }

    public Optional<Manager> findById(Long id) {
        return managerRepository.findById(id);
    }

    public Manager save(Manager manager) {
        return managerRepository.save(manager);
    }

    public void deleteById(Long id) {
        managerRepository.deleteById(id);
    }
}
