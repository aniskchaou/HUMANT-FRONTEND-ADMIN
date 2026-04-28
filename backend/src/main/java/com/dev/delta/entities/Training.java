package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Training {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="type_training_id")
	TypeTraining typetraining;
    String name;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee employee;
	String startDate;
	String endDate;
	String description;
	public Training() {
		// TODO Auto-generated constructor stub
	}
	public Training(TypeTraining typetraining, String name, com.dev.delta.entities.Employee employee, String startDate,
			String endDate, String description) {
		super();
		this.typetraining = typetraining;
		this.name = name;
		this.employee = employee;
		this.startDate = startDate;
		this.endDate = endDate;
		this.description = description;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public TypeTraining getTypetraining() {
		return typetraining;
	}
	public void setTypetraining(TypeTraining typetraining) {
		this.typetraining = typetraining;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Employee getEmployee() {
		return employee;
	}
	public void setEmployee(Employee employee) {
		this.employee = employee;
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
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	
	
}
