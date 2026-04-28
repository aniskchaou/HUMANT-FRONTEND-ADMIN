package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class WorkPermit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String visaNo	;
	String workPermitNo	;
	String visaExpireDate	;
	String workPermitExpirationDate	;
	String workPermit;
	
	public WorkPermit() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getVisaNo() {
		return visaNo;
	}

	public void setVisaNo(String visaNo) {
		this.visaNo = visaNo;
	}

	public String getWorkPermitNo() {
		return workPermitNo;
	}

	public void setWorkPermitNo(String workPermitNo) {
		this.workPermitNo = workPermitNo;
	}

	public String getVisaExpireDate() {
		return visaExpireDate;
	}

	public void setVisaExpireDate(String visaExpireDate) {
		this.visaExpireDate = visaExpireDate;
	}

	public String getWorkPermitExpirationDate() {
		return workPermitExpirationDate;
	}

	public void setWorkPermitExpirationDate(String workPermitExpirationDate) {
		this.workPermitExpirationDate = workPermitExpirationDate;
	}

	public String getWorkPermit() {
		return workPermit;
	}

	public void setWorkPermit(String workPermit) {
		this.workPermit = workPermit;
	}
	
	
}
