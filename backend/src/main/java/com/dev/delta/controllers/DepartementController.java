
package com.dev.delta.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

import javax.transaction.Transactional;

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

import com.dev.delta.entities.Departement;
import com.dev.delta.services.DepartementService;

@RestController
@RequestMapping("/departement")
@CrossOrigin
@Tag(name = "Departement", description = "Departement management APIs")
public class DepartementController {
	@Autowired
	DepartementService departementService;

	@Operation(summary = "Create a new departement")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Departement projectDepartement, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Departement newPT = departementService.save(projectDepartement);

		return new ResponseEntity<Departement>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all departements")
	@GetMapping("/all")
	public Iterable<Departement> getAllDepartements() {
		return departementService.getDepartements();
	}

	@Operation(summary = "Update departement by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateDepartement(@PathVariable Long id, @Validated @RequestBody Departement projectDepartement,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Departement updatedDepartement = departementService.update(id, projectDepartement);

		return new ResponseEntity<Departement>(updatedDepartement, HttpStatus.OK);
	}

	@Operation(summary = "Get departement by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Departement> getDepartementById(@PathVariable Long id) {
		Departement departement = departementService.findById(id);
		return new ResponseEntity<Departement>(departement, HttpStatus.OK);
	}

	@Operation(summary = "Delete departement by ID")
	@DeleteMapping("/delete/{id}")
	public void deleteDepartement(@PathVariable Long id) {
		departementService.delete(id);
		
	}
}
