package com.dev.delta.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.dev.delta.entities.Company;
import com.dev.delta.entities.User;
import com.dev.delta.entities.User.UserRole;
import com.dev.delta.repositories.UserRepository;
@Service
public class UserService {
	/**
	 * userRepository
	 */
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private CompanyService companyService;

	@Autowired
	private WorkspaceConfigurationService workspaceConfigurationService;

	@Autowired
	private AuditLogService auditLogService;

	/**
	 * getUsers
	 * 
	 * @return
	 */
	public List<User> getUsers() {
		return userRepository.findAllByOrderByUsernameAsc();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return userRepository.count();
	}

	/**
	 * save
	 * 
	 * @param user
	 */
	public User save(User user) {
		return create(user);
	}

	public User create(User user) {
		String username = normalizeUsername(user.getUsername());

		if (username.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required.");
		}

		if (userRepository.existsByUsernameIgnoreCase(username)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists.");
		}

		String rawPassword = normalizeText(user.getPassword());

		if (rawPassword.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required.");
		}

		validatePasswordLength(rawPassword);

		User account = new User();
		account.setUsername(username);
		account.setDisplayName(resolveDisplayName(user.getDisplayName(), username));
		account.setRole(resolveRole(user.getRole()));
		account.setActive(user.getActive() == null ? Boolean.TRUE : user.getActive());
		account.setCompany(resolveCompany(user.getCompany()));
		account.setPassword(encodeIfNecessary(rawPassword));
		User savedAccount = userRepository.save(account);
		auditLogService.logCurrentUserAction(
			"CREATE",
			"USER_ACCOUNT",
			savedAccount.getId() != null ? savedAccount.getId().toString() : savedAccount.getUsername(),
			"Created login account for " + savedAccount.getUsername() + ".",
			"Assigned role: " + savedAccount.getRole().name()
		);
		return savedAccount;
	}

	public User update(Long id, User userDetails) {
		User user = findById(id);
		String username = normalizeUsername(userDetails.getUsername());

		if (username.isEmpty()) {
			username = user.getUsername();
		}

		Optional<User> existingUser = userRepository.findByUsernameIgnoreCase(username);
		if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists.");
		}

		user.setUsername(username);
		user.setDisplayName(resolveDisplayName(userDetails.getDisplayName(), username));
		user.setRole(userDetails.getRole() != null ? userDetails.getRole() : resolveRole(user.getRole()));
		user.setActive(userDetails.getActive() == null ? user.getActive() : userDetails.getActive());
		user.setCompany(resolveCompany(userDetails.getCompany(), user.getCompany()));

		String rawPassword = normalizeText(userDetails.getPassword());
		if (!rawPassword.isEmpty()) {
			validatePasswordLength(rawPassword);
			user.setPassword(encodeIfNecessary(rawPassword));
		}

