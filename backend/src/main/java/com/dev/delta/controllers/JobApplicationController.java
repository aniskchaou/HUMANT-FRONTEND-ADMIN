
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

import com.dev.delta.entities.JobApplication;
import com.dev.delta.services.JobAppliactionService;



@RestController
@RequestMapping("/jobApplication")
@CrossOrigin
@Tag(name = "JobApplication", description = "Job Application management APIs")
public class JobApplicationController {
	@Autowired
	JobAppliactionService jobApplicationService;

	@Operation(summary = "Create a new job application")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody JobApplication projectJobApplication, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		JobApplication newPT = jobApplicationService.save(projectJobApplication);

		return new ResponseEntity<JobApplication>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all job applications")
	@GetMapping("/all")
	public Iterable<JobApplication> getAllJobApplications() {
		return jobApplicationService.getJobApplications();
	}

	@Operation(summary = "Get job application by ID")
	@GetMapping("/{id}")
	public ResponseEntity<JobApplication> getJobApplicationById(@PathVariable Long id) {
		JobApplication jobApplication = jobApplicationService.findById(id);
		return new ResponseEntity<JobApplication>(jobApplication, HttpStatus.OK);
	}

	@Operation(summary = "Delete job application by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteJobApplication(@PathVariable Long id) {
		jobApplicationService.delete(id);
		return new ResponseEntity<String>("jobApplication was deleted", HttpStatus.OK);
	}
}
