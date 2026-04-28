package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Resignation;

import java.util.List;

public interface ResignationRepository extends JpaRepository<Resignation, Long>{
	List<Resignation> findAllByEmployeeNameIdOrderByResignationDateDescIdDesc(Long employeeId);

}
