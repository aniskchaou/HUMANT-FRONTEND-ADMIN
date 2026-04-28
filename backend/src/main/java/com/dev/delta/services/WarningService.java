package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Warning;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.WarningRepository;
@Service
public class WarningService {
	/**
	 * warningRepository
	 */
	@Autowired
	private WarningRepository warningRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	/**
	 * getWarnings
	 * 
	 * @return
	 */
	public List<Warning> getWarnings() {
		return warningRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return warningRepository.count();
	}

	/**
	 * save
	 * 
	 * @param warning
	 * @return 
	 */
	public Warning save(Warning warning) {
		warning.setAgainst(resolveEmployee(warning.getAgainst()));
		return warningRepository.save(warning);
	}

	public Warning update(Long id, Warning warningDetails) {
		Warning warning = findById(id);
		warning.setAgainst(resolveEmployee(warningDetails.getAgainst()));
		warning.setWarningTitle(warningDetails.getWarningTitle());
		warning.setWarningDate(warningDetails.getWarningDate());
		warning.setDescription(warningDetails.getDescription());
		return warningRepository.save(warning);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Warning findById(Long id) {
		return warningRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		warningRepository.delete(warningRepository.findById(id).get());
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}
}
