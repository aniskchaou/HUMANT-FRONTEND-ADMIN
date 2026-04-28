package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Loan;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.LoanRepository;
@Service
public class LoanService {
	/**
	 * loanRepository
	 */
	@Autowired
	private LoanRepository loanRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	/**
	 * getLoans
	 * 
	 * @return
	 */
	public List<Loan> getLoans() {
		return loanRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return loanRepository.count();
	}

	/**
	 * save
	 * 
	 * @param loan
	 */
	public Loan save(Loan loan) {
		loan.setName(resolveEmployee(loan.getName()));
		return loanRepository.save(loan);
	}

	public Loan update(Long id, Loan loanDetails) {
		Loan loan = findById(id);
		loan.setLoanName(loanDetails.getLoanName());
		loan.setReceiveType(loanDetails.getReceiveType());
		loan.setName(resolveEmployee(loanDetails.getName()));
		loan.setInterestPercentage(loanDetails.getInterestPercentage());
		loan.setLoanAmount(loanDetails.getLoanAmount());
		loan.setApplyDate(loanDetails.getApplyDate());
		loan.setRemarks(loanDetails.getRemarks());
		return loanRepository.save(loan);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Loan findById(Long id) {
		return loanRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		loanRepository.delete(loanRepository.findById(id).get());
	}

	private Employee resolveEmployee(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return null;
		}

		return employeeRepository.findById(employee.getId()).orElseThrow();
	}
}
