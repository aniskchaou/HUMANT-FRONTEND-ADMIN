package com.dev.delta.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

 

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
	@ManyToMany
	@JoinTable(
		name = "employee_skills",
		joinColumns = @JoinColumn(name = "employee_id"),
		inverseJoinColumns = @JoinColumn(name = "skill_id")
	)
	@com.fasterxml.jackson.annotation.JsonIgnore
	private List<Skill> skills;
	@ManyToOne
	@JoinColumn(name = "role_id")
	private Role role;
	@ManyToOne
	@JoinColumn(name = "job_position_id")
	private JobPosition jobPosition;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String fullName;

	private String phone;

	private LocalDate birthDay;

	private String gender;

	private String presentAddress;

	private String permanentAddress;

	private String photo;

	private String note;

	@ManyToOne
	@JoinColumn(name = "company_id")
	private Company company;

	@ManyToOne
	@JoinColumn(name = "department_id")
	private Departement department;

	@ManyToOne
	@JoinColumn(name = "job_id")
	private Job job;

	private LocalDate joiningDate;

	@ManyToOne
	@JoinColumn(name = "salary_id")
	private Salary salary;

	private String emergencyContactNumber;

	private String contactNumber;

	private String contactNote;

	private String resume;

	private String offerLetter;

	private String joiningLetter;

	private String contractAgreement;

	private String identityProof;

	@ManyToOne
	@JoinColumn(name = "contract_type_id")
	private ContractType contractType;

	private String maritalStatus;

	private Integer numberOfChildren;

	// Self-reference for manager
	@JsonIgnoreProperties({
		"manager",
		"coach",
		"teamMembers",
		"mentees",
		"leaveRequests",
		"attendances",
		"payrolls",
		"performanceReviews",
		"documents",
		"mentorshipsAsMentor",
		"mentorshipsAsMentee",
		"teams",
		"managedTeams",
		"skills"
	})
	@ManyToOne
	@JoinColumn(name = "manager_id")
	private Employee manager;

	// Self-reference for coach (optional)
	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "coach_id")
	private Employee coach;

	// Reverse relationships

	@JsonIgnore
	@OneToMany(mappedBy = "manager")
	private List<Employee> teamMembers;

	@JsonIgnore
	@OneToMany(mappedBy = "coach")
	private List<Employee> mentees;

	@JsonIgnore
	@OneToMany(mappedBy = "employee")
	private List<LeaveRequest> leaveRequests;

	@JsonIgnore
	@OneToMany(mappedBy = "employee")
	private List<Attendance> attendances;

	@JsonIgnore
	@OneToMany(mappedBy = "employee")
	private List<Payroll> payrolls;

	@JsonIgnore
	@OneToMany(mappedBy = "employee")
	private List<PerformanceReview> performanceReviews;

	@JsonIgnore
	@OneToMany(mappedBy = "employee")
	private List<Document> documents;


	@JsonIgnore
	@OneToMany(mappedBy = "mentor")
	private List<Mentorship> mentorshipsAsMentor;

	@JsonIgnore
	@OneToMany(mappedBy = "mentee")
	private List<Mentorship> mentorshipsAsMentee;

	@JsonIgnore
	@ManyToMany(mappedBy = "members")
	   private List<Team> teams; // teams the employee is a member of

	@JsonIgnore
	@OneToMany(mappedBy = "manager")
	   private List<Team> managedTeams; // teams the employee manages

	@CreationTimestamp
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;
}
