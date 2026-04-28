package com.dev.delta.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.dto.DashboardSummaryDTO;
import com.dev.delta.entities.Announcement;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.Job;
import com.dev.delta.entities.Salary;
import com.dev.delta.entities.Termination;
import com.dev.delta.entities.Training;
import com.dev.delta.repositories.AnnouncementRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.JobRepository;
import com.dev.delta.repositories.SalaryRepository;
import com.dev.delta.repositories.TerminationRepository;
import com.dev.delta.repositories.TrainingRepository;

@Service
public class DashboardSummaryService {
	private static final DateTimeFormatter SHORT_DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d", Locale.US);
	private static final DateTimeFormatter[] DATE_FORMATTERS = new DateTimeFormatter[] {
			DateTimeFormatter.ISO_LOCAL_DATE,
			DateTimeFormatter.ofPattern("M/d/yyyy"),
			DateTimeFormatter.ofPattern("MM/dd/yyyy"),
			DateTimeFormatter.ofPattern("d/M/yyyy"),
			DateTimeFormatter.ofPattern("dd/MM/yyyy") };
	private static final long JOB_PRIORITY_BASE = 1_000_000_000L;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private JobRepository jobRepository;

	@Autowired
	private SalaryRepository salaryRepository;

	@Autowired
	private TrainingRepository trainingRepository;

	@Autowired
	private AnnouncementRepository announcementRepository;

	@Autowired
	private TerminationRepository terminationRepository;

	public DashboardSummaryDTO getSummary() {
		List<Employee> employees = employeeRepository.findAll();
		List<Job> jobs = jobRepository.findAll();
		List<Salary> salaries = salaryRepository.findAll();
		List<Training> trainings = trainingRepository.findAll();
		List<Announcement> announcements = announcementRepository.findAll();
		List<Termination> terminations = terminationRepository.findAll();

		DashboardSummaryDTO summary = new DashboardSummaryDTO();
		summary.setEmployeeCount(employees.size());
		summary.setJobCount(jobs.size());
		summary.setSalaryCount(salaries.size());
		summary.setTrainingCount(trainings.size());
		summary.setAnnouncementCount(announcements.size());
		summary.setTerminationCount(terminations.size());

		long activeAnnouncementCount = announcements.stream().filter(this::isAnnouncementActive).count();
		long liveTrainingCount = trainings.stream().filter(this::isTrainingLive).count();
		long fullyCompletedProfiles = employees.stream().filter(this::hasEmployeeCoreFields).count();
		double payrollTotal = salaries.stream().mapToDouble(this::resolveSalaryAmount).sum();

		summary.setActiveAnnouncementCount(activeAnnouncementCount);
		summary.setLiveTrainingCount(liveTrainingCount);
		summary.setFullyCompletedProfiles(fullyCompletedProfiles);
		summary.setPayrollTotal(payrollTotal);
		summary.setAveragePackage(salaries.isEmpty() ? 0 : payrollTotal / salaries.size());
		summary.setProfileCompletion(calculateEmployeeCompleteness(employees));
		summary.setTrackedRecords(
				employees.size() + jobs.size() + salaries.size() + trainings.size() + announcements.size() + terminations.size());
		summary.setActiveModules(Arrays.stream(new long[] { employees.size(), jobs.size(), salaries.size(), trainings.size(),
				announcements.size(), terminations.size() }).filter(count -> count > 0).count());
		summary.setFeaturedJobNames(jobs.stream().map(Job::getName).filter(this::hasText).limit(2).collect(Collectors.toList()));
		summary.setPayrollDistribution(buildPayrollDistribution(salaries));
		summary.setWorkforceDistribution(buildWorkforceDistribution(employees));

		List<DashboardSummaryDTO.ActivityItemDTO> priorityItems = buildPriorityItems(announcements, trainings,
				terminations, jobs);
		summary.setPriorityItems(priorityItems);
		summary.setAttentionCount(priorityItems.size());
		summary.setTimeline(buildTimeline(announcements, trainings, terminations, salaries));

		return summary;
	}

