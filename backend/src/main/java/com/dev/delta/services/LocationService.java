package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Location;
import com.dev.delta.repositories.LocationRepository;
@Service
public class LocationService {
	/**
	 * locationRepository
	 */
	@Autowired
	private LocationRepository locationRepository;

	/**
	 * getLocations
	 * 
	 * @return
	 */
	public List<Location> getLocations() {
		return locationRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return locationRepository.count();
	}

	/**
	 * save
	 * 
	 * @param location
	 */
	public Location save(Location location) {
		return locationRepository.save(location);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Location findById(Long id) {
		return locationRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		locationRepository.delete(locationRepository.findById(id).get());
	}
}
