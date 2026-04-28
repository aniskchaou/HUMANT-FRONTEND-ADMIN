package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;


@Entity
public class Salary {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String SalaryName;
	String BasicSalary;
	String TotalSalary;
	String MedicalAllowance;
	String ConveyanceAllowance;
	

	public Salary() {
		// TODO Auto-generated constructor stub
	}


	public Salary(String salaryName, String basicSalary, String totalSalary, String medicalAllowance,
			String conveyanceAllowance) {
		super();
		SalaryName = salaryName;
		BasicSalary = basicSalary;
		TotalSalary = totalSalary;
		MedicalAllowance = medicalAllowance;
		ConveyanceAllowance = conveyanceAllowance;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getSalaryName() {
		return SalaryName;
	}


	public void setSalaryName(String salaryName) {
		SalaryName = salaryName;
	}


	public String getBasicSalary() {
		return BasicSalary;
	}


	public void setBasicSalary(String basicSalary) {
		BasicSalary = basicSalary;
	}


	public String getTotalSalary() {
		return TotalSalary;
	}


	public void setTotalSalary(String totalSalary) {
		TotalSalary = totalSalary;
	}


	public String getMedicalAllowance() {
		return MedicalAllowance;
	}


	public void setMedicalAllowance(String medicalAllowance) {
		MedicalAllowance = medicalAllowance;
	}


	public String getConveyanceAllowance() {
		return ConveyanceAllowance;
	}


	public void setConveyanceAllowance(String conveyanceAllowance) {
		ConveyanceAllowance = conveyanceAllowance;
	}
	
	
}
