package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Trainer {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String FirstName;
	String LastName;
	String ContactNumber;
	String Email;
	String Company;
    String Expertise;
    @ManyToOne
    @JoinColumn(name="education_level_id")
	EducationLevel educationLevel;
	String Address;
	
	public Trainer() {
		// TODO Auto-generated constructor stub
	}

	public Trainer(String firstName, String lastName, String contactNumber, String email, String company,
			String expertise, EducationLevel educationLevel, String address) {
		super();
		FirstName = firstName;
		LastName = lastName;
		ContactNumber = contactNumber;
		Email = email;
		Company = company;
		Expertise = expertise;
		this.educationLevel = educationLevel;
		Address = address;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return FirstName;
	}

	public void setFirstName(String firstName) {
		FirstName = firstName;
	}

	public String getLastName() {
		return LastName;
	}

	public void setLastName(String lastName) {
		LastName = lastName;
	}

	public String getContactNumber() {
		return ContactNumber;
	}

	public void setContactNumber(String contactNumber) {
		ContactNumber = contactNumber;
	}

	public String getEmail() {
		return Email;
	}

	public void setEmail(String email) {
		Email = email;
	}

	public String getCompany() {
		return Company;
	}

	public void setCompany(String company) {
		Company = company;
	}

	public String getExpertise() {
		return Expertise;
	}

	public void setExpertise(String expertise) {
		Expertise = expertise;
	}

	public EducationLevel getEducationLevel() {
		return educationLevel;
	}

	public void setEducationLevel(EducationLevel educationLevel) {
		this.educationLevel = educationLevel;
	}

	public String getAddress() {
		return Address;
	}

	public void setAddress(String address) {
		Address = address;
	}
	
	
}
