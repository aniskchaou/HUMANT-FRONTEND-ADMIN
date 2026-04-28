package com.dev.delta.repositories;

import com.dev.delta.entities.RoleAccessPolicy;
import com.dev.delta.entities.User.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleAccessPolicyRepository extends JpaRepository<RoleAccessPolicy, Long> {

    List<RoleAccessPolicy> findAllByOrderByRoleNameAsc();

    Optional<RoleAccessPolicy> findByRoleName(UserRole roleName);
}