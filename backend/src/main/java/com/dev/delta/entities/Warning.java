package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Warning {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee Against;
	String WarningTitle;
	String WarningDate;
	String  Description;
	
	public Warning() {
		// TODO Auto-generated constructor stub
	}

	public Warning(Employee against, String warningTitle, String warningDate, String description) {
		super();
		Against = against;
		WarningTitle = warningTitle;
		WarningDate = warningDate;
		Description = description;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Employee getAgainst() {
		return Against;
	}

	public void setAgainst(Employee against) {
		Against = against;
	}

	public String getWarningTitle() {
		return WarningTitle;
	}

	public void setWarningTitle(String warningTitle) {
		WarningTitle = warningTitle;
	}

	public String getWarningDate() {
		return WarningDate;
	}

	public void setWarningDate(String warningDate) {
		WarningDate = warningDate;
	}

	public String getDescription() {
		return Description;
	}

	public void setDescription(String description) {
		Description = description;
	}
	
	
	
}
