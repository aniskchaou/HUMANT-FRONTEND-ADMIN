
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

import com.dev.delta.entities.ContractType;
import com.dev.delta.services.ContractTypeService;

@RestController
@RequestMapping("/contracttype")
@CrossOrigin
@Tag(name = "ContractType", description = "ContractType management APIs")
public class ContractTypeController {
	@Autowired
	ContractTypeService contractService;

	@Operation(summary = "Create a new contract type")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody ContractType projectContractType, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		ContractType newPT = contractService.save(projectContractType);

		return new ResponseEntity<ContractType>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all contract types")
	@GetMapping("/all")
	public Iterable<ContractType> getAllContractTypes() {
		return contractService.getContractTypes();
	}

	@Operation(summary = "Update contract type by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateContractType(@PathVariable Long id, @Validated @RequestBody ContractType projectContractType,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		ContractType updatedContractType = contractService.update(id, projectContractType);

		return new ResponseEntity<ContractType>(updatedContractType, HttpStatus.OK);
	}

	@Operation(summary = "Get contract type by ID")
	@GetMapping("/{id}")
	public ResponseEntity<ContractType> getContractTypeById(@PathVariable Long id) {
		ContractType contract = contractService.findById(id);
		return new ResponseEntity<ContractType>(contract, HttpStatus.OK);
	}

	@Operation(summary = "Delete contract type by ID")
	@DeleteMapping("/delete/{id}")
	public void deleteContractType(@PathVariable Long id) {
		contractService.delete(id);
		
	}
}
