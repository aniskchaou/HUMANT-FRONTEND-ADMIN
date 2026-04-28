package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.delta.entities.Event;
import com.dev.delta.repositories.EventRepository;

@Service
@Transactional
public class EventService {
	/**
	 * eventRepository
	 */
	@Autowired
	private EventRepository eventRepository;

	/**
	 * getEvents
	 * 
	 * @return
	 */
	public List<Event> getEvents() {
		return eventRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return eventRepository.count();
	}

	/**
	 * save
	 * 
	 * @param event
	 */
	public Event save(Event event) {
	  return	eventRepository.save(event);
	}

	public Event update(Long id, Event eventDetails) {
		Event event = findById(id);
		event.setEventTitle(eventDetails.getEventTitle());
		event.setEventDateTime(eventDetails.getEventDateTime());
		event.setEventNote(eventDetails.getEventNote());
		return eventRepository.save(event);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Event findById(Long id) {
		return eventRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		eventRepository.delete(eventRepository.findById(id).get());
	}
}
