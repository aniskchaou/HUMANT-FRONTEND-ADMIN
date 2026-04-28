package com.dev.delta.entities;

import javax.persistence.*;

@Entity
public class WorkEntry {
		

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;  
	@Column(name = "\"from\"")
String from;
@Column(name = "\"to\"")
String to;
@Column(name = "\"period\"")
String period;
@Column(name = "\"hours\"")
String hours;

	public WorkEntry() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	public String getHours() {
		return hours;
	}

	public void setHours(String hours) {
		this.hours = hours;
	}
	
	
	 
}
