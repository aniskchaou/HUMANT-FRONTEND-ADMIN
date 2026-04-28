package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Schedule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String WorkingHours;
	
	public Schedule() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getWorkingHours() {
		return WorkingHours;
	}

	public void setWorkingHours(String workingHours) {
		WorkingHours = workingHours;
	}
	
	
}
