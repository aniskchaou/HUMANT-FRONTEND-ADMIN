
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

import com.dev.delta.entities.Trainer;
import com.dev.delta.services.TrainerService;


@RestController
@RequestMapping("/trainer")
@CrossOrigin
@Tag(name = "Trainer", description = "Trainer management APIs")
public class TrainerController {
	@Autowired
	TrainerService trainerService;

	@Operation(summary = "Create a new trainer")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Trainer projectTrainer, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Trainer newPT = trainerService.save(projectTrainer);

		return new ResponseEntity<Trainer>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all trainers")
	@GetMapping("/all")
	public Iterable<Trainer> getAllTrainers() {
		return trainerService.getTrainers();
	}

	@Operation(summary = "Get trainer by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Trainer> getTrainerById(@PathVariable Long id) {
		Trainer trainer = trainerService.findById(id);
		return new ResponseEntity<Trainer>(trainer, HttpStatus.OK);
	}

	@Operation(summary = "Delete trainer by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteTrainer(@PathVariable Long id) {
		trainerService.delete(id);
		return new ResponseEntity<String>("trainer was deleted", HttpStatus.OK);
	}
}
