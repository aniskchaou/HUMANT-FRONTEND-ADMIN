package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Complain;
import com.dev.delta.repositories.ComplainRepository;
@Service
public class ComplainService {
	/**
	 * complainRepository
	 */
	@Autowired
	private ComplainRepository complainRepository;

	/**
	 * getComplains
	 * 
	 * @return
	 */
	public List<Complain> getComplains() {
		return complainRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return complainRepository.count();
	}

	/**
	 * save
	 * 
	 * @param complain
	 */
	public Complain save(Complain complain) {
		return complainRepository.save(complain);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Complain findById(Long id) {
		return complainRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		complainRepository.delete(complainRepository.findById(id).get());
	}
}
