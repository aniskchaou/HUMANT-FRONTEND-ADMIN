package com.dev.delta.services;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.User;
import com.dev.delta.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class EmployeeContextService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserService userService;

    public Optional<Employee> findCurrentEmployee() {
        String currentUsername = getCurrentUsername();

        if (normalizeText(currentUsername).isEmpty()) {
            return Optional.empty();
        }

        Optional<User> currentUser = userService.findByUsername(currentUsername);
        String displayName = currentUser.map(User::getDisplayName).orElse(currentUsername);

        Employee matchedByDisplayName = findByCandidate(displayName).orElse(null);
        if (matchedByDisplayName != null) {
            return Optional.of(matchedByDisplayName);
        }

        return findByCandidate(currentUsername);
    }

    public Employee getCurrentEmployeeOrThrow() {
        return findCurrentEmployee().orElseThrow(() ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No employee profile is linked to the current signed-in account."
            )
        );
    }

    public boolean isEmployeeOnlyRole() {
        return hasRole("ROLE_EMPLOYEE") && !isPrivilegedRole();
    }

    public boolean isPrivilegedRole() {
        return hasRole("ROLE_ADMIN") || hasRole("ROLE_HR") || hasRole("ROLE_MANAGER");
    }

    public boolean canAccessEmployee(Employee employee) {
        if (employee == null) {
            return false;
        }

        if (isPrivilegedRole()) {
            return true;
        }

        Optional<Employee> currentEmployee = findCurrentEmployee();
        return currentEmployee.isPresent() && currentEmployee.get().getId().equals(employee.getId());
    }

    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "";
    }

    private Optional<Employee> findByCandidate(String candidate) {
        String normalizedCandidate = normalizeCandidate(candidate);

        if (normalizedCandidate.isEmpty()) {
            return Optional.empty();
        }

        for (Employee employee : employeeRepository.findAllByOrderByFullNameAsc()) {
            if (normalizeCandidate(employee.getFullName()).equals(normalizedCandidate)) {
                return Optional.of(employee);
            }
        }

        return Optional.empty();
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (role.equalsIgnoreCase(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }

    public boolean hasAnyRole(String... roles) {
        for (String role : roles) {
            if (hasRole(role)) {
                return true;
            }
        }

        return false;
    }

    private String normalizeCandidate(String value) {
        return normalizeText(value)
            .toLowerCase()
            .replace('-', ' ')
            .replace('_', ' ')
            .replaceAll("\\s+", " ")
            .trim();
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}