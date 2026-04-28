
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.delta.entities.Meeting;
import com.dev.delta.services.MeetingService;


@RestController
@RequestMapping("/meeting")
@CrossOrigin
@Tag(name = "Meeting", description = "Meeting management APIs")
public class MeetingController {
	@Autowired
	MeetingService meetingService;

	@Operation(summary = "Create a new meeting")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Meeting projectMeeting, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Meeting newPT = meetingService.save(projectMeeting);

		return new ResponseEntity<Meeting>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all meetings")
	@GetMapping("/all")
	public Iterable<Meeting> getAllMeetings() {
		return meetingService.getMeetings();
	}

	@Operation(summary = "Get meeting by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Meeting> getMeetingById(@PathVariable Long id) {
		Meeting meeting = meetingService.findById(id);
		return new ResponseEntity<Meeting>(meeting, HttpStatus.OK);
	}

	@Operation(summary = "Delete meeting by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteMeeting(@PathVariable Long id) {
		meetingService.delete(id);
		return new ResponseEntity<String>("meeting was deleted", HttpStatus.OK);
	}
}
