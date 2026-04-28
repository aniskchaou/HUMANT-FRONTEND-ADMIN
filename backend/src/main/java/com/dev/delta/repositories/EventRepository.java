package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Event;

public interface EventRepository extends JpaRepository<Event, Long> {

}
