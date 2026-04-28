
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

import com.dev.delta.entities.Location;
import com.dev.delta.services.LocationService;


@RestController
@RequestMapping("/location")
@CrossOrigin
@Tag(name = "Location", description = "Location management APIs")
public class LocationController {
	@Autowired
	LocationService locationService;

	@Operation(summary = "Create a new location")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Location projectLocation, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Location newPT = locationService.save(projectLocation);

		return new ResponseEntity<Location>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all locations")
	@GetMapping("/all")
	public Iterable<Location> getAllLocations() {
		return locationService.getLocations();
	}

	@Operation(summary = "Get location by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
		Location location = locationService.findById(id);
		return new ResponseEntity<Location>(location, HttpStatus.OK);
	}

	@Operation(summary = "Delete location by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteLocation(@PathVariable Long id) {
		locationService.delete(id);
		return new ResponseEntity<String>("location was deleted", HttpStatus.OK);
	}
}
