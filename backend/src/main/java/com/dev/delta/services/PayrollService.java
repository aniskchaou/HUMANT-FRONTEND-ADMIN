package com.dev.delta.services;

import com.dev.delta.dto.PayrollRunRequest;
import com.dev.delta.dto.PayrollRunResponse;
import com.dev.delta.entities.Bonus;
import com.dev.delta.entities.Deduction;
import com.dev.delta.entities.Payroll;
import com.dev.delta.entities.Employee;
import com.dev.delta.entities.EmployeeNotification.NotificationPriority;
import com.dev.delta.entities.EmployeeNotification.NotificationType;
import com.dev.delta.entities.PaySlip;
import com.dev.delta.entities.Salary;
import com.dev.delta.entities.Tax;
import com.dev.delta.repositories.BonusRepository;
import com.dev.delta.repositories.DeductionRepository;
import com.dev.delta.repositories.EmployeeRepository;
import com.dev.delta.repositories.PaySlipRepository;
import com.dev.delta.repositories.PayrollRepository;
import com.dev.delta.repositories.TaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PayrollService {
    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private BonusRepository bonusRepository;

    @Autowired
    private DeductionRepository deductionRepository;

    @Autowired
    private TaxRepository taxRepository;

    @Autowired
    private PaySlipRepository paySlipRepository;

    @Autowired
    private EmployeeNotificationService employeeNotificationService;

    public List<Payroll> findAll() {
        return payrollRepository.findAllByOrderByPayrollDateDescIdDesc();
    }

    public Optional<Payroll> findById(Long id) {
        return payrollRepository.findById(id);
    }

    public Payroll save(Payroll payroll) {
        payroll.setEmployee(resolveEmployee(payroll.getEmployee()));
        return payrollRepository.save(payroll);
    }

    public Payroll update(Long id, Payroll payrollDetails) {
        Payroll payroll = payrollRepository.findById(id).orElseThrow();
        payroll.setPayrollDate(payrollDetails.getPayrollDate());
        payroll.setCycleMonth(
                payrollDetails.getCycleMonth() != null ? payrollDetails.getCycleMonth() : payroll.getCycleMonth()
        );
        payroll.setBasicSalary(payrollDetails.getBasicSalary());
        payroll.setAllowanceTotal(
                payrollDetails.getAllowanceTotal() != null
                        ? payrollDetails.getAllowanceTotal()
                        : payroll.getAllowanceTotal()
        );
        payroll.setGrossSalary(
                payrollDetails.getGrossSalary() != null ? payrollDetails.getGrossSalary() : payroll.getGrossSalary()
        );
        payroll.setBonus(payrollDetails.getBonus());
        payroll.setDeductions(payrollDetails.getDeductions());
        payroll.setTaxAmount(
                payrollDetails.getTaxAmount() != null ? payrollDetails.getTaxAmount() : payroll.getTaxAmount()
        );
        payroll.setNetSalary(payrollDetails.getNetSalary());
        payroll.setSalaryStructureName(
                payrollDetails.getSalaryStructureName() != null
                        ? payrollDetails.getSalaryStructureName()
                        : payroll.getSalaryStructureName()
        );
        payroll.setNotes(payrollDetails.getNotes() != null ? payrollDetails.getNotes() : payroll.getNotes());
        payroll.setEmployee(resolveEmployee(payrollDetails.getEmployee()));
        return payrollRepository.save(payroll);
    }

    public PayrollRunResponse runPayroll(PayrollRunRequest request) {
        YearMonth cycle = resolveCycleMonth(request != null ? request.getCycleMonth() : null);
        String cycleMonth = cycle.toString();
        LocalDate cycleEnd = cycle.atEndOfMonth();
        LocalDate cycleStart = cycle.atDay(1);
        boolean overwriteExisting = request == null || request.getOverwriteExisting() == null || request.getOverwriteExisting();
        boolean generatePayslips = request == null || request.getGeneratePayslips() == null || request.getGeneratePayslips();

        Map<Long, BigDecimal> bonusTotals = sumBonuses(
                bonusRepository.findByDateGrantedBetween(cycleStart, cycleEnd)
        );
        Map<Long, BigDecimal> deductionTotals = sumDeductions(
                deductionRepository.findByDeductionDateBetween(cycleStart, cycleEnd)
        );
        Map<Long, BigDecimal> taxTotals = sumTaxes(
                taxRepository.findByTaxDateBetween(cycleStart, cycleEnd)
        );

        List<String> warnings = new ArrayList<>();
        List<Employee> employees = employeeRepository.findAllByOrderByFullNameAsc();

        int createdPayrollCount = 0;
        int updatedPayrollCount = 0;
        int createdPaySlipCount = 0;
        int updatedPaySlipCount = 0;
        int skippedEmployees = 0;
        BigDecimal totalGrossPay = BigDecimal.ZERO;
        BigDecimal totalNetPay = BigDecimal.ZERO;

        for (Employee employee : employees) {
            Salary salary = employee.getSalary();

            if (salary == null) {
                skippedEmployees++;
                warnings.add(resolveEmployeeName(employee) + " has no salary structure assigned.");
                continue;
            }

            BigDecimal basicSalary = parseAmount(salary.getBasicSalary());
            BigDecimal medicalAllowance = parseAmount(salary.getMedicalAllowance());
            BigDecimal conveyanceAllowance = parseAmount(salary.getConveyanceAllowance());
            BigDecimal allowanceTotal = medicalAllowance.add(conveyanceAllowance);
            BigDecimal configuredTotal = parseAmount(salary.getTotalSalary());
            BigDecimal grossSalary = configuredTotal.compareTo(BigDecimal.ZERO) > 0
                    ? configuredTotal
                    : basicSalary.add(allowanceTotal);
            BigDecimal bonus = bonusTotals.getOrDefault(employee.getId(), BigDecimal.ZERO);
            BigDecimal deductions = deductionTotals.getOrDefault(employee.getId(), BigDecimal.ZERO);
            BigDecimal taxes = taxTotals.getOrDefault(employee.getId(), BigDecimal.ZERO);
            BigDecimal netSalary = grossSalary.add(bonus).subtract(deductions).subtract(taxes);

            if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
                netSalary = BigDecimal.ZERO;
            }

            String salaryStructureName = normalizeText(salary.getSalaryName());
            String notes = "Auto-generated payroll for " + cycleMonth;

            Payroll payroll = payrollRepository
                    .findFirstByEmployeeIdAndCycleMonthOrderByIdDesc(employee.getId(), cycleMonth)
                    .orElseGet(Payroll::new);
            boolean payrollExists = payroll.getId() != null;

            if (payrollExists && !overwriteExisting) {
                skippedEmployees++;
                warnings.add(resolveEmployeeName(employee) + " already has payroll history for " + cycleMonth + ".");
                continue;
            }

            payroll.setPayrollDate(cycleEnd);
            payroll.setCycleMonth(cycleMonth);
            payroll.setBasicSalary(basicSalary);
            payroll.setAllowanceTotal(allowanceTotal);
            payroll.setGrossSalary(grossSalary);
            payroll.setBonus(bonus);
            payroll.setDeductions(deductions);
            payroll.setTaxAmount(taxes);
            payroll.setNetSalary(netSalary);
            payroll.setSalaryStructureName(
                    salaryStructureName.isEmpty() ? "Assigned salary" : salaryStructureName
            );
            payroll.setNotes(notes);
            payroll.setEmployee(employee);
            payrollRepository.save(payroll);

            if (payrollExists) {
                updatedPayrollCount++;
            } else {
                createdPayrollCount++;
            }

            totalGrossPay = totalGrossPay.add(grossSalary);
            totalNetPay = totalNetPay.add(netSalary);

            employeeNotificationService.publishNotification(
                    employee,
                    NotificationType.PAYROLL_PROCESSED,
                    "Payroll processed",
                    "Payroll for " + cycleMonth + " was processed with net pay " + netSalary + ".",
                    "/salary",
                    "payroll-" + cycleMonth,
                    NotificationPriority.MEDIUM,
                    "Payroll engine"
            );

            if (!generatePayslips) {
                continue;
            }

            PaySlip paySlip = paySlipRepository
                    .findFirstByEmployeeIdAndCycleMonthOrderByIdDesc(employee.getId(), cycleMonth)
                    .orElseGet(PaySlip::new);
            boolean paySlipExists = paySlip.getId() != null;

            paySlip.setIssueDate(cycleEnd);
            paySlip.setCycleMonth(cycleMonth);
            paySlip.setBasicSalary(basicSalary);
            paySlip.setAllowanceTotal(allowanceTotal);
            paySlip.setGrossSalary(grossSalary);
            paySlip.setBonus(bonus);
            paySlip.setDeductions(deductions);
            paySlip.setTaxAmount(taxes);
            paySlip.setNetSalary(netSalary);
            paySlip.setSalaryStructureName(
                    salaryStructureName.isEmpty() ? "Assigned salary" : salaryStructureName
            );
            paySlip.setEmployee(employee);
            paySlip.setRemarks(notes);
            paySlipRepository.save(paySlip);

            if (paySlipExists) {
                updatedPaySlipCount++;
            } else {
                createdPaySlipCount++;
            }
        }

        PayrollRunResponse response = new PayrollRunResponse();
        response.setCycleMonth(cycleMonth);
        response.setGeneratedOn(LocalDate.now());
        response.setCreatedPayrollCount(createdPayrollCount);
        response.setUpdatedPayrollCount(updatedPayrollCount);
        response.setCreatedPaySlipCount(createdPaySlipCount);
        response.setUpdatedPaySlipCount(updatedPaySlipCount);
        response.setSkippedEmployees(skippedEmployees);
        response.setEmployeesProcessed(createdPayrollCount + updatedPayrollCount);
        response.setTotalGrossPay(totalGrossPay);
        response.setTotalNetPay(totalNetPay);
        response.setWarnings(warnings);
        return response;
    }

    public void deleteById(Long id) {
        payrollRepository.deleteById(id);
    }

    private YearMonth resolveCycleMonth(String value) {
        if (value != null) {
            try {
                return YearMonth.parse(value.trim());
            } catch (RuntimeException ignored) {
            }
        }

        return YearMonth.now();
    }

    private Map<Long, BigDecimal> sumBonuses(List<Bonus> bonuses) {
        Map<Long, BigDecimal> totals = new HashMap<>();

        for (Bonus bonus : bonuses) {
            Long employeeId = resolveEmployeeId(bonus != null ? bonus.getEmployee() : null);

            if (employeeId == null) {
                continue;
            }

            totals.merge(employeeId, defaultAmount(bonus.getAmount()), BigDecimal::add);
        }

        return totals;
    }

    private Map<Long, BigDecimal> sumDeductions(List<Deduction> deductions) {
        Map<Long, BigDecimal> totals = new HashMap<>();

        for (Deduction deduction : deductions) {
            Long employeeId = resolveEmployeeId(deduction != null ? deduction.getEmployee() : null);

            if (employeeId == null) {
                continue;
            }

            totals.merge(employeeId, defaultAmount(deduction.getAmount()), BigDecimal::add);
        }

        return totals;
    }

    private Map<Long, BigDecimal> sumTaxes(List<Tax> taxes) {
        Map<Long, BigDecimal> totals = new HashMap<>();

        for (Tax tax : taxes) {
            Long employeeId = resolveEmployeeId(tax != null ? tax.getEmployee() : null);

            if (employeeId == null) {
                continue;
            }

            totals.merge(employeeId, defaultAmount(tax.getAmount()), BigDecimal::add);
        }

        return totals;
    }

    private Long resolveEmployeeId(Employee employee) {
        return employee != null ? employee.getId() : null;
    }

    private String resolveEmployeeName(Employee employee) {
        if (employee == null) {
            return "Employee";
        }

        if (employee.getFullName() != null && !employee.getFullName().trim().isEmpty()) {
            return employee.getFullName().trim();
        }

        return employee.getId() != null ? "Employee #" + employee.getId() : "Employee";
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal parseAmount(String value) {
        if (value == null || value.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException exception) {
            return BigDecimal.ZERO;
        }
    }

    private String normalizeText(String value) {
        return value != null ? value.trim() : "";
    }

    private Employee resolveEmployee(Employee employee) {
        if (employee == null || employee.getId() == null) {
            return null;
        }

        return employeeRepository.findById(employee.getId()).orElseThrow();
    }
}
