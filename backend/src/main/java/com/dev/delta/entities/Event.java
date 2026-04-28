package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
@Entity
public class Event {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String EventTitle;
	String EventDateTime;
	String EventNote;
	
	public Event() {
		// TODO Auto-generated constructor stub
	}

	public Event(String eventTitle, String eventDateTime, String eventNote) {
		super();
		EventTitle = eventTitle;
		EventDateTime = eventDateTime;
		EventNote = eventNote;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEventTitle() {
		return EventTitle;
	}

	public void setEventTitle(String eventTitle) {
		EventTitle = eventTitle;
	}

	public String getEventDateTime() {
		return EventDateTime;
	}

	public void setEventDateTime(String eventDateTime) {
		EventDateTime = eventDateTime;
	}

	public String getEventNote() {
		return EventNote;
	}

	public void setEventNote(String eventNote) {
		EventNote = eventNote;
	}
	
	
}
