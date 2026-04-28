package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

}
