package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Departement;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Transfer;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.TransferRepository;

@Service
public class TransferService {
	/**
	 * transferRepository
	 */
	@Autowired
	private TransferRepository transferRepository;

	@Autowired
	private DepartementRepository departementRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private TransferCompletionSyncService transferCompletionSyncService;

	/**
	 * getTransfers
	 * 
	 * @return
	 */
	public List<Transfer> getTransfers() {
		transferCompletionSyncService.synchronizeAllCompletedTransfers();
		return transferRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return transferRepository.count();
	}

	/**
	 * save
	 * 
	 * @param transfer
	 */
	public Transfer save(Transfer transfer) {
		transfer.setDepartementFrom(resolveDepartement(transfer.getDepartementFrom()));
		transfer.setEmployeeName(resolveEmployee(transfer.getEmployeeName()));
		transfer.setDepartementTo(resolveDepartement(transfer.getDepartementTo()));
		Transfer savedTransfer = transferRepository.save(transfer);
		return transferCompletionSyncService.synchronizeTransfer(savedTransfer);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Transfer findById(Long id) {
		Transfer transfer = transferRepository.findById(id).orElseThrow();
		return transferCompletionSyncService.synchronizeTransfer(transfer);
	}

	public Transfer update(Long id, Transfer transferDetails) {
		Transfer transfer = findById(id);
		transfer.setDepartementFrom(resolveDepartement(transferDetails.getDepartementFrom()));
		transfer.setEmployeeName(resolveEmployee(transferDetails.getEmployeeName()));
		transfer.setDepartementTo(resolveDepartement(transferDetails.getDepartementTo()));
		transfer.setDesignation(transferDetails.getDesignation());
		transfer.setNoticeDate(transferDetails.getNoticeDate());
		transfer.setTransferDate(transferDetails.getTransferDate());
		transfer.setDescription(transferDetails.getDescription());
		Transfer updatedTransfer = transferRepository.save(transfer);
		return transferCompletionSyncService.synchronizeTransfer(updatedTransfer);
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		transferRepository.delete(transferRepository.findById(id).get());
	}

	private Departement resolveDepartement(Departement departement) {
		if (departement == null || departement.getId() == null) {
			return null;
		}

		return departementRepository.findById(departement.getId()).orElseThrow();
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}
}
