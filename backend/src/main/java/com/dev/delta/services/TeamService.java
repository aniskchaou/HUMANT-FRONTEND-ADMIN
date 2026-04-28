package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Team;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TeamService {
    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    public Optional<Team> findById(Long id) {
        return teamRepository.findById(id);
    }

    public Team save(Team team) {
        team.setManager(resolveEmployee(team.getManager()));
        team.setMembers(resolveEmployees(team.getMembers()));
        return teamRepository.save(team);
    }

    public void deleteById(Long id) {
        teamRepository.deleteById(id);
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    private List<Employee> resolveEmployees(List<Employee> employees) {
        if (employees == null) {
            return Collections.emptyList();
        }

        List<Employee> resolvedEmployees = new ArrayList<>();
        Set<Long> seenIds = new HashSet<>();

        for (Employee employee : employees) {
            if (employee == null || employee.getId() == null || !seenIds.add(employee.getId())) {
                continue;
            }

            resolvedEmployees.add(employeeRepository.findById(employee.getId()).orElseThrow());
        }

        return resolvedEmployees;
    }
}
