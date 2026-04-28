
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

import com.dev.delta.entities.EducationLevel;
import com.dev.delta.services.EducationLevelService;


@RestController
@RequestMapping("/educationLevel")
@CrossOrigin
@Tag(name = "EducationLevel", description = "EducationLevel management APIs")
public class EducationLevelController {
	@Autowired
	EducationLevelService educationLevelService;

	@Operation(summary = "Create a new education level")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody EducationLevel projectEducationLevel, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		EducationLevel newPT = educationLevelService.save(projectEducationLevel);

		return new ResponseEntity<EducationLevel>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all education levels")
	@GetMapping("/all")
	public Iterable<EducationLevel> getAllEducationLevels() {
		return educationLevelService.getEducationLevels();
	}

	@Operation(summary = "Update education level by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateEducationLevel(@PathVariable Long id,
			@Validated @RequestBody EducationLevel projectEducationLevel, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		EducationLevel updatedEducationLevel = educationLevelService.update(id, projectEducationLevel);

		return new ResponseEntity<EducationLevel>(updatedEducationLevel, HttpStatus.OK);
	}

	@Operation(summary = "Get education level by ID")
	@GetMapping("/{id}")
	public ResponseEntity<EducationLevel> getEducationLevelById(@PathVariable Long id) {
		EducationLevel educationLevel = educationLevelService.findById(id);
		return new ResponseEntity<EducationLevel>(educationLevel, HttpStatus.OK);
	}

	@Operation(summary = "Delete education level by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteEducationLevel(@PathVariable Long id) {
		educationLevelService.delete(id);
		return new ResponseEntity<String>("educationLevel was deleted", HttpStatus.OK);
	}
}
