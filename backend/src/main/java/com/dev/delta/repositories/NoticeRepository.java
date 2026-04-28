package com.dev.delta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

}
