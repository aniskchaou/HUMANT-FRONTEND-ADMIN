package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
@Entity
public class Award {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee employeeName;
	@ManyToOne
	@JoinColumn(name="type_award_id")
	TypeAward AwardType;
	String AwardDate;
	String Description;
	
	public Award() {
		// TODO Auto-generated constructor stub
	}

	public Award(Employee employeeName, TypeAward awardType, String awardDate, String description) {
		super();
		this.employeeName = employeeName;
		AwardType = awardType;
		AwardDate = awardDate;
		Description = description;
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

	public TypeAward getAwardType() {
		return AwardType;
	}

	public void setAwardType(TypeAward awardType) {
		AwardType = awardType;
	}

	public String getAwardDate() {
		return AwardDate;
	}

	public void setAwardDate(String awardDate) {
		AwardDate = awardDate;
	}

	public String getDescription() {
		return Description;
	}

	public void setDescription(String description) {
		Description = description;
	}
	
	
	
	
}
