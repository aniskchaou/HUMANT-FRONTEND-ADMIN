package com.dev.delta.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.dev.delta.entities.User;
import com.dev.delta.entities.User.UserRole;
import com.dev.delta.repositories.UserRepository;
import com.dev.delta.services.UserService;

@Component
public class DefaultUserAccountsInitializer implements CommandLineRunner {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public void run(String... args) {
		normalizeExistingUsers();
		ensureDefaultAccount("admin", "admin", "Administrator", UserRole.ADMIN);
		ensureDefaultAccount("hr", "hr123", "HR Operator", UserRole.HR);
		ensureDefaultAccount("manager", "manager123", "People Manager", UserRole.MANAGER);
		ensureDefaultAccount("recruiter", "recruit123", "Talent Recruiter", UserRole.RECRUITER);
		ensureDefaultAccount("emp", "123", "Employee User", UserRole.EMPLOYEE);
	}

	private void normalizeExistingUsers() {
		List<User> existingUsers = userRepository.findAll();

		for (User existingUser : existingUsers) {
			userService.normalizeExistingAccount(existingUser);
		}
	}

	private void ensureDefaultAccount(String username, String rawPassword, String displayName, UserRole role) {
		User user = userRepository.findByUsernameIgnoreCase(username).orElse(null);

		if (user == null) {
			User newUser = new User();
			newUser.setUsername(username);
			newUser.setPassword(passwordEncoder.encode(rawPassword));
			newUser.setDisplayName(displayName);
			newUser.setRole(role);
			newUser.setActive(Boolean.TRUE);
			userRepository.save(newUser);
			return;
		}

		boolean shouldSave = false;

		if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
			user.setPassword(passwordEncoder.encode(rawPassword));
			shouldSave = true;
		}

		if (user.getDisplayName() == null || user.getDisplayName().trim().isEmpty()) {
			user.setDisplayName(displayName);
			shouldSave = true;
		}

		if (user.getRole() != role) {
			user.setRole(role);
			shouldSave = true;
		}

		if (user.getActive() == null || !user.getActive()) {
			user.setActive(Boolean.TRUE);
			shouldSave = true;
		}

		if (shouldSave) {
			userRepository.save(user);
		}
	}
}