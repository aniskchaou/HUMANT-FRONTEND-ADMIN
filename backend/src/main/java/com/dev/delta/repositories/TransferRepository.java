package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Transfer;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

}
