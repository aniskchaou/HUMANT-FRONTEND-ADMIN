package com.dev.delta.repositories;

import com.dev.delta.entities.FinalSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinalSettlementRepository extends JpaRepository<FinalSettlement, Long> {
    List<FinalSettlement> findAllByEmployeeIdOrderBySettlementDateDescIdDesc(Long employeeId);
}
