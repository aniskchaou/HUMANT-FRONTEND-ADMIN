package com.dev.delta.security;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.User;
import com.dev.delta.entities.User.UserRole;
import com.dev.delta.services.UserService;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

	@Autowired
	private UserService userService;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User account = userService.findByUsername(username).orElseThrow(
			() -> new UsernameNotFoundException("User account was not found.")
		);

		UserRole role = account.getRole() != null ? account.getRole() : UserRole.EMPLOYEE;

		return org.springframework.security.core.userdetails.User.withUsername(account.getUsername())
			.password(account.getPassword())
			.authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name())))
			.disabled(Boolean.FALSE.equals(account.getActive()))
			.build();
	}
}