package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Holiday;
import com.dev.delta.repositories.HolidayRepository;
@Service
public class HolidayService {
	/**
	 * holidayRepository
	 */
	@Autowired
	private HolidayRepository holidayRepository;

	/**
	 * getHolidays
	 * 
	 * @return
	 */
	public List<Holiday> getHolidays() {
		return holidayRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return holidayRepository.count();
	}

	/**
	 * save
	 * 
	 * @param holiday
	 */
	public Holiday save(Holiday holiday) {
		return holidayRepository.save(holiday);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Holiday findById(Long id) {
		return holidayRepository.findById(id).orElseThrow();
	}

	public Holiday update(Long id, Holiday holidayDetails) {
		Holiday holiday = findById(id);
		holiday.setName(holidayDetails.getName());
		holiday.setDate(holidayDetails.getDate());
		holiday.setRecurring(holidayDetails.isRecurring());
		return holidayRepository.save(holiday);
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		holidayRepository.delete(holidayRepository.findById(id).get());
	}
}
