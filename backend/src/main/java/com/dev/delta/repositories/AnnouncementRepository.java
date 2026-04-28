package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Announcement;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long>{

}