	private List<DashboardSummaryDTO.ChartDatumDTO> buildPayrollDistribution(List<Salary> salaries) {
		Map<String, Double> totals = new LinkedHashMap<>();

		for (int index = 0; index < salaries.size(); index++) {
			Salary salary = salaries.get(index);
			String label = hasText(salary.getSalaryName()) ? salary.getSalaryName().trim() : "Package " + (index + 1);
			double amount = resolveSalaryAmount(salary);

			if (amount > 0) {
				totals.put(label, totals.getOrDefault(label, 0D) + amount);
			}
		}

		return totals.entrySet().stream()
				.map(entry -> new DashboardSummaryDTO.ChartDatumDTO(entry.getKey(), entry.getValue()))
				.sorted((left, right) -> Double.compare(right.getValue(), left.getValue())).limit(6)
				.collect(Collectors.toList());
	}

	private List<DashboardSummaryDTO.ChartDatumDTO> buildWorkforceDistribution(List<Employee> employees) {
		Map<String, Long> buckets = new LinkedHashMap<>();

		for (Employee employee : employees) {
			String label = titleize(hasText(employee.getGender()) ? employee.getGender() : "Unspecified");
			buckets.put(label, buckets.getOrDefault(label, 0L) + 1);
		}

		return buckets.entrySet().stream()
				.map(entry -> new DashboardSummaryDTO.ChartDatumDTO(entry.getKey(), entry.getValue()))
				.sorted((left, right) -> Double.compare(right.getValue(), left.getValue()))
				.collect(Collectors.toList());
	}

	private List<DashboardSummaryDTO.ActivityItemDTO> buildPriorityItems(List<Announcement> announcements,
			List<Training> trainings, List<Termination> terminations, List<Job> jobs) {
		List<PriorityCandidate> queue = new ArrayList<>();

		for (Announcement announcement : announcements) {
			LocalDate start = parseDate(announcement.getStartDate());
			LocalDate end = parseDate(announcement.getEndDate());
			boolean active = isDateRangeActive(start, end);

			queue.add(new PriorityCandidate(getPrioritySortValue(end != null ? end : start, active),
					new DashboardSummaryDTO.ActivityItemDTO(resolveAnnouncementTitle(announcement),
							describeDateRange(start, end, "Announcement"), active ? "Announcement live" : "Announcement scheduled",
							"/announcement")));
		}

		for (Training training : trainings) {
			LocalDate start = parseDate(training.getStartDate());
			LocalDate end = parseDate(training.getEndDate());
			boolean active = isDateRangeActive(start, end);

			queue.add(new PriorityCandidate(getPrioritySortValue(end != null ? end : start, active),
					new DashboardSummaryDTO.ActivityItemDTO(resolveTrainingTitle(training),
							describeDateRange(start, end, "Training"), active ? "Training live" : "Training scheduled",
							"/training")));
		}

		for (Termination termination : terminations) {
			LocalDate noticeDate = parseDate(termination.getNoticeDate());
			LocalDate terminationDate = parseDate(termination.getTerminationDate());

			queue.add(new PriorityCandidate(getPrioritySortValue(terminationDate != null ? terminationDate : noticeDate, false),
					new DashboardSummaryDTO.ActivityItemDTO(resolveTerminationName(termination),
							"Notice " + formatShortDate(noticeDate) + " • Effective " + formatShortDate(terminationDate),
							"Termination", "/termination")));
		}

		for (int index = 0; index < Math.min(jobs.size(), 3); index++) {
			Job job = jobs.get(index);
			queue.add(new PriorityCandidate(JOB_PRIORITY_BASE + index,
					new DashboardSummaryDTO.ActivityItemDTO(resolveJobName(job),
							"Review the role definition and next recruiting actions.", "Recruiting", "/job")));
		}

		return queue.stream().sorted(Comparator.comparingLong(PriorityCandidate::getSortValue)).limit(5)
				.map(PriorityCandidate::getItem).collect(Collectors.toList());
	}

