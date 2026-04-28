import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

type Tone = 'strong' | 'medium' | 'warning' | 'critical';
type AdjustmentKind = 'bonus' | 'deduction' | 'tax';
type SalaryEditorMode = 'create' | 'edit';
type AdjustmentEditorMode = 'create' | 'edit';

interface EmployeeOption {
  id: number;
  name: string;
  salaryId: number | null;
  salaryName: string;
  basicSalary: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  allowanceTotal: number;
  grossSalary: number;
}

interface SalaryView {
  id: number;
  name: string;
  basicSalary: number;
  totalSalary: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  allowanceTotal: number;
  assignedEmployees: number;
  summary: string;
  qualityLabel: string;
  qualityTone: Tone;
}

interface AdjustmentView {
  id: number;
  kind: AdjustmentKind;
  employeeId: number | null;
  employeeName: string;
  label: string;
  amount: number;
  date: string;
  dateLabel: string;
  cycleMonth: string;
  summary: string;
}

interface PayrollPreviewView {
  employeeId: number;
  employeeName: string;
  salaryStructureName: string;
  basicSalary: number;
  allowanceTotal: number;
  grossSalary: number;
  bonus: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  generatedPayroll: boolean;
  generatedPaySlip: boolean;
  missingStructure: boolean;
  statusLabel: string;
  statusTone: Tone;
  summary: string;
}

interface PayrollHistoryView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  cycleMonth: string;
  payrollDate: string;
  payrollDateLabel: string;
  salaryStructureName: string;
  grossSalary: number;
  bonus: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  notes: string;
}

interface PaySlipView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  cycleMonth: string;
  issueDate: string;
  issueDateLabel: string;
  salaryStructureName: string;
  grossSalary: number;
  bonus: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  remarks: string;
}

interface PayrollRunResult {
  cycleMonth: string;
  generatedOn: string;
  createdPayrollCount: number;
  updatedPayrollCount: number;
  createdPaySlipCount: number;
  updatedPaySlipCount: number;
  skippedEmployees: number;
  employeesProcessed: number;
  totalGrossPay: number;
  totalNetPay: number;
  warnings: string[];
}

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css'],
})
export class SalaryComponent extends URLLoader implements OnInit {
  loading = false;
  savingSalary = false;
  savingAdjustment = false;
  runningPayroll = false;
  salarySubmitted = false;
  adjustmentSubmitted = false;
  loadError = '';

  selectedCycleMonth = this.createInitialCycleMonth();
  replaceExistingRecords = true;

  salaryModalMode: SalaryEditorMode = 'create';
  adjustmentModalMode: AdjustmentEditorMode = 'create';
  activeSalaryId: number = null;
  activeAdjustmentId: number = null;
  activeAdjustmentKind: AdjustmentKind = 'bonus';
  deletingSalaryId: number = null;
  deletingAdjustmentId: number = null;

