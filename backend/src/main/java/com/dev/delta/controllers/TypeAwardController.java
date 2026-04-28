
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

import com.dev.delta.entities.TypeAward;
import com.dev.delta.services.TypeAwardService;



@RestController
@RequestMapping("/typeaward")
@CrossOrigin
@Tag(name = "TypeAward", description = "Type Award management APIs")
public class TypeAwardController {
	@Autowired
	TypeAwardService typeAwrdService;

	@Operation(summary = "Create a new type award")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody TypeAward projectTypeAward, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		TypeAward newPT = typeAwrdService.save(projectTypeAward);

		return new ResponseEntity<TypeAward>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all type awards")
	@GetMapping("/all")
	public Iterable<TypeAward> getAllTypeAwards() {
		return typeAwrdService.getTypeAwards();
	}

	@Operation(summary = "Update type award by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateTypeAward(@PathVariable Long id, @Validated @RequestBody TypeAward projectTypeAward,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		TypeAward updatedTypeAward = typeAwrdService.update(id, projectTypeAward);

		return new ResponseEntity<TypeAward>(updatedTypeAward, HttpStatus.OK);
	}

	@Operation(summary = "Get type award by ID")
	@GetMapping("/{id}")
	public ResponseEntity<TypeAward> getTypeAwardById(@PathVariable Long id) {
		TypeAward typeAwrd = typeAwrdService.findById(id);
		return new ResponseEntity<TypeAward>(typeAwrd, HttpStatus.OK);
	}

	@Operation(summary = "Delete type award by ID")
	@DeleteMapping("/delete/{id}")
	public void deleteTypeAward(@PathVariable Long id) {
		typeAwrdService.delete(id);
		//return "deleted";
	}
}
