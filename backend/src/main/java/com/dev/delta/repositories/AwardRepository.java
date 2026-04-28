package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Award;

public interface AwardRepository extends JpaRepository<Award, Long> {

}
