package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
@Entity
public class WorkingLocation {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id; 
	String WorkAddress	;
	String WorkLocation;
	String homeworkingdistance;
	
	public WorkingLocation() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getWorkAddress() {
		return WorkAddress;
	}

	public void setWorkAddress(String workAddress) {
		WorkAddress = workAddress;
	}

	public String getWorkLocation() {
		return WorkLocation;
	}

	public void setWorkLocation(String workLocation) {
		WorkLocation = workLocation;
	}

	public String getHomeworkingdistance() {
		return homeworkingdistance;
	}

	public void setHomeworkingdistance(String homeworkingdistance) {
		this.homeworkingdistance = homeworkingdistance;
	}
	
	
}
