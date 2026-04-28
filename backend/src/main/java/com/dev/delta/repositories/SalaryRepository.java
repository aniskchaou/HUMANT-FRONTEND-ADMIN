package com.dev.delta.repositories;

import com.dev.delta.entities.Salary;
import com.dev.delta.entities.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

}
