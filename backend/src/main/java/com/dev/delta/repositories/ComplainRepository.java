package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Complain;

public interface ComplainRepository extends JpaRepository<Complain, Long> {

}
