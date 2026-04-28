package com.dev.delta.repositories;

import com.dev.delta.entities.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long> {
    List<Bonus> findByDateGrantedBetween(LocalDate startDate, LocalDate endDate);
}
