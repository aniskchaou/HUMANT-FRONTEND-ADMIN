package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.TypeTermination;
import com.dev.delta.repositories.TypeTerminationRepository;
@Service
public class TypeTerminationService {
	/**
	 * typeTerminationRepository
	 */
	@Autowired
	private TypeTerminationRepository typeTerminationRepository;

	/**
	 * getTypeTerminations
	 * 
	 * @return
	 */
	public List<TypeTermination> getTypeTerminations() {
		return typeTerminationRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return typeTerminationRepository.count();
	}

	/**
	 * save
	 * 
	 * @param typeTermination
	 */
	public TypeTermination save(TypeTermination typeTermination) {
	  return	typeTerminationRepository.save(typeTermination);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public TypeTermination findById(Long id) {
		return typeTerminationRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		typeTerminationRepository.delete(typeTerminationRepository.findById(id).get());
	}
}
