package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
@Entity
public class Announcement {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String Title;
	@ManyToOne
	@JoinColumn(name="departement_id")
	Departement department;
	String startDate;
	String endDate;
	String attachment;
	String summary;
	String description;
	
	public Announcement() {
		// TODO Auto-generated constructor stub
	}

	public Announcement(String title, Departement department,
			String startDate, String endDate, String attachment, String summary, String description) {
		super();
		Title = title;
		this.department = department;
		this.startDate = startDate;
		this.endDate = endDate;
		this.attachment = attachment;
		this.summary = summary;
		this.description = description;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return Title;
	}

	public void setTitle(String title) {
		Title = title;
	}



	public Departement getDepartment() {
		return department;
	}

	public void setDepartment(Departement department) {
		this.department = department;
	}

	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	public String getEndDate() {
		return endDate;
	}

	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}

	public String getAttachment() {
		return attachment;
	}

	public void setAttachment(String attachment) {
		this.attachment = attachment;
	}

	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	

}
