package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Meeting;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

}
