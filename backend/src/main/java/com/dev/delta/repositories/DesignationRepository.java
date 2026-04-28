package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Designation;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
}