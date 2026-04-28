package com.dev.delta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutomationReminderDTO {
    private String reminderType;
    private Long employeeId;
    private String employeeName;
    private String title;
    private String subject;
    private String dueDate;
    private long daysRemaining;
    private String severity;
    private String route;
}