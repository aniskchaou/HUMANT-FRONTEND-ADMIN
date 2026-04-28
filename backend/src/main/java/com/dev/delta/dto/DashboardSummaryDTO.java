package com.dev.delta.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
	private long employeeCount;
	private long jobCount;
	private long salaryCount;
	private long trainingCount;
	private long announcementCount;
	private long activeAnnouncementCount;
	private long liveTrainingCount;
	private long terminationCount;
	private long trackedRecords;
	private long activeModules;
	private long attentionCount;
	private long fullyCompletedProfiles;
	private double payrollTotal;
	private double averagePackage;
	private int profileCompletion;
	private List<String> featuredJobNames;
	private List<ChartDatumDTO> payrollDistribution;
	private List<ChartDatumDTO> workforceDistribution;
	private List<ActivityItemDTO> priorityItems;
	private List<TimelineItemDTO> timeline;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class ChartDatumDTO {
		private String name;
		private double value;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class ActivityItemDTO {
		private String title;
		private String description;
		private String meta;
		private String route;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class TimelineItemDTO {
		private String stamp;
		private String title;
		private String description;
		private String tone;
	}
}