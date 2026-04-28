package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;


@Entity
public class Location {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String name; 
	String Address;
	@ManyToOne
	@JoinColumn(name="city_id")
	City City ;
	String State ;
	String ZipCode ;
	@ManyToOne
	@JoinColumn(name="country_id")
	Country Country ;
	
	public Location() {
		// TODO Auto-generated constructor stub
	}

	public Location(String name, String address, com.dev.delta.entities.City city, String state, String zipCode,
			com.dev.delta.entities.Country country) {
		super();
		this.name = name;
		Address = address;
		City = city;
		State = state;
		ZipCode = zipCode;
		Country = country;
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

	public void setName(String name) {
		this.name = name;
	}

	public String getAddress() {
		return Address;
	}

	public void setAddress(String address) {
		Address = address;
	}

	public City getCity() {
		return City;
	}

	public void setCity(City city) {
		City = city;
	}

	public String getState() {
		return State;
	}

	public void setState(String state) {
		State = state;
	}

	public String getZipCode() {
		return ZipCode;
	}

	public void setZipCode(String zipCode) {
		ZipCode = zipCode;
	}

	public Country getCountry() {
		return Country;
	}

	public void setCountry(Country country) {
		Country = country;
	}
	
}
