
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

import com.dev.delta.entities.TypeLeave;
import com.dev.delta.services.TypeLeaveService;


@RestController
@RequestMapping("/typeleave")
@CrossOrigin
@Tag(name = "TypeLeave", description = "Type Leave management APIs")
public class TypeLeaveController {
	@Autowired
	TypeLeaveService typeLeaveService;

	@Operation(summary = "Create a new type leave")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody TypeLeave projectTypeLeave, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		TypeLeave newPT = typeLeaveService.save(projectTypeLeave);

		return new ResponseEntity<TypeLeave>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all type leaves")
	@GetMapping("/all")
	public Iterable<TypeLeave> getAllTypeLeaves() {
		return typeLeaveService.getTypeLeaves();
	}

	@Operation(summary = "Get type leave by ID")
	@GetMapping("/{id}")
	public ResponseEntity<TypeLeave> getTypeLeaveById(@PathVariable Long id) {
		TypeLeave typeLeave = typeLeaveService.findById(id);
		return new ResponseEntity<TypeLeave>(typeLeave, HttpStatus.OK);
	}

	@Operation(summary = "Update type leave by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<TypeLeave> updateTypeLeave(@PathVariable Long id, @RequestBody TypeLeave typeLeaveDetails) {
		TypeLeave updatedTypeLeave = typeLeaveService.update(id, typeLeaveDetails);
		return new ResponseEntity<TypeLeave>(updatedTypeLeave, HttpStatus.OK);
	}

	@Operation(summary = "Delete type leave by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteTypeLeave(@PathVariable Long id) {
		typeLeaveService.delete(id);
		return new ResponseEntity<String>("typeLeave was deleted", HttpStatus.OK);
	}
}
