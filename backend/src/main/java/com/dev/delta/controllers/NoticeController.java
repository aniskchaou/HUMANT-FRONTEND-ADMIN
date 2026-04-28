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

import com.dev.delta.entities.Notice;
import com.dev.delta.services.NoticeService;


@RestController
@RequestMapping("/notice")
@CrossOrigin
@Tag(name = "Notice", description = "Notice management APIs")
public class NoticeController {
	@Autowired
	NoticeService noticeService;

	@Operation(summary = "Create a new notice")
	@PostMapping("/create")
	public ResponseEntity<?> addPTToBoard(@Validated @RequestBody Notice projectNotice, BindingResult result) {

		if (result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<String, String>();

			for (FieldError error : result.getFieldErrors()) {
				errorMap.put(error.getField(), error.getDefaultMessage());
			}
			return new ResponseEntity<Map<String, String>>(errorMap, HttpStatus.BAD_REQUEST);
		}

		Notice newPT = noticeService.save(projectNotice);

		return new ResponseEntity<Notice>(newPT, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all notices")
	@GetMapping("/all")
	public Iterable<Notice> getAllNotices() {
		return noticeService.getNotices();
	}

	@Operation(summary = "Get notice by ID")
	@GetMapping("/{id}")
	public ResponseEntity<Notice> getNoticeById(@PathVariable Long id) {
		Notice notice = noticeService.findById(id);
		return new ResponseEntity<Notice>(notice, HttpStatus.OK);
	}

	@Operation(summary = "Update notice by ID")
	@PutMapping("/update/{id}")
	public ResponseEntity<Notice> updateNotice(@PathVariable Long id, @RequestBody Notice noticeDetails) {
		Notice updatedNotice = noticeService.update(id, noticeDetails);
		return new ResponseEntity<Notice>(updatedNotice, HttpStatus.OK);
	}

	@Operation(summary = "Delete notice by ID")
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteNotice(@PathVariable Long id) {
		noticeService.delete(id);
		return new ResponseEntity<String>("notice was deleted", HttpStatus.OK);
	}
}
