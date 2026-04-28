
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

import com.dev.delta.entities.Country;
import com.dev.delta.services.CountryService;
@RestController
@RequestMapping("/country")
@CrossOrigin
@Tag(name = "Country", description = "Country management APIs")
public class CountryController {
	@Autowired
	CountryService countryService;

	@Operation(summary = "Create a new country")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Country projectCountry, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Country newPT = countryService.save(projectCountry);

		return new ResponseEntity<Country>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all countries")
	@GetMapping("/all")
	public Iterable<Country> getAllCountrys() {
		return countryService.getCountrys();
	}

	@Operation(summary = "Get country by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Country> getCountryById(@PathVariable Long id) {
		Country country = countryService.findById(id);
		return new ResponseEntity<Country>(country, HttpStatus.OK);
	}

	@Operation(summary = "Delete country by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteCountry(@PathVariable Long id) {
		countryService.delete(id);
		return new ResponseEntity<String>("country was deleted", HttpStatus.OK);
	}
}
