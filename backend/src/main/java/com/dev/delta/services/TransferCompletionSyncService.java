package com.dev.delta.services;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Departement;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Transfer;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TransferRepository;

@Service
public class TransferCompletionSyncService {
	@Autowired
	private TransferRepository transferRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private DepartementRepository departementRepository;

	public void synchronizeAllCompletedTransfers() {
		List<Transfer> transfers = transferRepository.findAll();
		Map<Long, Transfer> latestTransfersByEmployee = new HashMap<>();

		for (Transfer transfer : transfers) {
			if (!isEffectiveTransfer(transfer)) {
				continue;
			}

			Employee employee = transfer.getEmployeeName();
			if (employee == null || employee.getId() == null) {
				continue;
			}

			Transfer currentLatestTransfer = latestTransfersByEmployee.get(employee.getId());
			if (currentLatestTransfer == null || isLaterTransfer(transfer, currentLatestTransfer)) {
				latestTransfersByEmployee.put(employee.getId(), transfer);
			}
		}

		for (Transfer transfer : latestTransfersByEmployee.values()) {
			applyTransferDepartment(transfer);
		}
	}

	public Transfer synchronizeTransfer(Transfer transfer) {
		if (transfer == null || transfer.getEmployeeName() == null || transfer.getEmployeeName().getId() == null) {
			return transfer;
		}

		Transfer latestTransfer = findLatestCompletedTransfer(transfer.getEmployeeName().getId());
		applyTransferDepartment(latestTransfer);
		return transfer;
	}

	private Transfer findLatestCompletedTransfer(Long employeeId) {
		if (employeeId == null) {
			return null;
		}

		Transfer latestTransfer = null;

		for (Transfer candidate : transferRepository.findAll()) {
			Employee employee = candidate.getEmployeeName();

			if (
				employee == null ||
				employee.getId() == null ||
				!employeeId.equals(employee.getId()) ||
				!isEffectiveTransfer(candidate)
			) {
				continue;
			}

			if (latestTransfer == null || isLaterTransfer(candidate, latestTransfer)) {
				latestTransfer = candidate;
			}
		}

		return latestTransfer;
	}

	private void applyTransferDepartment(Transfer transfer) {
		if (!isEffectiveTransfer(transfer)) {
			return;
		}

		Employee transferEmployee = transfer.getEmployeeName();
		Departement targetDepartement = transfer.getDepartementTo();

		if (transferEmployee == null || transferEmployee.getId() == null) {
			return;
		}

		if (targetDepartement == null || targetDepartement.getId() == null) {
			return;
		}

		Employee employee = employeeRepository.findById(transferEmployee.getId()).orElse(null);
		Departement departement = departementRepository.findById(targetDepartement.getId())
				.orElse(null);

		if (employee == null || departement == null) {
			return;
		}

		Long currentDepartementId = employee.getDepartment() != null
				? employee.getDepartment().getId()
				: null;

		if (departement.getId().equals(currentDepartementId)) {
			return;
		}

		employee.setDepartment(departement);
		employeeRepository.save(employee);
	}

	private boolean isLaterTransfer(Transfer candidate, Transfer reference) {
		LocalDate candidateDate = parseDate(candidate != null ? candidate.getTransferDate() : null);
		LocalDate referenceDate = parseDate(reference != null ? reference.getTransferDate() : null);

		if (candidateDate != null && referenceDate != null && !candidateDate.equals(referenceDate)) {
			return candidateDate.isAfter(referenceDate);
		}

		Long candidateId = candidate != null ? candidate.getId() : null;
		Long referenceId = reference != null ? reference.getId() : null;

		if (candidateId == null) {
			return false;
		}

		if (referenceId == null) {
			return true;
		}

		return candidateId > referenceId;
	}

	private boolean isEffectiveTransfer(Transfer transfer) {
		if (transfer == null) {
			return false;
		}

		LocalDate transferDate = parseDate(transfer.getTransferDate());
		return transferDate != null && !transferDate.isAfter(LocalDate.now());
	}

	private LocalDate parseDate(String value) {
		if (value == null) {
			return null;
		}

		String normalizedValue = value.trim();
		if (normalizedValue.isEmpty()) {
			return null;
		}

		if (normalizedValue.length() > 10) {
			normalizedValue = normalizedValue.substring(0, 10);
		}

		try {
			return LocalDate.parse(normalizedValue);
		} catch (DateTimeParseException exception) {
			return null;
		}
	}
}