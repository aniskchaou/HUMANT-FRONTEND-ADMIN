package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Termination {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String typeTermination;
	String reason;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee Name;
	String noticeDate;
	String terminationDate;
	String description;
	
	public Termination() {
		// TODO Auto-generated constructor stub
	}

	public Termination(String typeTermination, String reason, Employee name, String noticeDate, String terminationDate, String description) {
		this.typeTermination = typeTermination;
		this.reason = reason;
		Name = name;
		this.noticeDate = noticeDate;
		this.terminationDate = terminationDate;
		this.description = description;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setTypeTermination(String typeTermination) {
		this.typeTermination = typeTermination;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public void setName(Employee name) {
		Name = name;
	}

	public void setNoticeDate(String noticeDate) {
		this.noticeDate = noticeDate;
	}

	public void setTerminationDate(String terminationDate) {
		this.terminationDate = terminationDate;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Long getId() {
		return id;
	}

	public String getTypeTermination() {
		return typeTermination;
	}

	public String getReason() {
		return reason;
	}

	public Employee getName() {
		return Name;
	}

	public String getNoticeDate() {
		return noticeDate;
	}

	public String getTerminationDate() {
		return terminationDate;
	}

	public String getDescription() {
		return description;
	}
}
