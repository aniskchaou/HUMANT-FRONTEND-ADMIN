package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Leave {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@ManyToOne
	@JoinColumn(name="type_leave_id")
	TypeLeave typeLeave;
	@ManyToOne
	@JoinColumn(name="employee_id")
	Employee employee;	
	String StartDate;
	String EndDate;
	String Attachment;
	String Remarks;
	String Reason;
	String approvalStatus;
	String reviewedBy;
	String reviewedAt;
	
	public Leave() {
		// TODO Auto-generated constructor stub
	}

	public Leave(TypeLeave typeLeave, Employee employee, String startDate, String endDate, String attachment,
			String remarks, String reason) {
		super();
		this.typeLeave = typeLeave;
		this.employee = employee;
		StartDate = startDate;
		EndDate = endDate;
		Attachment = attachment;
		Remarks = remarks;
		Reason = reason;
		approvalStatus = "Pending";
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public TypeLeave getTypeLeave() {
		return typeLeave;
	}

	public void setTypeLeave(TypeLeave typeLeave) {
		this.typeLeave = typeLeave;
	}

	public Employee getEmployee() {
		return employee;
	}

	public void setEmployee(Employee employee) {
		this.employee = employee;
	}

	public String getStartDate() {
		return StartDate;
	}

	public void setStartDate(String startDate) {
		StartDate = startDate;
	}

	public String getEndDate() {
		return EndDate;
	}

	public void setEndDate(String endDate) {
		EndDate = endDate;
	}

	public String getAttachment() {
		return Attachment;
	}

	public void setAttachment(String attachment) {
		Attachment = attachment;
	}

	public String getRemarks() {
		return Remarks;
	}

	public void setRemarks(String remarks) {
		Remarks = remarks;
	}

	public String getReason() {
		return Reason;
	}

	public void setReason(String reason) {
		Reason = reason;
	}

	public String getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(String approvalStatus) {
		this.approvalStatus = approvalStatus;
	}

	public String getReviewedBy() {
		return reviewedBy;
	}

	public void setReviewedBy(String reviewedBy) {
		this.reviewedBy = reviewedBy;
	}

	public String getReviewedAt() {
		return reviewedAt;
	}

	public void setReviewedAt(String reviewedAt) {
		this.reviewedAt = reviewedAt;
	}
	
	
}
