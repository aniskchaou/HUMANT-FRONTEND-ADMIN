package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.TypeLeave;
import com.dev.delta.repositories.TypeLeaveRepository;
@Service
public class TypeLeaveService {
	/**
	 * typeLeaveRepository
	 */
	@Autowired
	private TypeLeaveRepository typeLeaveRepository;

	/**
	 * getTypeLeaves
	 * 
	 * @return
	 */
	public List<TypeLeave> getTypeLeaves() {
		return typeLeaveRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return typeLeaveRepository.count();
	}

	/**
	 * save
	 * 
	 * @param typeLeave
	 */
	public TypeLeave save(TypeLeave typeLeave) {
		return typeLeaveRepository.save(typeLeave);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public TypeLeave findById(Long id) {
		return typeLeaveRepository.findById(id).orElseThrow();
	}

	public TypeLeave update(Long id, TypeLeave typeLeaveDetails) {
		TypeLeave typeLeave = findById(id);
		typeLeave.setName(typeLeaveDetails.getName());
		typeLeave.setDays(typeLeaveDetails.getDays());
		return typeLeaveRepository.save(typeLeave);
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		typeLeaveRepository.delete(typeLeaveRepository.findById(id).get());
	}
}
