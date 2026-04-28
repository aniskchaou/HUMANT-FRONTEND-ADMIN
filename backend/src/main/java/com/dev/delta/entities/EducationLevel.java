package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
@Entity
public class EducationLevel {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String name;
	String years;
	
	String certificateLevel;
	String fieldofStudy;
	String school;
	
	public EducationLevel() {
		// TODO Auto-generated constructor stub
	}

	public EducationLevel(String name, String years) {
		super();
		this.name = name;
		this.years = years;
	}
	
	

	public String getCertificateLevel() {
		return certificateLevel;
	}

	public void setCertificateLevel(String certificateLevel) {
		this.certificateLevel = certificateLevel;
	}

	public String getFieldofStudy() {
		return fieldofStudy;
	}

	public void setFieldofStudy(String fieldofStudy) {
		this.fieldofStudy = fieldofStudy;
	}

	public String getSchool() {
		return school;
	}

	public void setSchool(String school) {
		this.school = school;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getYears() {
		return years;
	}

	public void setYears(String years) {
		this.years = years;
	}
	
	
}
