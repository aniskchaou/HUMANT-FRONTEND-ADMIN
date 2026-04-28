package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Position;
import com.dev.delta.repositories.PositionRepository;
@Service
public class PositionService {
	/**
	 * positionRepository
	 */
	@Autowired
	private PositionRepository positionRepository;

	/**
	 * getPositions
	 * 
	 * @return
	 */
	public List<Position> getPositions() {
		return positionRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return positionRepository.count();
	}

	/**
	 * save
	 * 
	 * @param position
	 */
	public Position save(Position position) {
		return positionRepository.save(position);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Position findById(Long id) {
		return positionRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		positionRepository.delete(positionRepository.findById(id).get());
	}
}
