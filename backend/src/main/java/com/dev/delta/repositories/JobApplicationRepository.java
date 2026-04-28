package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

}
