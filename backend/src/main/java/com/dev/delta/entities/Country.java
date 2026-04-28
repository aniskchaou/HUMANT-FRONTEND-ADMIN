package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
@Entity
public class Country {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String name;
	
	public Country() {
		// TODO Auto-generated constructor stub
	}

	public Country(String name) {
		super();
		this.name = name;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

   // If setName is not implemented, add it:
//   public void setName(String name) {
//       this.name = name;
//   }

	public void setName(String name) {
		this.name = name;
	}
	
	
}
