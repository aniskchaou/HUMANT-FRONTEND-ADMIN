package com.dev.delta.repositories;

import com.dev.delta.entities.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;



public interface HolidayRepository extends JpaRepository<Holiday, Long> {

}
