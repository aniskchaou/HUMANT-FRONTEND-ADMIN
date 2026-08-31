package com.dev.delta.repositories;

import com.dev.delta.entities.PlatformRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformRoleRepository extends JpaRepository<PlatformRole, Long> {
    Optional<PlatformRole> findByRoleName(String roleName);
    List<PlatformRole> findAllByOrderByRoleNameAsc();
    List<PlatformRole> findByActiveTrue();
}
