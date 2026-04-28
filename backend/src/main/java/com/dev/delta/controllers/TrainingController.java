
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

import com.dev.delta.entities.Training;
import com.dev.delta.services.TraningService;



@RestController
@RequestMapping("/training")
@CrossOrigin
@Tag(name = "Training", description = "Training management APIs")
public class TrainingController {
	@Autowired
	TraningService trainingService;

	@Operation(summary = "Create a new training")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Training projectTraining, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Training newPT = trainingService.save(projectTraining);

		return new ResponseEntity<Training>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all trainings")
	@GetMapping("/all")
	public Iterable<Training> getAllTrainings() {
		return trainingService.getTrainings();
	}

	@Operation(summary = "Update training by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateTraining(@PathVariable Long id, @Validated @RequestBody Training projectTraining,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Training updatedTraining = trainingService.update(id, projectTraining);

		return new ResponseEntity<Training>(updatedTraining, HttpStatus.OK);
	}

	@Operation(summary = "Get training by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Training> getTrainingById(@PathVariable Long id) {
		Training training = trainingService.findById(id);
		return new ResponseEntity<Training>(training, HttpStatus.OK);
	}

	@Operation(summary = "Delete training by ID")
	@DeleteMapping("/delete/{id}")
	public void deleteTraining(@PathVariable Long id) {
		trainingService.delete(id);
		//return new ResponseEntity<String>("training was deleted", HttpStatus.OK);
	}
}
