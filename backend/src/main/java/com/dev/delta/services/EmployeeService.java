package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.EmployeeRepository;
@Service
public class EmployeeService {
	/**
	 * employeeRepository
	 */
	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private TransferCompletionSyncService transferCompletionSyncService;

	@Autowired
	private EmployeeContextService employeeContextService;

	/**
	 * getEmployees
	 * 
	 * @return
	 */
	public List<Employee> getEmployees() {
		transferCompletionSyncService.synchronizeAllCompletedTransfers();
		return employeeRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return employeeRepository.count();
	}

	/**
	 * save
	 * 
	 * @param employee
	 */
	public Employee save(Employee employee) {
		return employeeRepository.save(employee);
	}

	public Employee findCurrentEmployee() {
		transferCompletionSyncService.synchronizeAllCompletedTransfers();
		return employeeContextService.getCurrentEmployeeOrThrow();
	}

	public Employee updateCurrentEmployeeProfile(Employee employeeDetails) {
		Employee employee = findCurrentEmployee();

		employee.setFullName(defaultText(employeeDetails.getFullName(), employee.getFullName()));
		employee.setPhone(defaultText(employeeDetails.getPhone(), employee.getPhone()));
		employee.setBirthDay(employeeDetails.getBirthDay() != null ? employeeDetails.getBirthDay() : employee.getBirthDay());
		employee.setGender(defaultText(employeeDetails.getGender(), employee.getGender()));
		employee.setPresentAddress(defaultText(employeeDetails.getPresentAddress(), employee.getPresentAddress()));
		employee.setPermanentAddress(defaultText(employeeDetails.getPermanentAddress(), employee.getPermanentAddress()));
		employee.setPhoto(defaultText(employeeDetails.getPhoto(), employee.getPhoto()));
		employee.setNote(defaultText(employeeDetails.getNote(), employee.getNote()));
		employee.setEmergencyContactNumber(
			defaultText(employeeDetails.getEmergencyContactNumber(), employee.getEmergencyContactNumber())
		);
		employee.setContactNumber(defaultText(employeeDetails.getContactNumber(), employee.getContactNumber()));
		employee.setContactNote(defaultText(employeeDetails.getContactNote(), employee.getContactNote()));
		employee.setMaritalStatus(defaultText(employeeDetails.getMaritalStatus(), employee.getMaritalStatus()));
		employee.setNumberOfChildren(
			employeeDetails.getNumberOfChildren() != null ? employeeDetails.getNumberOfChildren() : employee.getNumberOfChildren()
		);

		return employeeRepository.save(employee);
	}

	public Employee update(Long id, Employee employeeDetails) {
		Employee employee = findById(id);

		employee.setFullName(employeeDetails.getFullName());
		employee.setPhone(employeeDetails.getPhone());
		employee.setBirthDay(employeeDetails.getBirthDay());
		employee.setGender(employeeDetails.getGender());
		employee.setPresentAddress(employeeDetails.getPresentAddress());
		employee.setPermanentAddress(employeeDetails.getPermanentAddress());
		employee.setPhoto(employeeDetails.getPhoto());
		employee.setNote(employeeDetails.getNote());
		employee.setRole(employeeDetails.getRole());
		employee.setJobPosition(employeeDetails.getJobPosition());
		employee.setDepartment(employeeDetails.getDepartment());
		employee.setJob(employeeDetails.getJob());
		employee.setJoiningDate(employeeDetails.getJoiningDate());
		employee.setSalary(employeeDetails.getSalary());
		employee.setEmergencyContactNumber(employeeDetails.getEmergencyContactNumber());
		employee.setContactNumber(employeeDetails.getContactNumber());
		employee.setContactNote(employeeDetails.getContactNote());
		employee.setResume(employeeDetails.getResume());
		employee.setOfferLetter(employeeDetails.getOfferLetter());
		employee.setJoiningLetter(employeeDetails.getJoiningLetter());
		employee.setContractAgreement(employeeDetails.getContractAgreement());
		employee.setIdentityProof(employeeDetails.getIdentityProof());
		employee.setContractType(employeeDetails.getContractType());
		employee.setManager(employeeDetails.getManager());
		employee.setCoach(employeeDetails.getCoach());
		employee.setMaritalStatus(employeeDetails.getMaritalStatus());
		employee.setNumberOfChildren(employeeDetails.getNumberOfChildren());

		return employeeRepository.save(employee);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Employee findById(Long id) {
		transferCompletionSyncService.synchronizeAllCompletedTransfers();
		return employeeRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		employeeRepository.delete(employeeRepository.findById(id).get());
	}

	private String defaultText(String value, String fallback) {
		String normalizedValue = normalizeText(value);
		return normalizedValue.isEmpty() ? fallback : normalizedValue;
	}

	private String normalizeText(String value) {
		return value == null ? "" : value.trim();
	}
}
