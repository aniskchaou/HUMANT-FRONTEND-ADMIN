package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.AdvanceSalary;
import com.dev.delta.entities.Employee;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.AdvanceSalaryRepository;
@Service
public class AdvanceSalaryService {
	/**
	 * adavanceSalaryRepository
	 */
	@Autowired
	private AdvanceSalaryRepository adavanceSalaryRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	/**
	 * getAdvanceSalarys
	 * 
	 * @return
	 */
	public List<AdvanceSalary> getAdvanceSalarys() {
		return adavanceSalaryRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return adavanceSalaryRepository.count();
	}

	/**
	 * save
	 * 
	 * @param adavanceSalary
	 */
	public AdvanceSalary save(AdvanceSalary adavanceSalary) {
		adavanceSalary.setEmployeeName(resolveEmployee(adavanceSalary.getEmployeeName()));
		return adavanceSalaryRepository.save(adavanceSalary);
	}

	public AdvanceSalary update(Long id, AdvanceSalary advanceSalaryDetails) {
		AdvanceSalary advanceSalary = findById(id);
		advanceSalary.setReason(advanceSalaryDetails.getReason());
		advanceSalary.setEmployeeName(resolveEmployee(advanceSalaryDetails.getEmployeeName()));
		advanceSalary.setAmount(advanceSalaryDetails.getAmount());
		advanceSalary.setDate(advanceSalaryDetails.getDate());
		advanceSalary.setRemarks(advanceSalaryDetails.getRemarks());
		return adavanceSalaryRepository.save(advanceSalary);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public AdvanceSalary findById(Long id) {
		return adavanceSalaryRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		adavanceSalaryRepository.delete(adavanceSalaryRepository.findById(id).get());
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}
}
