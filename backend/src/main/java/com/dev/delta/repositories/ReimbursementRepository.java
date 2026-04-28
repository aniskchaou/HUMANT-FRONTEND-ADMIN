package com.dev.delta.repositories;

import com.dev.delta.entities.Reimbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReimbursementRepository extends JpaRepository<Reimbursement, Long> {
    List<Reimbursement> findAllByOrderByIdDesc();

    Optional<Reimbursement> findByExpenseClaim_Id(Long expenseClaimId);
}
