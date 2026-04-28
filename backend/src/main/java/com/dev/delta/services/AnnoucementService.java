package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.delta.entities.Announcement;
import com.dev.delta.entities.Departement;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.EmployeeNotification.NotificationPriority;
import com.dev.delta.entities.EmployeeNotification.NotificationType;
import com.dev.delta.repositories.AnnouncementRepository;
import com.dev.delta.repositories.DepartementRepository;
import com.dev.delta.repositories.EmployeeRepository;

@Service
@Transactional
public class AnnoucementService {
	/**
	 * announcementRepository
	 */
	@Autowired
	private AnnouncementRepository announcementRepository;

	@Autowired
	private DepartementRepository departementRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private EmployeeNotificationService employeeNotificationService;

	/**
	 * getAnnouncements
	 * 
	 * @return
	 */
	public List<Announcement> getAnnouncements() {
		return announcementRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return announcementRepository.count();
	}

	/**
	 * save
	 * 
	 * @param announcement
	 */
	public Announcement save(Announcement announcement) {
		announcement.setDepartment(resolveDepartement(announcement.getDepartment()));
		Announcement savedAnnouncement = announcementRepository.save(announcement);
		publishAnnouncementNotifications(savedAnnouncement);
		return savedAnnouncement;
	}

	public Announcement update(Long id, Announcement announcementDetails) {
		Announcement announcement = findById(id);
		announcement.setTitle(announcementDetails.getTitle());
		announcement.setDepartment(resolveDepartement(announcementDetails.getDepartment()));
		announcement.setStartDate(announcementDetails.getStartDate());
		announcement.setEndDate(announcementDetails.getEndDate());
		announcement.setAttachment(announcementDetails.getAttachment());
		announcement.setSummary(announcementDetails.getSummary());
		announcement.setDescription(announcementDetails.getDescription());
		Announcement savedAnnouncement = announcementRepository.save(announcement);
		publishAnnouncementNotifications(savedAnnouncement);
		return savedAnnouncement;
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Announcement findById(Long id) {
		return announcementRepository.findById(id).orElseThrow();
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		announcementRepository.delete(announcementRepository.findById(id).get());
	}

	private Departement resolveDepartement(Departement departement) {
		if (departement == null || departement.getId() == null) {
			return null;
		}

		return departementRepository.findById(departement.getId()).orElseThrow();
	}

	private void publishAnnouncementNotifications(Announcement announcement) {
		List<Employee> employees = employeeRepository.findAllByOrderByFullNameAsc();
		Long targetDepartmentId = announcement.getDepartment() != null ? announcement.getDepartment().getId() : null;
		String announcementTitle = hasText(announcement.getTitle()) ? announcement.getTitle().trim() : "Announcement";
		String summary = hasText(announcement.getSummary())
			? announcement.getSummary().trim()
			: hasText(announcement.getDescription()) ? announcement.getDescription().trim() : "A new announcement is available.";

		for (Employee employee : employees) {
			Long employeeDepartmentId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;

			if (targetDepartmentId != null && !targetDepartmentId.equals(employeeDepartmentId)) {
				continue;
			}

			employeeNotificationService.publishNotification(
				employee,
				NotificationType.ANNOUNCEMENT,
				announcementTitle,
				summary,
				"/announcement",
				"announcement-" + announcement.getId(),
				NotificationPriority.MEDIUM,
				"HR Team"
			);
		}
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
