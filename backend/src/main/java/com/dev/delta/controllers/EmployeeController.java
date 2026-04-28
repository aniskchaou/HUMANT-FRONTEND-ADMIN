
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

import com.dev.delta.entities.Employee;
import com.dev.delta.services.EmployeeService;

@RestController
@RequestMapping("/employee")
@CrossOrigin
@Tag(name = "Employee", description = "Employee management APIs")
public class EmployeeController {
	@Autowired
	EmployeeService employeeService;

	@Operation(summary = "Create a new employee")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Employee projectEmployee, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Employee newPT = employeeService.save(projectEmployee);

		return new ResponseEntity<Employee>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all employees")
	@GetMapping("/all")
	public Iterable<Employee> getAllEmployees() {
		return employeeService.getEmployees();
	}

	@Operation(summary = "Get the current signed-in employee profile")
	@GetMapping("/me")
	public ResponseEntity<Employee> getCurrentEmployee() {
		return new ResponseEntity<Employee>(employeeService.findCurrentEmployee(), HttpStatus.OK);
	}

	@Operation(summary = "Update the current signed-in employee profile")
	@PutMapping("/me")
	public ResponseEntity<Employee> updateCurrentEmployee(@RequestBody Employee employeeDetails) {
		Employee updatedEmployee = employeeService.updateCurrentEmployeeProfile(employeeDetails);
		return new ResponseEntity<Employee>(updatedEmployee, HttpStatus.OK);
	}

	@Operation(summary = "Update employee by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Validated @RequestBody Employee projectEmployee,
			BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Employee updatedEmployee = employeeService.update(id, projectEmployee);

		return new ResponseEntity<Employee>(updatedEmployee, HttpStatus.OK);
	}

	@Operation(summary = "Get employee by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
		Employee employee = employeeService.findById(id);
		return new ResponseEntity<Employee>(employee, HttpStatus.OK);
	}

	@Operation(summary = "Delete employee by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteEmployee(@PathVariable Long id) {
		employeeService.delete(id);
		return new ResponseEntity<String>("employee was deleted", HttpStatus.OK);
	}
}
