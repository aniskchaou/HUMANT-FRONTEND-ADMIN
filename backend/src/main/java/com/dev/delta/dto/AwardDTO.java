package com.dev.delta.dto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.ContractType;
import com.dev.delta.entities.Departement;
import com.dev.delta.repositories.ContractTypeRepository;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.JobRepository;
import com.dev.delta.repositories.SalaryRepository;

@Service
public class AwardDTO implements DTO {

	
	@Autowired
	EmployeeRepository employeeRepository;
	@Autowired
	ContractTypeRepository contractTypeRepository;
	
	@Autowired
	DepartementRepository departementRepository;
	
	@Autowired
	JobRepository jobRepository;
	
	@Autowired
	SalaryRepository salaryRepository;

	public void populate() {
		//contractTypeRepository.save(contractType);
		//departementRepository.save(departement);
		//jobRepository.save(job);
		//salaryRepository.save(salary);
//		employee.setBirthDay("sd");
//		employee.setContactNote("cc");
//		employee.setContactNumber("cdsé");
//		employee.setContractType(contractType);
//		employee.setContractAgreement("ccc");
//		employee.setDepartement(departement);
//		employee.setContactNumber("dfgdfg");
//		employee.setFullName("xwxc");
//		employee.setGender("xwwx");
//		employee.setIdentityProof("xcx");
//		employee.setJob(job);
//		employee.setJoiningDate("xwx");
//		employee.setJoiningLetter("vc");
//		employee.setNote("x");
//		employee.setOfferLetter("vvcxc");
//		employee.setPermanentAddress("bb");
//		employee.setPhone("www");
//		employee.setPhoto("sss");
//		employee.setPresentAddress("ee");
//		employee.setSalary(salary);
//		employee.setResume("ccc");
		//employeeRepository.save(employee);
		
		//departement.setManager("sfg");
		//departement.setName("qd");
		//departementRepository.save(departement);
	}
}
