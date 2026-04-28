
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

import com.dev.delta.entities.Job;
import com.dev.delta.services.JobService;


@RestController
@RequestMapping("/job")
@CrossOrigin
@Tag(name = "Job", description = "Job management APIs")
public class JobController {
	@Autowired
	JobService jobService;

	@Operation(summary = "Create a new job")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Job projectJob, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Job newPT = jobService.save(projectJob);

		return new ResponseEntity<Job>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all jobs")
	@GetMapping("/all")
	public Iterable<Job> getAllJobs() {
		return jobService.getJobs();
	}

	@Operation(summary = "Update job by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateJob(@PathVariable Long id, @Validated @RequestBody Job projectJob,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Job updatedJob = jobService.update(id, projectJob);

		return new ResponseEntity<Job>(updatedJob, HttpStatus.OK);
	}

	@Operation(summary = "Get job by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Job> getJobById(@PathVariable Long id) {
		Job job = jobService.findById(id);
		return new ResponseEntity<Job>(job, HttpStatus.OK);
	}

	@Operation(summary = "Delete job by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteJob(@PathVariable Long id) {
		jobService.delete(id);
		return new ResponseEntity<String>("job was deleted", HttpStatus.OK);
	}
}
