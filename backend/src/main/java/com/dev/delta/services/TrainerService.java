package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Trainer;
import com.dev.delta.repositories.TrainerRepository;
@Service
public class TrainerService {
	/**
	 * trainerRepository
	 */
	@Autowired
	private TrainerRepository trainerRepository;

	/**
	 * getTrainers
	 * 
	 * @return
	 */
	public List<Trainer> getTrainers() {
		return trainerRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return trainerRepository.count();
	}

	/**
	 * save
	 * 
	 * @param trainer
	 */
	public Trainer save(Trainer trainer) {
		return trainerRepository.save(trainer);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Trainer findById(Long id) {
		return trainerRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		trainerRepository.delete(trainerRepository.findById(id).get());
	}
}