  employees: EmployeeOption[] = [];
  salaries: SalaryView[] = [];
  adjustments: AdjustmentView[] = [];
  previewRows: PayrollPreviewView[] = [];
  payrollHistory: PayrollHistoryView[] = [];
  paySlips: PaySlipView[] = [];
  featuredPreview: PayrollPreviewView = null;
  lastRunResult: PayrollRunResult = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly salaryForm: FormGroup;
  readonly adjustmentForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.salaryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      basicSalary: ['', [Validators.required]],
      totalSalary: [''],
      medicalAllowance: [''],
      conveyanceAllowance: [''],
    });
    this.adjustmentForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      label: ['', [Validators.required, Validators.maxLength(120)]],
      amount: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get cycleLabel(): string {
    return this.formatCycleLabel(this.selectedCycleMonth);
  }

  get totalStructuresCount(): number {
    return this.salaries.length;
  }

  get assignedEmployeeCount(): number {
    return this.employees.filter((item) => item.salaryId !== null).length;
  }

  get readyEmployeeCount(): number {
    return this.previewRows.filter((item) => !item.missingStructure).length;
  }

  get pendingPayrollCount(): number {
    return this.previewRows.filter((item) => !item.missingStructure && !item.generatedPayroll).length;
  }

  get generatedPaySlipCount(): number {
    return this.currentCyclePaySlips.length;
  }

  get currentCycleGrossTotal(): number {
    return this.previewRows.reduce((sum, item) => sum + item.grossSalary, 0);
  }

  get currentCycleNetTotal(): number {
    return this.previewRows.reduce((sum, item) => sum + item.netSalary, 0);
  }

  get currentCycleTaxTotal(): number {
    return this.previewRows.reduce((sum, item) => sum + item.taxes, 0);
  }

  get bonusAdjustments(): AdjustmentView[] {
    return this.getAdjustmentsByKind('bonus');
  }

  get deductionAdjustments(): AdjustmentView[] {
    return this.getAdjustmentsByKind('deduction');
  }

  get taxAdjustments(): AdjustmentView[] {
    return this.getAdjustmentsByKind('tax');
  }

  get currentCyclePayrolls(): PayrollHistoryView[] {
    return this.payrollHistory.filter((item) => item.cycleMonth === this.selectedCycleMonth);
  }

  get currentCyclePaySlips(): PaySlipView[] {
    return this.paySlips.filter((item) => item.cycleMonth === this.selectedCycleMonth);
  }

  get salaryModalTitle(): string {
    return this.salaryModalMode === 'create' ? 'Create salary structure' : 'Edit salary structure';
  }

  get salaryModalCopy(): string {
    return this.salaryModalMode === 'create'
      ? 'Define the structure payroll should use as the monthly baseline for assigned employees.'
      : 'Adjust the structure totals so payroll calculations stay aligned with the intended package.';
  }

  get adjustmentModalTitle(): string {
    return this.adjustmentModalMode === 'create'
      ? 'Add ' + this.getAdjustmentKindLabel(this.activeAdjustmentKind)
      : 'Edit ' + this.getAdjustmentKindLabel(this.activeAdjustmentKind);
  }

  get adjustmentModalCopy(): string {
    return 'Capture the employee, label, amount, and date so this adjustment flows into the selected payroll cycle.';
  }

  get draftSalaryName(): string {
    return this.normalizeText(this.salaryForm.value.name) || 'Untitled payroll structure';
  }

  get draftSalaryBasic(): number {
    return this.toAmount(this.salaryForm.value.basicSalary);
  }

  get draftSalaryAllowanceTotal(): number {
    return (
      this.toAmount(this.salaryForm.value.medicalAllowance) +
      this.toAmount(this.salaryForm.value.conveyanceAllowance)
    );
  }

  get draftSalaryTotal(): number {
    const enteredTotal = this.toAmount(this.salaryForm.value.totalSalary);
    return enteredTotal > 0 ? enteredTotal : this.draftSalaryBasic + this.draftSalaryAllowanceTotal;
  }

  get draftAdjustmentEmployeeName(): string {
    return this.lookupEmployeeName(this.adjustmentForm.value.employeeId) || 'Employee pending';
  }

  get draftAdjustmentAmount(): number {
    return this.toAmount(this.adjustmentForm.value.amount);
  }

  get draftAdjustmentDateLabel(): string {
    return this.formatDateLabel(this.normalizeText(this.adjustmentForm.value.date));
  }

  get featuredPreviewRecommendation(): string {
    if (!this.featuredPreview) {
      return 'Select an employee row to inspect how salary structure, adjustments, and generated records shape payroll output.';
    }

    if (this.featuredPreview.missingStructure) {
      return 'Assign a salary structure before this employee can move into the automated payroll cycle.';
    }

    if (!this.featuredPreview.generatedPayroll) {
      return 'This employee is ready for payroll, but the current cycle has not been generated yet.';
    }

    if (!this.featuredPreview.generatedPaySlip) {
      return 'Payroll history exists for this cycle, but the pay slip should still be regenerated or reviewed.';
    }

    return 'This employee already has a generated payroll record and pay slip for the selected cycle.';
  }

  onCycleMonthChange(value: string): void {
    this.selectedCycleMonth = value || this.createInitialCycleMonth();
    this.rebuildPreview();
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  selectPreview(row: PayrollPreviewView): void {
    this.featuredPreview = row;
  }

  openCreateSalaryModal(): void {
    this.salaryModalMode = 'create';
    this.activeSalaryId = null;
    this.salarySubmitted = false;
    this.salaryForm.reset({
      name: '',
      basicSalary: '',
      totalSalary: '',
      medicalAllowance: '',
      conveyanceAllowance: '',
    });
  }

  openEditSalaryModal(item: SalaryView): void {
    this.salaryModalMode = 'edit';
    this.activeSalaryId = item.id;
    this.salarySubmitted = false;
    this.salaryForm.reset({
      name: item.name,
      basicSalary: item.basicSalary ? String(item.basicSalary) : '',
      totalSalary: item.totalSalary ? String(item.totalSalary) : '',
      medicalAllowance: item.medicalAllowance ? String(item.medicalAllowance) : '0',
      conveyanceAllowance: item.conveyanceAllowance ? String(item.conveyanceAllowance) : '0',
    });
  }

  openCreateAdjustmentModal(kind: AdjustmentKind): void {
    this.adjustmentModalMode = 'create';
    this.activeAdjustmentKind = kind;
    this.activeAdjustmentId = null;
    this.adjustmentSubmitted = false;
    this.adjustmentForm.reset({
      employeeId: '',
      label: '',
      amount: '',
      date: this.selectedCycleMonth ? this.selectedCycleMonth + '-01' : '',
    });
  }

  openEditAdjustmentModal(item: AdjustmentView): void {
    this.adjustmentModalMode = 'edit';
    this.activeAdjustmentKind = item.kind;
    this.activeAdjustmentId = item.id;
    this.adjustmentSubmitted = false;
    this.adjustmentForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      label: item.label,
      amount: item.amount ? String(item.amount) : '',
      date: item.date,
    });
  }

  trackByNumericId(index: number, item: { id: number }): number {
    return item.id || index;
  }

  async saveSalary(): Promise<void> {
    this.salarySubmitted = true;

    const payload = this.buildSalaryPayload();
    if (!payload) {
      this.salaryForm.markAllAsTouched();
      return;
    }

    this.savingSalary = true;

    try {
      if (this.salaryModalMode === 'edit' && this.activeSalaryId !== null) {
        await this.httpService.update(CONFIG.URL_BASE + '/salary/update/' + this.activeSalaryId, payload);
        super.show('Confirmation', 'Salary structure updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/salary/create', payload);
        super.show('Confirmation', 'Salary structure created successfully.', 'success');
      }

      this.closeModal('salaryCrudModalClose');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.savingSalary = false;
    }
  }

  async deleteSalary(item: SalaryView): Promise<void> {
    const confirmed = confirm('Delete "' + item.name + '"? This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    this.deletingSalaryId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/salary/delete/' + item.id);
      super.show('Confirmation', 'Salary structure deleted successfully.', 'success');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingSalaryId = null;
    }
  }

  async saveAdjustment(): Promise<void> {
    this.adjustmentSubmitted = true;

    const request = this.buildAdjustmentRequest();
    if (!request) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }

    this.savingAdjustment = true;

    try {
      if (this.adjustmentModalMode === 'edit' && this.activeAdjustmentId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + request.endpoint + '/' + this.activeAdjustmentId,
          request.payload
        );
        super.show(
          'Confirmation',
          this.getAdjustmentKindLabel(this.activeAdjustmentKind) + ' updated successfully.',
          'success'
        );
      } else {
        await this.httpService.create(CONFIG.URL_BASE + request.endpoint, request.payload);
        super.show(
          'Confirmation',
          this.getAdjustmentKindLabel(this.activeAdjustmentKind) + ' added successfully.',
          'success'
        );
      }

      this.closeModal('adjustmentCrudModalClose');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.savingAdjustment = false;
    }
  }

  async deleteAdjustment(item: AdjustmentView): Promise<void> {
    const confirmed = confirm(
      'Delete this ' + this.getAdjustmentKindLabel(item.kind).toLowerCase() + ' for "' + item.employeeName + '"?'
    );

    if (!confirmed) {
      return;
    }

    this.deletingAdjustmentId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + this.getAdjustmentEndpoint(item.kind) + '/' + item.id);
      super.show(
        'Confirmation',
        this.getAdjustmentKindLabel(item.kind) + ' deleted successfully.',
        'success'
      );
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingAdjustmentId = null;
    }
  }

  async runPayroll(): Promise<void> {
    if (!this.previewRows.length) {
      super.show('Warning', 'No employees are currently available for payroll calculation.', 'warning');
      return;
    }

    const confirmed = confirm(
      'Run payroll for ' +
        this.cycleLabel +
        ' and generate pay slips' +
        (this.replaceExistingRecords ? ' with replacement of existing records?' : '?')
    );

    if (!confirmed) {
      return;
    }

    this.runningPayroll = true;

    try {
      const response = await this.httpService.postWithResponse<PayrollRunResult>(
        CONFIG.URL_BASE + '/api/payrolls/run',
        {
          cycleMonth: this.selectedCycleMonth,
          generatePayslips: true,
          overwriteExisting: this.replaceExistingRecords,
        }
      );

      this.lastRunResult = this.normalizeRunResult(response);
      super.show(
        'Confirmation',
        'Payroll run completed for ' + this.formatCycleLabel(this.lastRunResult.cycleMonth) + '.',
        'success'
      );
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.runningPayroll = false;
    }
  }

  countEmployeesForSalary(salaryId: number): number {
    return this.employees.filter((item) => item.salaryId === salaryId).length;
  }

  getCurrentCycleAdjustmentTotal(kind: AdjustmentKind): number {
    return this.adjustments
      .filter((item) => item.kind === kind && item.cycleMonth === this.selectedCycleMonth)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private loadWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all'),
      salaries: this.httpService.getAll(CONFIG.URL_BASE + '/salary/all'),
      bonuses: this.httpService.getAll(CONFIG.URL_BASE + '/api/bonuses'),
      deductions: this.httpService.getAll(CONFIG.URL_BASE + '/api/deductions'),
      taxes: this.httpService.getAll(CONFIG.URL_BASE + '/api/taxes'),
      payrolls: this.httpService.getAll(CONFIG.URL_BASE + '/api/payrolls'),
      paySlips: this.httpService.getAll(CONFIG.URL_BASE + '/api/pay-slips'),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployees(result.employees);
          this.salaries = this.normalizeSalaries(result.salaries);
          this.adjustments = this.normalizeAdjustments(
            result.bonuses,
            result.deductions,
            result.taxes
          );
          this.payrollHistory = this.normalizePayrolls(result.payrolls);
          this.paySlips = this.normalizePaySlips(result.paySlips);
          this.rebuildPreview();

          if (showNotification) {
            super.show('Confirmation', 'Payroll workspace refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.employees = [];
          this.salaries = [];
          this.adjustments = [];
          this.previewRows = [];
          this.payrollHistory = [];
          this.paySlips = [];
          this.featuredPreview = null;
          this.loadError = 'Unable to load the payroll workspace from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private rebuildPreview(): void {
    const payrollIndex = new Map<number, PayrollHistoryView>();
    const paySlipIndex = new Map<number, PaySlipView>();

    this.currentCyclePayrolls.forEach((item) => {
      if (item.employeeId !== null && !payrollIndex.has(item.employeeId)) {
        payrollIndex.set(item.employeeId, item);
      }
    });

    this.currentCyclePaySlips.forEach((item) => {
      if (item.employeeId !== null && !paySlipIndex.has(item.employeeId)) {
        paySlipIndex.set(item.employeeId, item);
      }
    });

    this.previewRows = this.employees
      .map((employee) => {
        const missingStructure = employee.salaryId === null;
        const bonus = this.sumAdjustmentsForEmployee('bonus', employee.id, this.selectedCycleMonth);
        const deductions = this.sumAdjustmentsForEmployee('deduction', employee.id, this.selectedCycleMonth);
        const taxes = this.sumAdjustmentsForEmployee('tax', employee.id, this.selectedCycleMonth);
        const grossSalary = missingStructure ? 0 : employee.grossSalary;
        const netSalary = missingStructure
          ? 0
          : Math.max(0, grossSalary + bonus - deductions - taxes);
        const existingPayroll = payrollIndex.get(employee.id);
        const existingPaySlip = paySlipIndex.get(employee.id);
        const status = this.resolvePreviewStatus(
          missingStructure,
          !!existingPayroll,
          !!existingPaySlip,
          taxes,
          deductions
        );

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          salaryStructureName: missingStructure ? 'Salary structure required' : employee.salaryName,
          basicSalary: employee.basicSalary,
          allowanceTotal: employee.allowanceTotal,
          grossSalary,
          bonus,
          deductions,
          taxes,
          netSalary,
          generatedPayroll: !!existingPayroll,
          generatedPaySlip: !!existingPaySlip,
          missingStructure,
          statusLabel: status.label,
          statusTone: status.tone,
          summary: this.buildPreviewSummary(employee.name, grossSalary, bonus, deductions, taxes, netSalary, missingStructure),
        };
      })
      .sort((left, right) => {
        if (left.missingStructure !== right.missingStructure) {
          return left.missingStructure ? 1 : -1;
        }

        if (left.generatedPayroll !== right.generatedPayroll) {
          return left.generatedPayroll ? 1 : -1;
        }

        return left.employeeName.localeCompare(right.employeeName);
      });

    if (!this.previewRows.length) {
      this.featuredPreview = null;
      return;
    }

    if (
      !this.featuredPreview ||
      !this.previewRows.some((item) => item.employeeId === this.featuredPreview.employeeId)
    ) {
      this.featuredPreview = this.previewRows[0];
    } else {
      this.featuredPreview =
        this.previewRows.find((item) => item.employeeId === this.featuredPreview.employeeId) ||
        this.previewRows[0];
    }
  }

  private normalizeEmployees(data: unknown): EmployeeOption[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => {
        const employeeId = this.toNumericId(record && record.id);
        const salary = record && record.salary ? record.salary : null;
        const salaryId = this.toNumericId(salary && salary.id);
        const basicSalary = this.toAmount(salary && salary.basicSalary);
        const medicalAllowance = this.toAmount(salary && salary.medicalAllowance);
        const conveyanceAllowance = this.toAmount(salary && salary.conveyanceAllowance);
        const allowanceTotal = medicalAllowance + conveyanceAllowance;
        const configuredTotal = this.toAmount(salary && salary.totalSalary);
        const grossSalary = configuredTotal > 0 ? configuredTotal : basicSalary + allowanceTotal;

        return {
          id: employeeId,
          name:
            this.normalizeText(record && record.fullName) ||
            ['Employee', employeeId !== null ? '#' + employeeId : 'pending'].join(' '),
          salaryId,
          salaryName:
            this.normalizeText(salary && salary.salaryName) ||
            (salaryId !== null ? 'Assigned salary structure' : ''),
          basicSalary,
          medicalAllowance,
          conveyanceAllowance,
          allowanceTotal,
          grossSalary,
        };
      })
      .filter((item) => item.id !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private normalizeSalaries(data: unknown): SalaryView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const name = this.normalizeText(record && record.salaryName) || 'Untitled payroll structure';
        const basicSalary = this.toAmount(record && record.basicSalary);
        const medicalAllowance = this.toAmount(record && record.medicalAllowance);
        const conveyanceAllowance = this.toAmount(record && record.conveyanceAllowance);
        const allowanceTotal = medicalAllowance + conveyanceAllowance;
        const totalSalary = this.toAmount(record && record.totalSalary) || basicSalary + allowanceTotal;
        const assignedEmployees = this.countEmployeesForSalary(id);
        const balanced = totalSalary === basicSalary + allowanceTotal;
        const qualityTone: SalaryView['qualityTone'] = balanced
          ? 'strong'
          : totalSalary > 0
          ? 'warning'
          : 'critical';

        return {
          id,
          name,
          basicSalary,
          totalSalary,
          medicalAllowance,
          conveyanceAllowance,
          allowanceTotal,
          assignedEmployees,
          summary:
            name +
            ' pays ' +
            this.formatMoney(totalSalary) +
            ' monthly with ' +
            this.formatMoney(allowanceTotal) +
            ' reserved for allowances.',
          qualityLabel: balanced ? 'Aligned' : totalSalary > 0 ? 'Check totals' : 'Incomplete',
          qualityTone,
        };
      })
      .sort((left, right) => right.totalSalary - left.totalSalary || left.name.localeCompare(right.name));
  }

  private normalizeAdjustments(
    bonuses: unknown,
    deductions: unknown,
    taxes: unknown
  ): AdjustmentView[] {
    return [
      ...this.normalizeBonusAdjustments(bonuses),
      ...this.normalizeDeductionAdjustments(deductions),
      ...this.normalizeTaxAdjustments(taxes),
    ].sort((left, right) => right.date.localeCompare(left.date) || left.employeeName.localeCompare(right.employeeName));
  }

  private normalizeBonusAdjustments(data: unknown): AdjustmentView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toAdjustmentView('bonus', record, index));
  }

  private normalizeDeductionAdjustments(data: unknown): AdjustmentView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toAdjustmentView('deduction', record, index));
  }

  private normalizeTaxAdjustments(data: unknown): AdjustmentView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toAdjustmentView('tax', record, index));
  }

  private toAdjustmentView(kind: AdjustmentKind, record: any, index: number): AdjustmentView {
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.lookupEmployeeName(employeeId) ||
      'Employee pending';
    const label =
      kind === 'bonus'
        ? this.normalizeText(record && record.reason)
        : kind === 'deduction'
        ? this.normalizeText(record && record.type)
        : this.normalizeText(record && record.taxType);
    const date =
      kind === 'bonus'
        ? this.normalizeText(record && record.dateGranted)
        : kind === 'deduction'
        ? this.normalizeText(record && record.deductionDate)
        : this.normalizeText(record && record.taxDate);
    const amount = this.toAmount(record && record.amount);
    const id = this.toNumericId(record && record.id) || index + 1;
    const kindLabel = this.getAdjustmentKindLabel(kind);

    return {
      id,
      kind,
      employeeId,
      employeeName,
      label: label || kindLabel,
      amount,
      date,
      dateLabel: this.formatDateLabel(date),
      cycleMonth: this.resolveCycleMonth(date),
      summary:
        employeeName +
        ' has a ' +
        this.formatMoney(amount) +
        ' ' +
        kindLabel.toLowerCase() +
        ' tagged as ' +
        (label || 'Adjustment') +
        '.',
    };
  }

  private normalizePayrolls(data: unknown): PayrollHistoryView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const payrollDate = this.normalizeText(record && record.payrollDate);
        const cycleMonth = this.normalizeText(record && record.cycleMonth) || this.resolveCycleMonth(payrollDate);

        return {
          id: this.toNumericId(record && record.id) || index + 1,
          employeeId: this.toNumericId(record && record.employee && record.employee.id),
          employeeName:
            this.normalizeText(record && record.employee && record.employee.fullName) ||
            this.lookupEmployeeName(record && record.employee && record.employee.id) ||
            'Employee pending',
          cycleMonth,
          payrollDate,
          payrollDateLabel: this.formatDateLabel(payrollDate),
          salaryStructureName:
            this.normalizeText(record && record.salaryStructureName) || 'Assigned salary structure',
          grossSalary:
            this.toAmount(record && record.grossSalary) ||
            this.toAmount(record && record.basicSalary) + this.toAmount(record && record.allowanceTotal),
          bonus: this.toAmount(record && record.bonus),
          deductions: this.toAmount(record && record.deductions),
          taxes: this.toAmount(record && record.taxAmount),
          netSalary: this.toAmount(record && record.netSalary),
          notes: this.normalizeText(record && record.notes),
        };
      })
      .sort((left, right) => right.payrollDate.localeCompare(left.payrollDate) || right.id - left.id);
  }

  private normalizePaySlips(data: unknown): PaySlipView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const issueDate = this.normalizeText(record && record.issueDate);
        const cycleMonth = this.normalizeText(record && record.cycleMonth) || this.resolveCycleMonth(issueDate);

        return {
          id: this.toNumericId(record && record.id) || index + 1,
          employeeId: this.toNumericId(record && record.employee && record.employee.id),
          employeeName:
            this.normalizeText(record && record.employee && record.employee.fullName) ||
            this.lookupEmployeeName(record && record.employee && record.employee.id) ||
            'Employee pending',
          cycleMonth,
          issueDate,
          issueDateLabel: this.formatDateLabel(issueDate),
          salaryStructureName:
            this.normalizeText(record && record.salaryStructureName) || 'Assigned salary structure',
          grossSalary:
            this.toAmount(record && record.grossSalary) ||
            this.toAmount(record && record.basicSalary) + this.toAmount(record && record.allowanceTotal),
          bonus: this.toAmount(record && record.bonus),
          deductions: this.toAmount(record && record.deductions),
          taxes: this.toAmount(record && record.taxAmount),
          netSalary: this.toAmount(record && record.netSalary),
          remarks: this.normalizeText(record && record.remarks),
        };
      })
      .sort((left, right) => right.issueDate.localeCompare(left.issueDate) || right.id - left.id);
  }

  private normalizeRunResult(data: unknown): PayrollRunResult {
    const item = (data || {}) as Record<string, unknown>;
    return {
      cycleMonth: this.normalizeText(item.cycleMonth) || this.selectedCycleMonth,
      generatedOn: this.normalizeText(item.generatedOn),
      createdPayrollCount: this.toAmount(item.createdPayrollCount),
      updatedPayrollCount: this.toAmount(item.updatedPayrollCount),
      createdPaySlipCount: this.toAmount(item.createdPaySlipCount),
      updatedPaySlipCount: this.toAmount(item.updatedPaySlipCount),
      skippedEmployees: this.toAmount(item.skippedEmployees),
      employeesProcessed: this.toAmount(item.employeesProcessed),
      totalGrossPay: this.toAmount(item.totalGrossPay),
      totalNetPay: this.toAmount(item.totalNetPay),
      warnings: Array.isArray(item.warnings) ? item.warnings.map((warning) => String(warning)) : [],
    };
  }

  private buildSalaryPayload(): {
    salaryName: string;
    basicSalary: string;
    totalSalary: string;
    medicalAllowance: string;
    conveyanceAllowance: string;
  } | null {
    const name = this.normalizeText(this.salaryForm.value.name);
    const basicSalary = this.toAmount(this.salaryForm.value.basicSalary);
    const medicalAllowance = this.toAmount(this.salaryForm.value.medicalAllowance);
    const conveyanceAllowance = this.toAmount(this.salaryForm.value.conveyanceAllowance);
    const enteredTotal = this.toAmount(this.salaryForm.value.totalSalary);
    const totalSalary = enteredTotal > 0 ? enteredTotal : basicSalary + medicalAllowance + conveyanceAllowance;

    if (!name) {
      this.salaryForm.get('name').setErrors({ required: true });
    }

    if (basicSalary <= 0) {
      this.salaryForm.get('basicSalary').setErrors({ required: true });
    }

    if (this.salaryForm.invalid || !name || basicSalary <= 0 || totalSalary <= 0) {
      return null;
    }

    return {
      salaryName: name,
      basicSalary: String(basicSalary),
      totalSalary: String(totalSalary),
      medicalAllowance: String(medicalAllowance),
      conveyanceAllowance: String(conveyanceAllowance),
    };
  }

  private buildAdjustmentRequest(): { endpoint: string; payload: unknown } | null {
    const employeeId = this.toNumericId(this.adjustmentForm.value.employeeId);
    const label = this.normalizeText(this.adjustmentForm.value.label);
    const amount = this.toAmount(this.adjustmentForm.value.amount);
    const date = this.normalizeText(this.adjustmentForm.value.date);

    if (employeeId === null) {
      this.adjustmentForm.get('employeeId').setErrors({ required: true });
    }

    if (!label) {
      this.adjustmentForm.get('label').setErrors({ required: true });
    }

    if (!date) {
      this.adjustmentForm.get('date').setErrors({ required: true });
    }

    if (amount <= 0) {
      this.adjustmentForm.get('amount').setErrors({ required: true });
    }

    if (this.adjustmentForm.invalid || employeeId === null || !label || !date || amount <= 0) {
      return null;
    }

    if (this.activeAdjustmentKind === 'bonus') {
      return {
        endpoint: '/api/bonuses',
        payload: {
          reason: label,
          amount,
          dateGranted: date,
          employee: { id: employeeId },
        },
      };
    }

    if (this.activeAdjustmentKind === 'deduction') {
      return {
        endpoint: '/api/deductions',
        payload: {
          type: label,
          amount,
          deductionDate: date,
          employee: { id: employeeId },
        },
      };
    }

    return {
      endpoint: '/api/taxes',
      payload: {
        taxType: label,
        amount,
        taxDate: date,
        employee: { id: employeeId },
      },
    };
  }

  private getAdjustmentsByKind(kind: AdjustmentKind): AdjustmentView[] {
    return this.adjustments.filter((item) => item.kind === kind);
  }

  getAdjustmentKindLabel(kind: AdjustmentKind): string {
    return kind === 'bonus' ? 'Bonus' : kind === 'deduction' ? 'Deduction' : 'Tax';
  }

  private getAdjustmentEndpoint(kind: AdjustmentKind): string {
    return kind === 'bonus'
      ? '/api/bonuses'
      : kind === 'deduction'
      ? '/api/deductions'
      : '/api/taxes';
  }

  private resolvePreviewStatus(
    missingStructure: boolean,
    generatedPayroll: boolean,
    generatedPaySlip: boolean,
    taxes: number,
    deductions: number
  ): { label: string; tone: Tone } {
    if (missingStructure) {
      return { label: 'Missing structure', tone: 'critical' };
    }

    if (generatedPayroll && generatedPaySlip) {
      return { label: 'Generated', tone: 'strong' };
    }

    if (generatedPayroll) {
      return { label: 'History saved', tone: 'medium' };
    }

    if (taxes > 0) {
      return { label: 'Ready with tax', tone: 'warning' };
    }

    if (deductions > 0) {
      return { label: 'Ready with deductions', tone: 'medium' };
    }

    return { label: 'Ready to run', tone: 'strong' };
  }

  private buildPreviewSummary(
    employeeName: string,
    grossSalary: number,
    bonus: number,
    deductions: number,
    taxes: number,
    netSalary: number,
    missingStructure: boolean
  ): string {
    if (missingStructure) {
      return employeeName + ' needs a salary structure before payroll can be generated.';
    }

    return (
      employeeName +
      ' currently projects ' +
      this.formatMoney(netSalary) +
      ' net from ' +
      this.formatMoney(grossSalary) +
      ' gross, ' +
      this.formatMoney(bonus) +
      ' in bonuses, ' +
      this.formatMoney(deductions) +
      ' in deductions, and ' +
      this.formatMoney(taxes) +
      ' in taxes.'
    );
  }

  private sumAdjustmentsForEmployee(
    kind: AdjustmentKind,
    employeeId: number,
    cycleMonth: string
  ): number {
    return this.adjustments
      .filter(
        (item) =>
          item.kind === kind && item.employeeId === employeeId && item.cycleMonth === cycleMonth
      )
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private lookupEmployeeName(value: unknown): string {
    const employeeId = this.toNumericId(value);

    if (employeeId === null) {
      return '';
    }

    const employee = this.employees.find((item) => item.id === employeeId);
    return employee ? employee.name : '';
  }

  private resolveCycleMonth(value: string): string {
    return value && value.length >= 7 ? value.slice(0, 7) : this.createInitialCycleMonth();
  }

  private createInitialCycleMonth(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return today.getFullYear() + '-' + month;
  }

  private closeModal(buttonId: string): void {
    const closeButton = document.getElementById(buttonId);

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toAmount(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? Math.round(numericValue) : 0;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  private formatDateLabel(value: string): string {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return 'Date pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  formatCycleLabel(value: string): string {
    const parsedDate = this.toDate((value || '') + '-01');

    if (!parsedDate) {
      return 'Cycle pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  private toDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the payroll request right now.';
  }
}
