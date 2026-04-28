package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Training;
import com.dev.delta.entities.TypeTraining;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TrainingRepository;
import com.dev.delta.repositories.TypeTrainingRepository;

@Service
@Transactional
public class TraningService {
	/**
	 * trainingRepository
	 */
	@Autowired
	private TrainingRepository trainingRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private TypeTrainingRepository typeTrainingRepository;

	/**
	 * getTrainings
	 * 
	 * @return
	 */
	public List<Training> getTrainings() {
		return trainingRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return trainingRepository.count();
	}

	/**
	 * save
	 * 
	 * @param training
	 */
	public Training save(Training training) {
		training.setEmployee(resolveEmployee(training.getEmployee()));
		training.setTypetraining(resolveTypeTraining(training.getTypetraining()));
		return trainingRepository.save(training);
	}

	public Training update(Long id, Training trainingDetails) {
		Training training = findById(id);
		training.setTypetraining(resolveTypeTraining(trainingDetails.getTypetraining()));
		training.setName(trainingDetails.getName());
		training.setEmployee(resolveEmployee(trainingDetails.getEmployee()));
		training.setStartDate(trainingDetails.getStartDate());
		training.setEndDate(trainingDetails.getEndDate());
		training.setDescription(trainingDetails.getDescription());
		return trainingRepository.save(training);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Training findById(Long id) {
		return trainingRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		trainingRepository.deleteById(id);
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}

	private TypeTraining resolveTypeTraining(TypeTraining typeTraining) {
		if (typeTraining == null || typeTraining.getId() == null) {
			return null;
		}

		return typeTrainingRepository.findById(typeTraining.getId()).orElseThrow();
	}
}
