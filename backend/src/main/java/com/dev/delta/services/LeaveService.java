package com.dev.delta.services;

import java.util.Comparator;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Leave;
import com.dev.delta.entities.TypeLeave;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.LeaveRepository;
import com.dev.delta.repositories.TypeLeaveRepository;
@Service
public class LeaveService {
	/**
	 * leaveRepository
	 */
	@Autowired
	private LeaveRepository leaveRepository;

	@Autowired
	private TypeLeaveRepository typeLeaveRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private EmployeeContextService employeeContextService;

	/**
	 * getLeaves
	 * 
	 * @return
	 */
	public List<Leave> getLeaves() {
		if (employeeContextService.isEmployeeOnlyRole()) {
			Employee currentEmployee = employeeContextService.findCurrentEmployee().orElse(null);

			if (currentEmployee == null || currentEmployee.getId() == null) {
				return java.util.Collections.emptyList();
			}

			return sortLeaves(leaveRepository.findAllByEmployeeId(currentEmployee.getId()));
		}

		return sortLeaves(leaveRepository.findAll());
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return leaveRepository.count();
	}

	/**
	 * save
	 * 
	 * @param leave
	 * @return 
	 */
	public Leave save(Leave leave) {
		leave.setTypeLeave(resolveTypeLeave(leave.getTypeLeave()));
		leave.setEmployee(resolveEmployeeForSave(leave.getEmployee()));
		leave.setApprovalStatus("Pending");
		leave.setReviewedBy(null);
		leave.setReviewedAt(null);
		return leaveRepository.save(leave);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Leave findById(Long id) {
		Leave leave = leaveRepository.findById(id).orElseThrow();

		if (!canAccess(leave)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this leave record.");
		}

		return leave;
	}

	public Leave update(Long id, Leave leaveDetails) {
		Leave leave = findById(id);
		boolean employeeOnlyRole = employeeContextService.isEmployeeOnlyRole();

		if (employeeOnlyRole && !canAccess(leave)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot update this leave record.");
		}

		leave.setTypeLeave(resolveTypeLeave(leaveDetails.getTypeLeave()));
		leave.setEmployee(resolveEmployeeForSave(leaveDetails.getEmployee()));
		leave.setStartDate(leaveDetails.getStartDate());
		leave.setEndDate(leaveDetails.getEndDate());
		leave.setAttachment(leaveDetails.getAttachment());
		leave.setRemarks(leaveDetails.getRemarks());
		leave.setReason(leaveDetails.getReason());

		if (employeeOnlyRole) {
			leave.setApprovalStatus("Pending");
			leave.setReviewedBy(null);
			leave.setReviewedAt(null);
		} else {
			applyReviewState(leave, leaveDetails.getApprovalStatus());
		}

		return leaveRepository.save(leave);
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		Leave leave = findById(id);

		if (employeeContextService.isEmployeeOnlyRole() && !canAccess(leave)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this leave record.");
		}

		leaveRepository.delete(leave);
	}

	private TypeLeave resolveTypeLeave(TypeLeave typeLeave) {
		if (typeLeave == null || typeLeave.getId() == null) {
			return null;
		}

		return typeLeaveRepository.findById(typeLeave.getId()).orElseThrow();
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}

	private Employee resolveEmployeeForSave(Employee employee) {
		if (employeeContextService.isEmployeeOnlyRole()) {
			return employeeContextService.getCurrentEmployeeOrThrow();
		}

		return resolveEmployee(employee);
	}

	private boolean canAccess(Leave leave) {
		return leave != null && employeeContextService.canAccessEmployee(leave.getEmployee());
	}

	private List<Leave> sortLeaves(List<Leave> leaves) {
		leaves.sort(
			Comparator.comparing(Leave::getStartDate, Comparator.nullsLast(Comparator.reverseOrder()))
				.thenComparing(Leave::getId, Comparator.nullsLast(Comparator.reverseOrder()))
		);
		return leaves;
	}

	private void applyReviewState(Leave leave, String requestedStatus) {
		String resolvedStatus = normalizeApprovalStatus(requestedStatus, leave.getApprovalStatus());

		leave.setApprovalStatus(resolvedStatus);

		if ("Pending".equals(resolvedStatus)) {
			leave.setReviewedBy(null);
			leave.setReviewedAt(null);
			return;
		}

		leave.setReviewedBy(resolveCurrentReviewer());
		leave.setReviewedAt(LocalDateTime.now().toString());
	}

	private String normalizeApprovalStatus(String requestedStatus, String currentStatus) {
		String normalizedStatus = normalizeText(requestedStatus).toLowerCase();

		if ("approved".equals(normalizedStatus)) {
			return "Approved";
		}

		if ("rejected".equals(normalizedStatus)) {
			return "Rejected";
		}

		if ("pending".equals(normalizedStatus)) {
			return "Pending";
		}

		String normalizedCurrentStatus = normalizeText(currentStatus);
		return normalizedCurrentStatus.isEmpty() ? "Pending" : normalizedCurrentStatus;
	}

	private String resolveCurrentReviewer() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null) {
			return "System";
		}

		String reviewer = normalizeText(authentication.getName());
		return reviewer.isEmpty() ? "System" : reviewer;
	}

	private String normalizeText(String value) {
		return value == null ? "" : value.trim();
	}
}
