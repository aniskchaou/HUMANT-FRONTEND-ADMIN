
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

import com.dev.delta.entities.Loan;
import com.dev.delta.services.LoanService;


@RestController
@RequestMapping("/loan")
@CrossOrigin
@Tag(name = "Loan", description = "Loan management APIs")
public class LoanController {
	@Autowired
	LoanService loanService;

	@Operation(summary = "Create a new loan")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Loan projectLoan, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Loan newPT = loanService.save(projectLoan);

		return new ResponseEntity<Loan>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all loans")
	@GetMapping("/all")
	public Iterable<Loan> getAllLoans() {
		return loanService.getLoans();
	}

	@Operation(summary = "Get loan by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Loan> getLoanById(@PathVariable Long id) {
		Loan loan = loanService.findById(id);
		return new ResponseEntity<Loan>(loan, HttpStatus.OK);
	}

	@Operation(summary = "Delete loan by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteLoan(@PathVariable Long id) {
		loanService.delete(id);
		return new ResponseEntity<String>("loan was deleted", HttpStatus.OK);
	}

	@Operation(summary = "Update loan by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateLoan(
			@PathVariable Long id,
			@Validated @RequestBody Loan loanDetails,
			BindingResult result
	) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Loan updatedLoan = loanService.update(id, loanDetails);
		return new ResponseEntity<Loan>(updatedLoan, HttpStatus.OK);
	}
}
