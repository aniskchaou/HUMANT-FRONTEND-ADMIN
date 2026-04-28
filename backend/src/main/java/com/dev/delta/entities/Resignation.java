package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;


@Entity
public class Resignation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee employeeName;
	@ManyToOne
	@JoinColumn(name="departement_id")
	Departement departement;
	String resignationDate;
	String resignationReason;
	
	public Resignation() {
		// TODO Auto-generated constructor stub
	}

	public Resignation(Employee employeeName, Departement departement,  String resignationDate,
			String resignationReason) {
		super();
		this.employeeName = employeeName;
		this.departement = departement;

		this.resignationDate = resignationDate;
		this.resignationReason = resignationReason;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Employee getEmployeeName() {
		return employeeName;
	}

	public void setEmployeeName(Employee employeeName) {
		this.employeeName = employeeName;
	}

	public Departement getDepartement() {
		return departement;
	}

	public void setDepartement(Departement departement) {
		this.departement = departement;
	}

	

	public String getResignationDate() {
		return resignationDate;
	}

	public void setResignationDate(String resignationDate) {
		this.resignationDate = resignationDate;
	}

	public String getResignationReason() {
		return resignationReason;
	}

	public void setResignationReason(String resignationReason) {
		this.resignationReason = resignationReason;
	}
	
	
}
