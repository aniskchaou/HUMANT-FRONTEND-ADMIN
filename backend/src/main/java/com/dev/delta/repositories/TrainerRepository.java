package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Trainer;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {

}
