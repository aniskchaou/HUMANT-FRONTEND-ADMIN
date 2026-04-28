package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Complain {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="complain_by_id")
	Employee complainBy;
	@ManyToOne
	@JoinColumn(name="complain_against_id")
	Employee complainAgainst;
	String complainTitle;
	String complainDate;
	String description;
	
	public Complain() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Employee getComplainBy() {
		return complainBy;
	}

	public void setComplainBy(Employee complainBy) {
		this.complainBy = complainBy;
	}

	public Employee getComplainAgainst() {
		return complainAgainst;
	}

	public void setComplainAgainst(Employee complainAgainst) {
		this.complainAgainst = complainAgainst;
	}

	public String getComplainTitle() {
		return complainTitle;
	}

	public void setComplainTitle(String complainTitle) {
		this.complainTitle = complainTitle;
	}

	public String getComplainDate() {
		return complainDate;
	}

	public void setComplainDate(String complainDate) {
		this.complainDate = complainDate;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
}
