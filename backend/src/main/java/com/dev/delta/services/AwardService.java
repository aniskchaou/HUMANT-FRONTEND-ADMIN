package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.delta.entities.Award;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.TypeAward;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.AwardRepository;

import com.dev.delta.repositories.TypeAwardRepository;

@Service
@Transactional
public class AwardService {
	/**
	 * awardRepository
	 */
	@Autowired
	private AwardRepository awardRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private TypeAwardRepository typeAwardRepository;

	/**
	 * getAwards
	 * 
	 * @return
	 */
	public List<Award> getAwards() {
		return awardRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return awardRepository.count();
	}

	/**
	 * save
	 * 
	 * @param award
	 * @return 
	 */
	public Award save(Award award) {
		award.setEmployeeName(resolveEmployee(award.getEmployeeName()));
		award.setAwardType(resolveTypeAward(award.getAwardType()));
		return awardRepository.save(award);
	}

	public Award update(Long id, Award awardDetails) {
		Award award = findById(id);
		award.setEmployeeName(resolveEmployee(awardDetails.getEmployeeName()));
		award.setAwardType(resolveTypeAward(awardDetails.getAwardType()));
		award.setAwardDate(awardDetails.getAwardDate());
		award.setDescription(awardDetails.getDescription());
		return awardRepository.save(award);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Award findById(Long id) {
		return awardRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		awardRepository.delete(awardRepository.findById(id).get());
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}

	private TypeAward resolveTypeAward(TypeAward typeAward) {
		if (typeAward == null || typeAward.getId() == null) {
			return null;
		}

		return typeAwardRepository.findById(typeAward.getId()).orElseThrow();
	}
}
