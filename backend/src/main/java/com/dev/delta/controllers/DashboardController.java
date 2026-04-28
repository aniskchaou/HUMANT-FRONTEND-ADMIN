package com.dev.delta.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.delta.dto.DashboardSummaryDTO;
import com.dev.delta.services.DashboardSummaryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin
@Tag(name = "Dashboard", description = "Dashboard summary APIs")
public class DashboardController {
	@Autowired
	private DashboardSummaryService dashboardSummaryService;

	@Operation(summary = "Get the dashboard summary")
	@GetMapping("/summary")
	public ResponseEntity<DashboardSummaryDTO> getSummary() {
		return new ResponseEntity<DashboardSummaryDTO>(dashboardSummaryService.getSummary(), HttpStatus.OK);
	}
}