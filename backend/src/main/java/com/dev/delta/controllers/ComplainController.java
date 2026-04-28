
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

import com.dev.delta.entities.Complain;
import com.dev.delta.services.ComplainService;
@RestController
@RequestMapping("/complain")
@CrossOrigin
@Tag(name = "Complain", description = "Complain management APIs")
public class ComplainController {
	@Autowired
	ComplainService complainService;

	@Operation(summary = "Create a new complain")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Complain projectComplain, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Complain newPT = complainService.save(projectComplain);

		return new ResponseEntity<Complain>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all complains")
	@GetMapping("/all")
	public Iterable<Complain> getAllComplains() {
		return complainService.getComplains();
	}

	@Operation(summary = "Get complain by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Complain> getComplainById(@PathVariable Long id) {
		Complain complain = complainService.findById(id);
		return new ResponseEntity<Complain>(complain, HttpStatus.OK);
	}

	@Operation(summary = "Delete complain by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteComplain(@PathVariable Long id) {
		complainService.delete(id);
		return new ResponseEntity<String>("complain was deleted", HttpStatus.OK);
	}
}
