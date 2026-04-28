package com.dev.delta.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.delta.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
	List<User> findAllByOrderByUsernameAsc();

	Optional<User> findByUsernameIgnoreCase(String username);

	boolean existsByUsernameIgnoreCase(String username);

}