		User updatedUser = userRepository.save(user);
		auditLogService.logCurrentUserAction(
			"UPDATE",
			"USER_ACCOUNT",
			updatedUser.getId() != null ? updatedUser.getId().toString() : updatedUser.getUsername(),
			"Updated login account for " + updatedUser.getUsername() + ".",
			"Assigned role: " + updatedUser.getRole().name() + ", active: " + updatedUser.getActive()
		);
		return updatedUser;
	}

	public User resetPassword(Long id, String requestedPassword) {
		User user = findById(id);
		String password = normalizeText(requestedPassword);

		if (password.isEmpty()) {
			password = generateTemporaryPassword(resolvePasswordMinLength());
		}

		validatePasswordLength(password);
		user.setPassword(encodeIfNecessary(password));
		User updatedUser = userRepository.save(user);
		auditLogService.logCurrentUserAction(
			"RESET_PASSWORD",
			"USER_ACCOUNT",
			updatedUser.getId() != null ? updatedUser.getId().toString() : updatedUser.getUsername(),
			"Reset password for " + updatedUser.getUsername() + ".",
			"Password reset performed by administrator."
		);
		return updatedUser;
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public User findById(Long id) {
		return userRepository.findById(id).orElseThrow();
	}

	public Optional<User> findByUsername(String username) {
		return userRepository.findByUsernameIgnoreCase(normalizeUsername(username));
	}

	public User normalizeExistingAccount(User user) {
		boolean shouldSave = false;

		String username = normalizeUsername(user.getUsername());
		if (!username.equals(user.getUsername())) {
			user.setUsername(username);
			shouldSave = true;
		}

		String displayName = resolveDisplayName(user.getDisplayName(), username);
		if (!displayName.equals(user.getDisplayName())) {
			user.setDisplayName(displayName);
			shouldSave = true;
		}

		UserRole role = resolveRole(user.getRole());
		if (user.getRole() != role) {
			user.setRole(role);
			shouldSave = true;
		}

		Company company = resolveCompany(user.getCompany());
		if (user.getCompany() != company) {
			user.setCompany(company);
			shouldSave = true;
		}

		Boolean active = user.getActive() == null ? Boolean.TRUE : user.getActive();
		if (user.getActive() == null || !active.equals(user.getActive())) {
			user.setActive(active);
			shouldSave = true;
		}

		String password = normalizeText(user.getPassword());
		if (!password.isEmpty() && !isEncodedPassword(password)) {
			user.setPassword(passwordEncoder.encode(password));
			shouldSave = true;
		}

		return shouldSave ? userRepository.save(user) : user;
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		User user = userRepository.findById(id).orElseThrow();
		userRepository.delete(user);
		auditLogService.logCurrentUserAction(
			"DELETE",
			"USER_ACCOUNT",
			user.getId() != null ? user.getId().toString() : user.getUsername(),
			"Deleted login account for " + user.getUsername() + ".",
			"Role at deletion: " + resolveRole(user.getRole()).name()
		);
	}

	private UserRole resolveRole(UserRole role) {
		return role != null ? role : UserRole.EMPLOYEE;
	}

	private Company resolveCompany(Company company) {
		return resolveCompany(company, null);
	}

	private Company resolveCompany(Company company, Company fallback) {
		if (company != null && company.getId() != null) {
			return companyService.getCompany(company.getId());
		}

		if (fallback != null) {
			return fallback;
		}

		return companyService.getDefaultCompany();
	}

	private String normalizeUsername(String value) {
		return normalizeText(value).toLowerCase();
	}

	private String normalizeText(String value) {
		return value != null ? value.trim() : "";
	}

	private String resolveDisplayName(String displayName, String username) {
		String normalizedDisplayName = normalizeText(displayName);

		if (!normalizedDisplayName.isEmpty()) {
			return normalizedDisplayName;
		}

		String[] tokens = normalizeUsername(username).replace('-', ' ').replace('_', ' ').split("\\s+");
		StringBuilder builder = new StringBuilder();

		for (String token : tokens) {
			if (token.isEmpty()) {
				continue;
			}

			if (builder.length() > 0) {
				builder.append(' ');
			}

			builder.append(Character.toUpperCase(token.charAt(0)));
			if (token.length() > 1) {
				builder.append(token.substring(1).toLowerCase());
			}
		}

		return builder.length() > 0 ? builder.toString() : "Operator";
	}

	private String encodeIfNecessary(String password) {
		return isEncodedPassword(password) ? password : passwordEncoder.encode(password);
	}

	private void validatePasswordLength(String password) {
		int minimumLength = resolvePasswordMinLength();

		if (password.length() < minimumLength) {
			throw new ResponseStatusException(
				HttpStatus.BAD_REQUEST,
				"Password must be at least " + minimumLength + " characters long."
			);
		}
	}

	private int resolvePasswordMinLength() {
		Integer configuredValue = workspaceConfigurationService.getConfiguration().getPasswordMinLength();
		return configuredValue != null && configuredValue > 0 ? configuredValue : 8;
	}

	private String generateTemporaryPassword(int minimumLength) {
		String seed = "Temp" + System.currentTimeMillis();
		StringBuilder builder = new StringBuilder(seed.replaceAll("[^A-Za-z0-9]", ""));

		while (builder.length() < minimumLength) {
			builder.append('7');
		}

		return builder.substring(0, Math.max(minimumLength, 8));
	}

	private boolean isEncodedPassword(String password) {
		return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
	}
}
