package com.dev.delta.repositories;

import com.dev.delta.entities.Clearance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClearanceRepository extends JpaRepository<Clearance, Long> {
    List<Clearance> findAllByEmployeeIdOrderByClearanceDateDescIdDesc(Long employeeId);
}
