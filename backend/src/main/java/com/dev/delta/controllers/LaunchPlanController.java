package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

import com.dev.delta.entities.Objective;
import com.dev.delta.services.ObjectiveService;

@RestController
@RequestMapping("/launchplan")
@CrossOrigin
@Tag(name = "LaunchPlan", description = "Launch plan management APIs")
public class LaunchPlanController {
	@Autowired
	private ObjectiveService objectiveService;

	@Operation(summary = "Create a new launch plan")
	@PostMapping("/create")
	public ResponseEntity<?> createLaunchPlan(@Validated @RequestBody Objective launchPlan, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Objective savedLaunchPlan = objectiveService.save(launchPlan);
		return new ResponseEntity<Objective>(savedLaunchPlan, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all launch plans")
	@GetMapping("/all")
	public Iterable<Objective> getAllLaunchPlans() {
		return objectiveService.findAll();
	}

	@Operation(summary = "Update launch plan by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateLaunchPlan(@PathVariable Long id, @Validated @RequestBody Objective launchPlan,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Optional<Objective> launchPlanOptional = objectiveService.findById(id);
		if (!launchPlanOptional.isPresent()) {
			return ResponseEntity.notFound().build();
		}

		Objective existingLaunchPlan = launchPlanOptional.get();
		existingLaunchPlan.setTitle(launchPlan.getTitle());
		existingLaunchPlan.setDescription(launchPlan.getDescription());
		existingLaunchPlan.setStartDate(launchPlan.getStartDate());
		existingLaunchPlan.setEndDate(launchPlan.getEndDate());
		existingLaunchPlan.setStatus(launchPlan.getStatus());
		existingLaunchPlan.setEmployee(launchPlan.getEmployee());

		Objective updatedLaunchPlan = objectiveService.save(existingLaunchPlan);
		return new ResponseEntity<Objective>(updatedLaunchPlan, HttpStatus.OK);
	}

	@Operation(summary = "Get launch plan by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Objective> getLaunchPlanById(@PathVariable Long id) {
		Optional<Objective> launchPlan = objectiveService.findById(id);
		return launchPlan.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@Operation(summary = "Delete launch plan by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteLaunchPlan(@PathVariable Long id) {
		if (!objectiveService.findById(id).isPresent()) {
			return new ResponseEntity<String>("launch plan not found", HttpStatus.NOT_FOUND);
		}

		objectiveService.deleteById(id);
		return new ResponseEntity<String>("launch plan was deleted", HttpStatus.OK);
	}
}