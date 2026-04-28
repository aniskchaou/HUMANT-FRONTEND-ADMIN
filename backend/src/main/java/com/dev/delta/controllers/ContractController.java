
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

import com.dev.delta.entities.Contract;
import com.dev.delta.services.ContractService;


@RestController
@RequestMapping("/contract")
@CrossOrigin
@Tag(name = "Contract", description = "Contract management APIs")
public class ContractController {
	@Autowired
	ContractService contractService;

	@Operation(summary = "Create a new contract")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Contract projectContract, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Contract newPT = contractService.save(projectContract);

		return new ResponseEntity<Contract>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all contracts")
	@GetMapping("/all")
	public Iterable<Contract> getAllContracts() {
		return contractService.getContracts();
	}

	@Operation(summary = "Update contract by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateContract(@PathVariable Long id, @Validated @RequestBody Contract projectContract,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Contract updatedContract = contractService.update(id, projectContract);

		return new ResponseEntity<Contract>(updatedContract, HttpStatus.OK);
	}

	@Operation(summary = "Get contract by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Contract> getContractById(@PathVariable Long id) {
		Contract contract = contractService.findById(id);
		return new ResponseEntity<Contract>(contract, HttpStatus.OK);
	}

	@Operation(summary = "Delete contract by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteContract(@PathVariable Long id) {
		contractService.delete(id);
		return new ResponseEntity<String>("contract was deleted", HttpStatus.OK);
	}
}
