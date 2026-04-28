
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

import com.dev.delta.entities.Announcement;
import com.dev.delta.services.AnnoucementService;


@RestController
@RequestMapping("/announcement")
@CrossOrigin
@Tag(name = "Announcement", description = "Announcement management APIs")
public class AnnouncementController {
	@Autowired
	AnnoucementService announcementService;


	@Operation(summary = "Create a new announcement")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Announcement projectAnnouncement, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Announcement newPT = announcementService.save(projectAnnouncement);

		return new ResponseEntity<Announcement>(newPT, HttpStatus.CREATED);
	}


	@Operation(summary = "Get all announcements")
	@GetMapping("/all")
	public Iterable<Announcement> getAllAnnouncements() {
		return announcementService.getAnnouncements();
	}

	@Operation(summary = "Update announcement by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateAnnouncement(@PathVariable Long id,
			@Validated @RequestBody Announcement projectAnnouncement, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Announcement updatedAnnouncement = announcementService.update(id, projectAnnouncement);

		return new ResponseEntity<Announcement>(updatedAnnouncement, HttpStatus.OK);
	}


	@Operation(summary = "Get announcement by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Announcement> getAnnouncementById(@PathVariable Long id) {
		Announcement announcement = announcementService.findById(id);
		return new ResponseEntity<Announcement>(announcement, HttpStatus.OK);
	}


	@Operation(summary = "Delete announcement by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteAnnouncement(@PathVariable Long id) {
		announcementService.delete(id);
		return new ResponseEntity<String>("announcement was deleted", HttpStatus.OK);
	}
}
