package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.delta.entities.TypeTraining;
import com.dev.delta.repositories.TypeTrainingRepository;

@Service
@Transactional
public class TypeTrainingService {
	/**
	 * typeTrainingRepository
	 */
	@Autowired
	private TypeTrainingRepository typeTrainingRepository;

	/**
	 * getTypeTrainings
	 * 
	 * @return
	 */
	public List<TypeTraining> getTypeTrainings() {
		return typeTrainingRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return typeTrainingRepository.count();
	}

	/**
	 * save
	 * 
	 * @param typeTraining
	 */
	public TypeTraining save(TypeTraining typeTraining) {
		return typeTrainingRepository.save(typeTraining);
	}

	public TypeTraining update(Long id, TypeTraining typeTrainingDetails) {
		TypeTraining typeTraining = findById(id);
		typeTraining.setName(typeTrainingDetails.getName());
		return typeTrainingRepository.save(typeTraining);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public TypeTraining findById(Long id) {
		return typeTrainingRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		typeTrainingRepository.deleteById(id);
	}
}
