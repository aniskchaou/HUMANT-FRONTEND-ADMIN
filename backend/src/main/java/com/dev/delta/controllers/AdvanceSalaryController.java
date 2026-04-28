
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

import com.dev.delta.entities.AdvanceSalary;
import com.dev.delta.services.AdvanceSalaryService;

@RestController
@RequestMapping("/advanceSalary")
@CrossOrigin
@Tag(name = "AdvanceSalary", description = "Advance Salary management APIs")
public class AdvanceSalaryController {
	@Autowired
	AdvanceSalaryService advanceSalaryService;


	@Operation(summary = "Create a new AdvanceSalary")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody AdvanceSalary projectAdvanceSalary, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		AdvanceSalary newPT = advanceSalaryService.save(projectAdvanceSalary);

		return new ResponseEntity<AdvanceSalary>(newPT, HttpStatus.CREATED);
	}


	@Operation(summary = "Get all AdvanceSalary records")
	@GetMapping("/all")
	public Iterable<AdvanceSalary> getAllAdvanceSalarys() {
		return advanceSalaryService.getAdvanceSalarys();
	}


	@Operation(summary = "Get AdvanceSalary by ID")
	@GetMapping("/{id}")
	public ResponseEntity<AdvanceSalary> getAdvanceSalaryById(@PathVariable Long id) {
		AdvanceSalary advanceSalary = advanceSalaryService.findById(id);
		return new ResponseEntity<AdvanceSalary>(advanceSalary, HttpStatus.OK);
	}


	@Operation(summary = "Delete AdvanceSalary by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteAdvanceSalary(@PathVariable Long id) {
		advanceSalaryService.delete(id);
		return new ResponseEntity<String>("advanceSalary was deleted", HttpStatus.OK);
	}

	@Operation(summary = "Update AdvanceSalary by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateAdvanceSalary(
			@PathVariable Long id,
			@Validated @RequestBody AdvanceSalary advanceSalaryDetails,
			BindingResult result
	) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		AdvanceSalary updatedAdvanceSalary = advanceSalaryService.update(id, advanceSalaryDetails);
		return new ResponseEntity<AdvanceSalary>(updatedAdvanceSalary, HttpStatus.OK);
	}
}
