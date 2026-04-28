package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Contract;

public interface ContractRepository extends JpaRepository<Contract, Long> {

}
