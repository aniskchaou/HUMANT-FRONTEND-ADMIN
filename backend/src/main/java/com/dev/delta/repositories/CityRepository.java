package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.City;

public interface CityRepository extends JpaRepository<City, Long> {

}
