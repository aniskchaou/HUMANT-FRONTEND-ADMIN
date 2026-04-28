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

import com.dev.delta.entities.Resignation;
import com.dev.delta.services.ResignationService;

@RestController
@RequestMapping("/resignation")
@CrossOrigin
@Tag(name = "Resignation", description = "Resignation management APIs")
public class ResignationController {
	@Autowired
	ResignationService resignationService;

	@Operation(summary = "Create a new resignation")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Resignation projectResignation, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Resignation newPT = resignationService.save(projectResignation);

		return new ResponseEntity<Resignation>(newPT, HttpStatus.CREATED);
	}


	@Operation(summary = "Get all resignations")
	@GetMapping("/all")
	public Iterable<Resignation> getAllResignations() {
		return resignationService.getResignations();
	}


	@Operation(summary = "Get resignation by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Resignation> getResignationById(@PathVariable Long id) {
		Resignation resignation = resignationService.findById(id);
		return new ResponseEntity<Resignation>(resignation, HttpStatus.OK);
	}

	@Operation(summary = "Delete resignation by ID")
	@DeleteMapping("/delete/{id}")
	public void deleteResignation(@PathVariable Long id) {
		resignationService.delete(id);
		//return new ResponseEntity<String>("resignation was deleted", HttpStatus.OK);
	}

	@Operation(summary = "Update resignation by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateResignation(
			@PathVariable Long id,
			@Validated @RequestBody Resignation resignationDetails,
			BindingResult result
	) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Resignation updatedResignation = resignationService.update(id, resignationDetails);
		return new ResponseEntity<Resignation>(updatedResignation, HttpStatus.OK);
	}
}
