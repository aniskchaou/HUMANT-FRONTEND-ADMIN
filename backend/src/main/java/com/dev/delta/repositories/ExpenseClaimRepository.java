package com.dev.delta.repositories;

import com.dev.delta.entities.ExpenseClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, Long> {
    List<ExpenseClaim> findAllByOrderBySubmittedAtDescIdDesc();

    List<ExpenseClaim> findAllBySubmittedByIgnoreCaseOrderBySubmittedAtDescIdDesc(String submittedBy);
}
