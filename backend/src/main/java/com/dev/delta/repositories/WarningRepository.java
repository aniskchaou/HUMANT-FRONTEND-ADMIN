package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Warning;

public interface WarningRepository extends JpaRepository<Warning, Long> {

}
