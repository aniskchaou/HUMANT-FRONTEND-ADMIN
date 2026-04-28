package com.dev.delta.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
	Optional<Employee> findFirstByFullNameIgnoreCase(String fullName);

	List<Employee> findAllByOrderByFullNameAsc();

}
