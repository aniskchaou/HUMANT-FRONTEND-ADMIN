package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Position;

public interface PositionRepository extends JpaRepository<Position, Long> {

}