	private List<DashboardSummaryDTO.TimelineItemDTO> buildTimeline(List<Announcement> announcements,
			List<Training> trainings, List<Termination> terminations, List<Salary> salaries) {
		List<TimelineCandidate> items = new ArrayList<>();

		for (Announcement announcement : announcements) {
			LocalDate start = parseDate(announcement.getStartDate());
			LocalDate end = parseDate(announcement.getEndDate());

			if (start != null) {
				items.add(new TimelineCandidate(start,
						new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(start), resolveAnnouncementTitle(announcement),
								"Announcement window opens on " + formatShortDate(start) + ".", "navy")));
			}

			if (end != null) {
				items.add(new TimelineCandidate(end,
						new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(end), resolveAnnouncementTitle(announcement),
								"Announcement window closes on " + formatShortDate(end) + ".", "teal")));
			}
		}

		for (Training training : trainings) {
			LocalDate start = parseDate(training.getStartDate());
			LocalDate end = parseDate(training.getEndDate());
			String title = resolveTrainingTitle(training);

			if (start != null) {
				items.add(new TimelineCandidate(start,
						new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(start), title + " begins",
								"Training starts on " + formatShortDate(start) + ".", "gold")));
			}

			if (end != null) {
				items.add(new TimelineCandidate(end,
						new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(end), title + " wraps",
								"Training ends on " + formatShortDate(end) + ".", "coral")));
			}
		}

		for (Termination termination : terminations) {
			LocalDate noticeDate = parseDate(termination.getNoticeDate());
			LocalDate terminationDate = parseDate(termination.getTerminationDate());
			String name = resolveTerminationName(termination);

			if (noticeDate != null) {
				items.add(new TimelineCandidate(noticeDate,
						new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(noticeDate), name + " notice registered",
								"Notice date recorded for the exit workflow.", "navy")));
			}

			if (terminationDate != null) {
				items.add(new TimelineCandidate(terminationDate,
						new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(terminationDate), name + " effective date",
								"Termination becomes effective on " + formatShortDate(terminationDate) + ".", "coral")));
			}
		}

		if (!salaries.isEmpty()) {
			LocalDate today = LocalDate.now();
			items.add(new TimelineCandidate(today,
					new DashboardSummaryDTO.TimelineItemDTO(formatShortDate(today), "Compensation library available",
								salaries.size() + " salary packages are ready for payroll review.", "gold")));
		}

		return items.stream().sorted((left, right) -> right.getDate().compareTo(left.getDate())).limit(6)
				.map(TimelineCandidate::getItem).collect(Collectors.toList());
	}

	private boolean isAnnouncementActive(Announcement announcement) {
		return isDateRangeActive(parseDate(announcement.getStartDate()), parseDate(announcement.getEndDate()));
	}

	private boolean isTrainingLive(Training training) {
		return isDateRangeActive(parseDate(training.getStartDate()), parseDate(training.getEndDate()));
	}

	private boolean isDateRangeActive(LocalDate start, LocalDate end) {
		LocalDate today = LocalDate.now();

		if (start != null && start.isAfter(today)) {
			return false;
		}

		if (end != null && end.isBefore(today)) {
			return false;
		}

		return start != null || end != null;
	}

	private long getPrioritySortValue(LocalDate date, boolean active) {
		if (active) {
			return 0L;
		}

		if (date == null) {
			return 100_000_000L;
		}

		return Math.abs(ChronoUnit.DAYS.between(LocalDate.now(), date));
	}

	private int calculateEmployeeCompleteness(List<Employee> employees) {
		if (employees.isEmpty()) {
			return 0;
		}

		long completed = employees.stream().filter(this::hasEmployeeCoreFields).count();
		return toPercent(completed, employees.size());
	}

	private boolean hasEmployeeCoreFields(Employee employee) {
		return hasText(employee.getFullName()) && hasText(employee.getPhone()) && hasText(employee.getGender())
				&& hasText(employee.getPresentAddress());
	}

	private int toPercent(long value, long total) {
		if (total <= 0) {
			return 0;
		}

		return (int) Math.max(0, Math.min(100, Math.round((value * 100D) / total)));
	}

	private double resolveSalaryAmount(Salary salary) {
		double totalSalary = parseAmount(salary.getTotalSalary());
		return totalSalary > 0 ? totalSalary : parseAmount(salary.getBasicSalary());
	}

	private double parseAmount(String value) {
		if (!hasText(value)) {
			return 0;
		}

		String normalized = value.replaceAll("[^0-9.-]", "");

		if (!hasText(normalized) || "-".equals(normalized) || ".".equals(normalized) || "-.".equals(normalized)) {
			return 0;
		}

		try {
			return Double.parseDouble(normalized);
		} catch (NumberFormatException exception) {
			return 0;
		}
	}

	private LocalDate parseDate(String rawValue) {
		if (!hasText(rawValue)) {
			return null;
		}

		String value = rawValue.trim();

		if (value.length() >= 10 && value.charAt(4) == '-') {
			value = value.substring(0, 10);
		}

		for (DateTimeFormatter formatter : DATE_FORMATTERS) {
			try {
				return LocalDate.parse(value, formatter);
			} catch (DateTimeParseException exception) {
				// Try the next supported date format.
			}
		}

		return null;
	}

	private String describeDateRange(LocalDate start, LocalDate end, String label) {
		if (start != null && end != null) {
			return label + " window: " + formatShortDate(start) + " to " + formatShortDate(end) + ".";
		}

		if (start != null) {
			return label + " starts on " + formatShortDate(start) + ".";
		}

		if (end != null) {
			return label + " ends on " + formatShortDate(end) + ".";
		}

		return label + " details are available in the module.";
	}

	private String formatShortDate(LocalDate date) {
		return date == null ? "No date" : SHORT_DATE_FORMATTER.format(date);
	}

	private String resolveAnnouncementTitle(Announcement announcement) {
		return hasText(announcement.getTitle()) ? announcement.getTitle().trim() : "Announcement";
	}

	private String resolveTrainingTitle(Training training) {
		if (hasText(training.getName())) {
			return training.getName().trim();
		}

		if (training.getEmployee() != null && hasText(training.getEmployee().getFullName())) {
			return training.getEmployee().getFullName().trim() + " training plan";
		}

		return "Training plan";
	}

	private String resolveTerminationName(Termination termination) {
		return termination.getName() != null && hasText(termination.getName().getFullName())
				? termination.getName().getFullName().trim()
				: "Termination record";
	}

	private String resolveJobName(Job job) {
		return hasText(job.getName()) ? job.getName().trim() : "Open role";
	}

	private String titleize(String value) {
		return Arrays.stream(value.toLowerCase().trim().split("\\s+"))
				.filter(segment -> !segment.isEmpty())
				.map(segment -> Character.toUpperCase(segment.charAt(0)) + segment.substring(1))
				.collect(Collectors.joining(" "));
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}

	private static class PriorityCandidate {
		private final long sortValue;
		private final DashboardSummaryDTO.ActivityItemDTO item;

		private PriorityCandidate(long sortValue, DashboardSummaryDTO.ActivityItemDTO item) {
			this.sortValue = sortValue;
			this.item = item;
		}

		private long getSortValue() {
			return sortValue;
		}

		private DashboardSummaryDTO.ActivityItemDTO getItem() {
			return item;
		}
	}

	private static class TimelineCandidate {
		private final LocalDate date;
		private final DashboardSummaryDTO.TimelineItemDTO item;

		private TimelineCandidate(LocalDate date, DashboardSummaryDTO.TimelineItemDTO item) {
			this.date = date;
			this.item = item;
		}

		private LocalDate getDate() {
			return date;
		}

		private DashboardSummaryDTO.TimelineItemDTO getItem() {
			return item;
		}
	}
}