package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Transfer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="departement_from_id")
	Departement departementFrom;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee EmployeeName ;
	@ManyToOne
	@JoinColumn(name="departement_to_id")
	Departement departementTo;
	String designation;
	String NoticeDate;
	String TransferDate;
	String Description;
	
	public Transfer() {
		// TODO Auto-generated constructor stub
	}

	public Transfer(Departement departementFrom, Employee employeeName, Departement departementTo, String designation,
			String noticeDate, String transferDate, String description) {
		super();
		this.departementFrom = departementFrom;
		EmployeeName = employeeName;
		this.departementTo = departementTo;
		this.designation = designation;
		NoticeDate = noticeDate;
		TransferDate = transferDate;
		Description = description;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Departement getDepartementFrom() {
		return departementFrom;
	}

	public void setDepartementFrom(Departement departementFrom) {
		this.departementFrom = departementFrom;
	}

	public Employee getEmployeeName() {
		return EmployeeName;
	}

	public void setEmployeeName(Employee employeeName) {
		EmployeeName = employeeName;
	}

	public Departement getDepartementTo() {
		return departementTo;
	}

	public void setDepartementTo(Departement departementTo) {
		this.departementTo = departementTo;
	}

	public String getDesignation() {
		return designation;
	}

	public void setDesignation(String designation) {
		this.designation = designation;
	}

	public String getNoticeDate() {
		return NoticeDate;
	}

	public void setNoticeDate(String noticeDate) {
		NoticeDate = noticeDate;
	}

	public String getTransferDate() {
		return TransferDate;
	}

	public void setTransferDate(String transferDate) {
		TransferDate = transferDate;
	}

	public String getDescription() {
		return Description;
	}

	public void setDescription(String description) {
		Description = description;
	}
	
	
}
