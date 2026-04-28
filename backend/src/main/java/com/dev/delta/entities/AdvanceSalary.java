package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
@Entity
public class AdvanceSalary {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String reason ;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee employeeName ;
	String amount;
	String date;
	String remarks;

	public AdvanceSalary() {
	}

	public AdvanceSalary(String reason, Employee employeeName, String amount, String date, String remarks) {
		super();
		this.reason = reason;
		this.employeeName = employeeName;
		this.amount = amount;
		this.date = date;
		this.remarks = remarks;
	}

	   public Long getId() {
			   return id;
	   }

	   public void setId(Long id) {
			   this.id = id;
	   }

	   public String getReason() {
			   return reason;
	   }

	   public void setReason(String reason) {
			   this.reason = reason;
	   }

	   public Employee getEmployeeName() {
			   return employeeName;
	   }

	   public void setEmployeeName(Employee employeeName) {
			   this.employeeName = employeeName;
	   }

	   public String getAmount() {
			   return amount;
	   }

	   public void setAmount(String amount) {
			   this.amount = amount;
	   }

	   public String getDate() {
			   return date;
	   }

	   public void setDate(String date) {
			   this.date = date;
	   }

	   public String getRemarks() {
			   return remarks;
	   }

	   public void setRemarks(String remarks) {
			   this.remarks = remarks;
	   }
	
	
}
