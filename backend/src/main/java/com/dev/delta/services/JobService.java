package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Job;
import com.dev.delta.repositories.JobRepository;
@Service
public class JobService {
	/**
	 * jobRepository
	 */
	@Autowired
	private JobRepository jobRepository;

	/**
	 * getJobs
	 * 
	 * @return
	 */
	public List<Job> getJobs() {
		return jobRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return jobRepository.count();
	}

	/**
	 * save
	 * 
	 * @param job
	 */
	public Job save(Job job) {
		return jobRepository.save(job);
	}

	public Job update(Long id, Job jobDetails) {
		Job job = findById(id);
		job.setName(jobDetails.getName());
		job.setDescription(jobDetails.getDescription());
		return jobRepository.save(job);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Job findById(Long id) {
		return jobRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		jobRepository.delete(jobRepository.findById(id).get());
	}
}
