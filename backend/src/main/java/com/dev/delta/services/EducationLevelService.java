package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.EducationLevel;
import com.dev.delta.repositories.EducationLevelRepository;
@Service
public class EducationLevelService {
	/**
	 * educationRepository
	 */
	@Autowired
	private EducationLevelRepository educationRepository;

	/**
	 * getEducationLevels
	 * 
	 * @return
	 */
	public List<EducationLevel> getEducationLevels() {
		return educationRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return educationRepository.count();
	}

	/**
	 * save
	 * 
	 * @param education
	 */
	public EducationLevel save(EducationLevel education) {
		return educationRepository.save(education);
	}

	public EducationLevel update(Long id, EducationLevel educationDetails) {
		EducationLevel education = findById(id);
		education.setName(educationDetails.getName());
		education.setYears(educationDetails.getYears());
		education.setCertificateLevel(educationDetails.getCertificateLevel());
		education.setFieldofStudy(educationDetails.getFieldofStudy());
		education.setSchool(educationDetails.getSchool());
		return educationRepository.save(education);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public EducationLevel findById(Long id) {
		return educationRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		educationRepository.delete(educationRepository.findById(id).get());
	}
}
