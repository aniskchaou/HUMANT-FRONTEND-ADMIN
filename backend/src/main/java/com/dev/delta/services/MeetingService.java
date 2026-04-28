package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Meeting;
import com.dev.delta.repositories.MeetingRepository;
@Service
public class MeetingService {
	/**
	 * meetingRepository
	 */
	@Autowired
	private MeetingRepository meetingRepository;

	/**
	 * getMeetings
	 * 
	 * @return
	 */
	public List<Meeting> getMeetings() {
		return meetingRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return meetingRepository.count();
	}

	/**
	 * save
	 * 
	 * @param meeting
	 */
	public Meeting save(Meeting meeting) {
		return meetingRepository.save(meeting);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Meeting findById(Long id) {
		return meetingRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		meetingRepository.delete(meetingRepository.findById(id).get());
	}
}
