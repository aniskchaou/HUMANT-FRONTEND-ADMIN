package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.dev.delta.entities.Departement;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Resignation;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.ResignationRepository;
@Service
public class ResignationService {
	/**
	 * resignationRepository
	 */
	@Autowired
	private ResignationRepository resignationRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private DepartementRepository departementRepository;

	@Autowired
	private EmployeeContextService employeeContextService;

	/**
	 * getResignations
	 * 
	 * @return
	 */
	public List<Resignation> getResignations() {
		if (employeeContextService.isEmployeeOnlyRole()) {
			Employee currentEmployee = employeeContextService.getCurrentEmployeeOrThrow();
			return resignationRepository.findAllByEmployeeNameIdOrderByResignationDateDescIdDesc(currentEmployee.getId());
		}

		return resignationRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return resignationRepository.count();
	}

	/**
	 * save
	 * 
	 * @param resignation
	 */
	public Resignation save(Resignation resignation) {
		Employee employee = resolveEmployeeForSave(resignation.getEmployeeName());
		resignation.setEmployeeName(employee);
		resignation.setDepartement(resolveDepartementForSave(resignation.getDepartement(), employee));
		return resignationRepository.save(resignation);
	}

	public Resignation update(Long id, Resignation resignationDetails) {
		Resignation resignation = findById(id);

		Employee employee = employeeContextService.isEmployeeOnlyRole()
			? resignation.getEmployeeName()
			: resolveEmployee(resignationDetails.getEmployeeName());

		resignation.setEmployeeName(employee);
		resignation.setDepartement(resolveDepartementForSave(resignationDetails.getDepartement(), employee));
		resignation.setResignationDate(resignationDetails.getResignationDate());
		resignation.setResignationReason(resignationDetails.getResignationReason());
		return resignationRepository.save(resignation);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Resignation findById(Long id) {
		Resignation resignation = resignationRepository.findById(id).orElseThrow();

		if (!canAccess(resignation.getEmployeeName())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this resignation record.");
		}

		return resignation;
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		Resignation resignation = findById(id);
		resignationRepository.deleteById(resignation.getId());
	}

	private Employee resolveEmployeeForSave(Employee employee) {
		if (employeeContextService.isEmployeeOnlyRole()) {
			return employeeContextService.getCurrentEmployeeOrThrow();
		}

		return resolveEmployee(employee);
	}

	private Departement resolveDepartementForSave(Departement departement, Employee employee) {
		if (employeeContextService.isEmployeeOnlyRole()) {
			return employee != null ? employee.getDepartment() : null;
		}

		return resolveDepartement(departement);
	}

	private boolean canAccess(Employee employee) {
		return employeeContextService.canAccessEmployee(employee);
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}

	private Departement resolveDepartement(Departement departement) {
		if (departement == null || departement.getId() == null) {
			return null;
		}

		return departementRepository.findById(departement.getId()).orElseThrow();
	}
}
