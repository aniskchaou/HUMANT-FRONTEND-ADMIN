package com.dev.delta.repositories;

import com.dev.delta.entities.Attendance;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findFirstByExternalRecordId(String externalRecordId);

    Optional<Attendance> findFirstByEmployeeIdAndDateOrderByIdDesc(Long employeeId, LocalDate date);
}
