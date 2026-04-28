package com.dev.delta.entities;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "app_users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@Column(nullable = false, unique = true)
	String username;
	@Column(nullable = false)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	String password;
	@Column(name = "display_name", nullable = false)
	String displayName;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	UserRole role;
	@Column(nullable = false)
	Boolean active;

	@ManyToOne
	@JoinColumn(name = "company_id")
	Company company;
	
	public User() {
		// TODO Auto-generated constructor stub
	}

	public User(String username, String password, String displayName, UserRole role, Boolean active) {
		super();
		this.username = username;
		this.password = password;
		this.displayName = displayName;
		this.role = role;
		this.active = active;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public Company getCompany() {
		return company;
	}

	public void setCompany(Company company) {
		this.company = company;
	}

	public enum UserRole {
		ADMIN,
		HR,
		MANAGER,
		RECRUITER,
		EMPLOYEE
	}
	
	
	
}
