
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.delta.entities.User;
import com.dev.delta.services.AuditLogService;
import com.dev.delta.services.RoleAccessPolicyService;
import com.dev.delta.services.UserService;
import com.dev.delta.services.WorkspaceConfigurationService;


@RestController
@RequestMapping("/user")
@CrossOrigin
@Tag(name = "User", description = "User management APIs")
public class UserController {
	@Autowired
	UserService userService;

	@Autowired
	RoleAccessPolicyService roleAccessPolicyService;

	@Autowired
	WorkspaceConfigurationService workspaceConfigurationService;

	@Autowired
	AuditLogService auditLogService;

	@Operation(summary = "Create a new user")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody User projectUser, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		User newPT = userService.create(projectUser);

		return new ResponseEntity<User>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all users")
	@GetMapping("/all")
	public Iterable<User> getAllUsers() {
		return userService.getUsers();
	}

	@Operation(summary = "Get the current authenticated session")
	@GetMapping("/session")
	public ResponseEntity<Map<String, Object>> getCurrentSession(Authentication authentication) {
		User currentUser = userService.findByUsername(authentication.getName()).orElse(null);
		auditLogService.logSessionOpened(currentUser);
		Map<String, Object> session = new HashMap<String, Object>();
		session.put("username", currentUser != null ? currentUser.getUsername() : authentication.getName());
		session.put(
			"displayName",
			currentUser != null ? currentUser.getDisplayName() : toDisplayName(authentication.getName())
		);
		session.put("role", currentUser != null && currentUser.getRole() != null ? currentUser.getRole().name() : "EMPLOYEE");
		session.put("active", currentUser == null || currentUser.getActive() == null ? Boolean.TRUE : currentUser.getActive());
		session.put("company", currentUser != null ? currentUser.getCompany() : null);
		session.put(
			"accessPolicy",
			currentUser != null && currentUser.getRole() != null ? roleAccessPolicyService.getPolicy(currentUser.getRole()) : null
		);
		Map<String, Object> authSettings = new HashMap<String, Object>();
		authSettings.put("passwordMinLength", workspaceConfigurationService.getConfiguration().getPasswordMinLength());
		authSettings.put("sessionTimeoutMinutes", workspaceConfigurationService.getConfiguration().getSessionTimeoutMinutes());
		authSettings.put("allowRememberMe", workspaceConfigurationService.getConfiguration().getAllowRememberMe());
		session.put("authSettings", authSettings);
		session.put(
			"authorities",
			authentication.getAuthorities().stream().map((authority) -> authority.getAuthority()).collect(Collectors.toList())
		);

		return new ResponseEntity<Map<String, Object>>(session, HttpStatus.OK);
	}

	@Operation(summary = "Update user by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
		User updatedUser = userService.update(id, userDetails);
		return new ResponseEntity<User>(updatedUser, HttpStatus.OK);
	}

	@Operation(summary = "Reset user password by ID")
	@PostMapping("/reset-password/{id}")
	public ResponseEntity<Map<String, Object>> resetPassword(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
		String password = payload != null ? payload.get("password") : null;
		User updatedUser = userService.resetPassword(id, password);
		Map<String, Object> response = new HashMap<String, Object>();
		response.put("id", updatedUser.getId());
		response.put("username", updatedUser.getUsername());
		response.put("temporaryPassword", password != null && !password.trim().isEmpty() ? password.trim() : "Temporary password generated and applied.");
		return new ResponseEntity<Map<String, Object>>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get user by ID")
	@GetMapping("/{id}")
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		User user = userService.findById(id);
		return new ResponseEntity<User>(user, HttpStatus.OK);
	}

	@Operation(summary = "Delete user by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteUser(@PathVariable Long id) {
		userService.delete(id);
		return new ResponseEntity<String>("user was deleted", HttpStatus.OK);
	}

	private String toDisplayName(String username) {
		if (username == null || username.trim().isEmpty()) {
			return "Operator";
		}

		String normalizedUsername = username.replace('-', ' ').replace('_', ' ').trim();
		String[] tokens = normalizedUsername.split("\\s+");
		StringBuilder builder = new StringBuilder();

		for (int index = 0; index < tokens.length; index++) {
			String token = tokens[index];

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
}
