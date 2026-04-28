package com.dev.delta.repositories;

import com.dev.delta.entities.PerformanceReview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findAllByOrderByReviewDateDescIdDesc();

    List<PerformanceReview> findAllByEmployeeIdOrderByReviewDateDescIdDesc(Long employeeId);
}
