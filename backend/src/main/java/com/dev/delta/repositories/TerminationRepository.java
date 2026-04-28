package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Termination;

public interface TerminationRepository extends JpaRepository<Termination, Long> {

}
