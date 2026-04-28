
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

import com.dev.delta.entities.TypeTermination;
import com.dev.delta.services.TypeTerminationService;


@RestController
@RequestMapping("/typetermination")
@CrossOrigin
@Tag(name = "TypeTermination", description = "Type Termination management APIs")
public class TypeTerminationController {
	@Autowired
	TypeTerminationService typeTerminationService;

	@Operation(summary = "Create a new type termination")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody TypeTermination projectTypeTermination, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		TypeTermination newPT = typeTerminationService.save(projectTypeTermination);

		return new ResponseEntity<TypeTermination>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all type terminations")
	@GetMapping("/all")
	public Iterable<TypeTermination> getAllTypeTerminations() {
		return typeTerminationService.getTypeTerminations();
	}

	@Operation(summary = "Get type termination by ID")
	@GetMapping("/{id}")
	public ResponseEntity<TypeTermination> getTypeTerminationById(@PathVariable Long id) {
		TypeTermination typeTermination = typeTerminationService.findById(id);
		return new ResponseEntity<TypeTermination>(typeTermination, HttpStatus.OK);
	}

	@Operation(summary = "Delete type termination by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteTypeTermination(@PathVariable Long id) {
		typeTerminationService.delete(id);
		return new ResponseEntity<String>("typeTermination was deleted", HttpStatus.OK);
	}
}
