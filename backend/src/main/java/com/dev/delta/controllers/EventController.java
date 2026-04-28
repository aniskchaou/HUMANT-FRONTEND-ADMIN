
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.delta.entities.Event;
import com.dev.delta.services.EventService;


@RestController
@RequestMapping("/event")
@CrossOrigin
@Tag(name = "Event", description = "Event management APIs")
public class EventController {
	@Autowired
	EventService eventService;

	@Operation(summary = "Create a new event")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Event projectEvent, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Event newPT = eventService.save(projectEvent);

		return new ResponseEntity<Event>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all events")
	@GetMapping("/all")
	public Iterable<Event> getAllEvents() {
		return eventService.getEvents();
	}

	@Operation(summary = "Update event by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateEvent(@PathVariable Long id, @Validated @RequestBody Event projectEvent,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Event updatedEvent = eventService.update(id, projectEvent);

		return new ResponseEntity<Event>(updatedEvent, HttpStatus.OK);
	}

	@Operation(summary = "Get event by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Event> getEventById(@PathVariable Long id) {
		Event event = eventService.findById(id);
		return new ResponseEntity<Event>(event, HttpStatus.OK);
	}

	@Operation(summary = "Delete event by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
		eventService.delete(id);
		return new ResponseEntity<String>("event was deleted", HttpStatus.OK);
	}
}
