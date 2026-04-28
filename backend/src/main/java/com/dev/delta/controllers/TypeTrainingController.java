
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

import com.dev.delta.entities.TypeTraining;
import com.dev.delta.services.TypeTrainingService;


@RestController
@RequestMapping("/typetraining")
@CrossOrigin
@Tag(name = "TypeTraining", description = "Type Training management APIs")
public class TypeTrainingController {
	@Autowired
	TypeTrainingService typeTrainingService;

	@Operation(summary = "Create a new type training")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody TypeTraining projectTypeTraining, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		TypeTraining newPT = typeTrainingService.save(projectTypeTraining);

		return new ResponseEntity<TypeTraining>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all type trainings")
	@GetMapping("/all")
	public Iterable<TypeTraining> getAllTypeTrainings() {
		return typeTrainingService.getTypeTrainings();
	}

	@Operation(summary = "Update type training by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateTypeTraining(@PathVariable Long id,
			@Validated @RequestBody TypeTraining projectTypeTraining, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		TypeTraining updatedTypeTraining = typeTrainingService.update(id, projectTypeTraining);

		return new ResponseEntity<TypeTraining>(updatedTypeTraining, HttpStatus.OK);
	}

	@Operation(summary = "Get type training by ID")
	@GetMapping("/{id}")
	public ResponseEntity<TypeTraining> getTypeTrainingById(@PathVariable Long id) {
		TypeTraining typeTraining = typeTrainingService.findById(id);
		return new ResponseEntity<TypeTraining>(typeTraining, HttpStatus.OK);
	}

	@Operation(summary = "Delete type training by ID")
	@DeleteMapping("/delete/{id}")
	public void deleteTypeTraining(@PathVariable Long id) {
		typeTrainingService.delete(id);
		//return new ResponseEntity<String>("typeTraining was deleted", HttpStatus.OK);
	}
}
