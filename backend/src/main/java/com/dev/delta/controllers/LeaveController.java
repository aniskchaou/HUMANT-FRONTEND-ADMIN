
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

import com.dev.delta.entities.Leave;
import com.dev.delta.services.LeaveService;


@RestController
@RequestMapping("/leave")
@CrossOrigin
@Tag(name = "Leave", description = "Leave management APIs")
public class LeaveController {
	@Autowired
	LeaveService leaveService;

	@Operation(summary = "Create a new leave")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Leave projectLeave, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Leave newPT = leaveService.save(projectLeave);

		return new ResponseEntity<Leave>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all leaves")
	@GetMapping("/all")
	public Iterable<Leave> getAllLeaves() {
		return leaveService.getLeaves();
	}

	@Operation(summary = "Get leave by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Leave> getLeaveById(@PathVariable Long id) {
		Leave leave = leaveService.findById(id);
		return new ResponseEntity<Leave>(leave, HttpStatus.OK);
	}

	@Operation(summary = "Update leave by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<Leave> updateLeave(@PathVariable Long id, @RequestBody Leave leaveDetails) {
		Leave updatedLeave = leaveService.update(id, leaveDetails);
		return new ResponseEntity<Leave>(updatedLeave, HttpStatus.OK);
	}

	@Operation(summary = "Delete leave by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteLeave(@PathVariable Long id) {
		leaveService.delete(id);
		return new ResponseEntity<String>("leave was deleted", HttpStatus.OK);
	}
}
