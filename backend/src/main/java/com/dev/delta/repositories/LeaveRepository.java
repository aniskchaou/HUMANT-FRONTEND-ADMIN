package com.dev.delta.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Leave;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
	List<Leave> findAllByEmployeeId(Long employeeId);

}
