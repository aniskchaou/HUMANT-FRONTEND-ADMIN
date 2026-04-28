package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Training;

public interface TrainingRepository extends JpaRepository<Training, Long> {

}
