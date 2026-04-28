package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.ContractType;
import com.dev.delta.repositories.ContractTypeRepository;
@Service
public class ContractTypeService {

	/**
	 * contractTypeRepository
	 */
	@Autowired
	private ContractTypeRepository contractTypeRepository;

	/**
	 * getContractTypes
	 * 
	 * @return
	 */
	public List<ContractType> getContractTypes() {
		return contractTypeRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return contractTypeRepository.count();
	}

	/**
	 * save
	 * 
	 * @param contractType
	 * @return 
	 */
	public ContractType save(ContractType contractType) {
		return contractTypeRepository.save(contractType);
	}

	public ContractType update(Long id, ContractType contractTypeDetails) {
		ContractType contractType = findById(id);
		contractType.setName(contractTypeDetails.getName());
		return contractTypeRepository.save(contractType);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public ContractType findById(Long id) {
		return contractTypeRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		contractTypeRepository.deleteById(id);
	}
}
