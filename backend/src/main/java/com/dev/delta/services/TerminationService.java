package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Termination;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TerminationRepository;
@Service
public class TerminationService {
	/**
	 * terminationRepository
	 */
	@Autowired
	private TerminationRepository terminationRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	/**
	 * getTerminations
	 * 
	 * @return
	 */
	public List<Termination> getTerminations() {
		return terminationRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return terminationRepository.count();
	}

	/**
	 * save
	 * 
	 * @param termination
	 */
	public Termination save(Termination termination) {
		termination.setName(resolveEmployee(termination.getName()));
		return terminationRepository.save(termination);
	}

	public Termination update(Long id, Termination terminationDetails) {
		Termination termination = findById(id);
		termination.setTypeTermination(terminationDetails.getTypeTermination());
		termination.setReason(terminationDetails.getReason());
		termination.setName(resolveEmployee(terminationDetails.getName()));
		termination.setNoticeDate(terminationDetails.getNoticeDate());
		termination.setTerminationDate(terminationDetails.getTerminationDate());
		termination.setDescription(terminationDetails.getDescription());
		return terminationRepository.save(termination);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Termination findById(Long id) {
		return terminationRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		terminationRepository.deleteById(id);
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}
}
