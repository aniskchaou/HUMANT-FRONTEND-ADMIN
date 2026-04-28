package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Job;

public interface JobRepository extends JpaRepository<Job, Long> {

}
