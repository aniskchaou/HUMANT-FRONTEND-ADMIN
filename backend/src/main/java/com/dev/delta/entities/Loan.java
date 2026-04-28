package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
@Entity
public class Loan {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String LoanName;
	String ReceiveType;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee Name;
	String InterestPercentage;
	String LoanAmount;
	String ApplyDate;
	String Remarks;
	
	public Loan() {
		// TODO Auto-generated constructor stub
	}

	public Loan(String loanName, String receiveType, Employee name, String interestPercentage, String loanAmount,
			String applyDate, String remarks) {
		super();
		LoanName = loanName;
		ReceiveType = receiveType;
		Name = name;
		InterestPercentage = interestPercentage;
		LoanAmount = loanAmount;
		ApplyDate = applyDate;
		Remarks = remarks;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getLoanName() {
		return LoanName;
	}

	public void setLoanName(String loanName) {
		LoanName = loanName;
	}

	public String getReceiveType() {
		return ReceiveType;
	}

	public void setReceiveType(String receiveType) {
		ReceiveType = receiveType;
	}

	public Employee getName() {
		return Name;
	}

	public void setName(Employee name) {
		Name = name;
	}

	public String getInterestPercentage() {
		return InterestPercentage;
	}

	public void setInterestPercentage(String interestPercentage) {
		InterestPercentage = interestPercentage;
	}

	public String getLoanAmount() {
		return LoanAmount;
	}

	public void setLoanAmount(String loanAmount) {
		LoanAmount = loanAmount;
	}

	public String getApplyDate() {
		return ApplyDate;
	}

	public void setApplyDate(String applyDate) {
		ApplyDate = applyDate;
	}

	public String getRemarks() {
		return Remarks;
	}

	public void setRemarks(String remarks) {
		Remarks = remarks;
	}
	
	
}
