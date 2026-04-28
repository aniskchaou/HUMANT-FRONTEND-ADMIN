
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

import com.dev.delta.entities.Award;
import com.dev.delta.services.AwardService;
@RestController
@RequestMapping("/award")
@CrossOrigin
@Tag(name = "Award", description = "Award management APIs")
public class AwardController {
	@Autowired
	AwardService awardService;


	@Operation(summary = "Create a new award")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Award projectAward, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Award newPT = awardService.save(projectAward);

		return new ResponseEntity<Award>(newPT, HttpStatus.CREATED);
	}


	@Operation(summary = "Get all awards")
	@GetMapping("/all")
	public Iterable<Award> getAllAwards() {
		return awardService.getAwards();
	}

	@Operation(summary = "Update award by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateAward(@PathVariable Long id, @Validated @RequestBody Award projectAward,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Award updatedAward = awardService.update(id, projectAward);

		return new ResponseEntity<Award>(updatedAward, HttpStatus.OK);
	}


	@Operation(summary = "Get award by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Award> getAwardById(@PathVariable Long id) {
		Award award = awardService.findById(id);
		return new ResponseEntity<Award>(award, HttpStatus.OK);
	}


	@Operation(summary = "Delete award by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteAward(@PathVariable Long id) {
		awardService.delete(id);
		return new ResponseEntity<String>("award was deleted", HttpStatus.OK);
	}
}
