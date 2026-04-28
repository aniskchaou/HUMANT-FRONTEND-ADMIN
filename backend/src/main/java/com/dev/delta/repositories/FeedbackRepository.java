package com.dev.delta.repositories;

import com.dev.delta.entities.Feedback;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderByGivenAtDescIdDesc();

    List<Feedback> findAllByEmployeeIdOrderByGivenAtDescIdDesc(Long employeeId);
}
