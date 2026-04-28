package com.dev.delta.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "workspace_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    private String companyEmail;

    private String companyAddress;

    @ManyToOne
    @JoinColumn(name = "default_company_id")
    private Company defaultCompany;

    private String language;

    private String currency;

    private String timezone;

    private Integer payrollCutoffDay;

    private String approvalMode;

    private String payslipSignature;

    private String notificationMode;

    private Boolean autoLeaveBalanceEnabled;

    private Boolean autoPayrollEnabled;

    private Boolean customApprovalFlowsEnabled;

    private Boolean ruleBasedTriggersEnabled;

    private Integer reminderWindowDays;

    private Integer passwordMinLength;

    private Integer sessionTimeoutMinutes;

    private Boolean allowRememberMe;

    private String approvalStages;

    private LocalDateTime updatedAt;
}