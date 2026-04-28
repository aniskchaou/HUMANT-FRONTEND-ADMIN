package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
@Entity
public class JobApplication {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="position_id")
	Job Position;
	String Name;
	String Email;
	String Phone;
	String AppliedOn;
	String Status;	
	
	public JobApplication() {
		// TODO Auto-generated constructor stub
	}

	public JobApplication(Job position, String name, String email, String phone, String appliedOn, String status) {
		super();
		Position = position;
		Name = name;
		Email = email;
		Phone = phone;
		AppliedOn = appliedOn;
		Status = status;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Job getPosition() {
		return Position;
	}

	public void setPosition(Job position) {
		Position = position;
	}

	public String getName() {
		return Name;
	}

	public void setName(String name) {
		Name = name;
	}

	public String getEmail() {
		return Email;
	}

	public void setEmail(String email) {
		Email = email;
	}

	public String getPhone() {
		return Phone;
	}

	public void setPhone(String phone) {
		Phone = phone;
	}

	public String getAppliedOn() {
		return AppliedOn;
	}

	public void setAppliedOn(String appliedOn) {
		AppliedOn = appliedOn;
	}

	public String getStatus() {
		return Status;
	}

	public void setStatus(String status) {
		Status = status;
	}
	
	
}
