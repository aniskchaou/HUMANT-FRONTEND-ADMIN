package com.dev.delta.repositories;

import com.dev.delta.entities.OnboardingChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnboardingChecklistRepository extends JpaRepository<OnboardingChecklist, Long> {
    List<OnboardingChecklist> findAllByOrderByAssignedAtDescIdDesc();

    List<OnboardingChecklist> findAllByEmployeeIdOrderByTaskOrderAscDueDateAscIdAsc(Long employeeId);
}
