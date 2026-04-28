package com.dev.delta.repositories;

import com.dev.delta.entities.AuditLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogEntryRepository extends JpaRepository<AuditLogEntry, Long> {

    List<AuditLogEntry> findTop200ByOrderByCreatedAtDesc();
}