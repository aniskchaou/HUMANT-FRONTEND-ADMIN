package com.dev.delta.controllers;

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

import com.dev.delta.entities.Designation;
import com.dev.delta.services.DesignationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/designation")
@CrossOrigin
@Tag(name = "Designation", description = "Designation management APIs")
public class DesignationController {
	@Autowired
	DesignationService designationService;

	@Operation(summary = "Create a new designation")
	@PostMapping("/create")
	public ResponseEntity<?> createDesignation(@Validated @RequestBody Designation designation, BindingResult result) {
		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}

			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Designation createdDesignation = designationService.save(designation);
		return new ResponseEntity<Designation>(createdDesignation, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all designations")
	@GetMapping("/all")
	public Iterable<Designation> getAllDesignations() {
		return designationService.getDesignations();
	}

	@Operation(summary = "Update designation by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateDesignation(@PathVariable Long id, @Validated @RequestBody Designation designation,
			BindingResult result) {
		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}

			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Designation updatedDesignation = designationService.update(id, designation);
		return new ResponseEntity<Designation>(updatedDesignation, HttpStatus.OK);
	}

	@Operation(summary = "Get designation by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Designation> getDesignationById(@PathVariable Long id) {
		Designation designation = designationService.findById(id);
		return new ResponseEntity<Designation>(designation, HttpStatus.OK);
	}

	@Operation(summary = "Delete designation by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteDesignation(@PathVariable Long id) {
		designationService.delete(id);
		return new ResponseEntity<String>("designation was deleted", HttpStatus.OK);
	}
}