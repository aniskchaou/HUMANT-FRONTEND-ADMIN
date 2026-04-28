package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Departement;
import com.dev.delta.entities.Designation;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.DesignationRepository;

@Service
public class DesignationService {
	@Autowired
	private DesignationRepository designationRepository;

	@Autowired
	private DepartementRepository departementRepository;

	public List<Designation> getDesignations() {
		return designationRepository.findAll();
	}

	public long getCount() {
		return designationRepository.count();
	}

	public Designation save(Designation designation) {
		designation.setDepartement(resolveDepartement(designation.getDepartement()));
		return designationRepository.save(designation);
	}

	public Designation update(Long id, Designation designationDetails) {
		Designation designation = findById(id);
		designation.setName(designationDetails.getName());
		designation.setDepartement(resolveDepartement(designationDetails.getDepartement()));
		return designationRepository.save(designation);
	}

	public Designation findById(Long id) {
		return designationRepository.findById(id).orElseThrow();
	}

	public void delete(Long id) {
		designationRepository.deleteById(id);
	}

	private Departement resolveDepartement(Departement departement) {
		if (departement == null || departement.getId() == null) {
			return null;
		}

		return departementRepository.findById(departement.getId()).orElseThrow();
	}
}