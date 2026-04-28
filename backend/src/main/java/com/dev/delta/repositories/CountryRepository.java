package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Country;

public interface CountryRepository extends JpaRepository<Country, Long> {

}
