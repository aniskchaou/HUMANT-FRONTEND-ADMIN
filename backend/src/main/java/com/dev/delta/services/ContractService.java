package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.delta.entities.ContractType;
import com.dev.delta.entities.Contract;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.ContractTypeRepository;
import com.dev.delta.repositories.ContractRepository;
import com.dev.delta.repositories.EmployeeRepository;

@Service
@Transactional
public class ContractService {

	/**
	 * contractRepository
	 */
	@Autowired
	private ContractRepository contractRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private ContractTypeRepository contractTypeRepository;

	/**
	 * getCitys
	 * 
	 * @return
	 */
	public List<Contract> getContracts() {
		return contractRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return contractRepository.count();
	}

	/**
	 * save
	 * 
	 * @param projectContract
	 * @return 
	 */
	public Contract save(Contract projectContract) {
		projectContract.setEmployee(resolveEmployee(projectContract.getEmployee()));
		projectContract.setContractType(resolveContractType(projectContract.getContractType()));
		return contractRepository.save(projectContract);
	}

	public Contract update(Long id, Contract contractDetails) {
		Contract contract = findById(id);
		contract.setEmployee(resolveEmployee(contractDetails.getEmployee()));
		contract.setSubject(contractDetails.getSubject());
		contract.setContractValue(contractDetails.getContractValue());
		contract.setContractType(resolveContractType(contractDetails.getContractType()));
		contract.setStartDate(contractDetails.getStartDate());
		contract.setEndDate(contractDetails.getEndDate());
		contract.setDescription(contractDetails.getDescription());
		contract.setStatus(contractDetails.getStatus());
		contract.setJob(contractDetails.getJob());
		contract.setDepartement(contractDetails.getDepartement());
		contract.setSalaryStructureType(contractDetails.getSalaryStructureType());
		contract.setWorkingSchedule(contractDetails.getWorkingSchedule());
		return contractRepository.save(contract);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Contract findById(Long id) {
		return contractRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		contractRepository.delete(contractRepository.findById(id).get());
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}

	private ContractType resolveContractType(ContractType contractType) {
		if (contractType == null || contractType.getId() == null) {
			return null;
		}

		return contractTypeRepository.findById(contractType.getId()).orElseThrow();
	}
}
