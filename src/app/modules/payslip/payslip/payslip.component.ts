import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface PaySlipReference {
  id: number;
  name: string;
}

interface PaySlipQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface PaySlipView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  issueDate: string;
  issueDateLabel: string;
  cycleLabel: string;
  basicSalary: number;
  grossSalary: number;
  bonus: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  expectedNet: number;
  variance: number;
  remarks: string;
  summary: string;
  latest: boolean;
  hasBonus: boolean;
  hasDeductions: boolean;
  hasTaxes: boolean;
  qualityLabel: PaySlipQuality['label'];
  qualityTone: PaySlipQuality['tone'];
  qualityScore: number;
}

type PaySlipFilter = 'all' | 'latest' | 'bonus' | 'deductions';
type PaySlipSort = 'latest-issue' | 'net-desc' | 'employee-asc';
type PaySlipEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.css'],
})
export class PayslipComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: PaySlipFilter = 'all';
  activeSort: PaySlipSort = 'latest-issue';
  searchTerm = '';

  modalMode: PaySlipEditorMode = 'create';
  activePaySlipId: number = null;

  paySlips: PaySlipView[] = [];
  filteredPaySlips: PaySlipView[] = [];
  featuredPaySlip: PaySlipView = null;

  employees: PaySlipReference[] = [];
  currentEmployee: PaySlipReference = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly paySlipForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService
  ) {
    super();
    this.paySlipForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      issueDate: ['', [Validators.required]],
      basicSalary: ['', [Validators.required]],
      grossSalary: [''],
      bonus: [''],
      deductions: [''],
      taxAmount: [''],
      netSalary: [''],
      remarks: ['', [Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    this.loadPaySlipWorkspace();
    super.loadScripts();
  }

  get canManagePaySlips(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR']);
  }

  get isEmployeeWorkspace(): boolean {
    return this.authentificationService.hasRole('EMPLOYEE') && !this.canManagePaySlips;
  }

  get totalPaySlipsCount(): number {
    return this.paySlips.length;
  }

  get latestPaySlipCount(): number {
    return this.paySlips.filter((item) => item.latest).length;
  }

  get bonusPaySlipCount(): number {
    return this.paySlips.filter((item) => item.hasBonus).length;
  }

  get taxedPaySlipCount(): number {
    return this.paySlips.filter((item) => item.hasTaxes).length;
  }

  get averageNetSalary(): number {
    if (!this.paySlips.length) {
      return 0;
    }

    const total = this.paySlips.reduce((sum, item) => sum + item.netSalary, 0);
    return Math.round(total / this.paySlips.length);
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredPaySlips.length);
    const totalCount = this.formatCount(this.paySlips.length);

    return this.filteredPaySlips.length === this.paySlips.length
      ? filteredCount + ' pay slips'
      : filteredCount + ' of ' + totalCount + ' pay slips';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create pay slip' : 'Edit pay slip';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture employee earnings, deductions, and final net pay for the payroll cycle.'
      : 'Adjust the pay slip values and keep the payroll cycle record consistent.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.paySlipForm.value.employeeId);
  }

  get draftBasicSalary(): number {
    return this.toAmount(this.paySlipForm.value.basicSalary);
  }

  get draftGrossSalary(): number {
    const enteredGross = this.toAmount(this.paySlipForm.value.grossSalary);
    return enteredGross > 0 ? enteredGross : this.draftBasicSalary;
  }

  get draftBonus(): number {
    return this.toAmount(this.paySlipForm.value.bonus);
  }

  get draftDeductions(): number {
    return this.toAmount(this.paySlipForm.value.deductions);
  }

  get draftTaxes(): number {
    return this.toAmount(this.paySlipForm.value.taxAmount);
  }

  get draftExpectedNet(): number {
    return Math.max(0, this.draftGrossSalary + this.draftBonus - this.draftDeductions - this.draftTaxes);
  }

  get draftNetSalary(): number {
    const enteredNet = this.toAmount(this.paySlipForm.value.netSalary);
    return enteredNet > 0 ? enteredNet : this.draftExpectedNet;
  }

  get draftQuality(): PaySlipQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.normalizeText(this.paySlipForm.value.issueDate),
      this.draftNetSalary,
      Math.abs(this.draftNetSalary - this.draftExpectedNet)
    );
  }

  get featuredRecommendation(): string {
    if (!this.featuredPaySlip) {
      return 'Select a pay slip to inspect employee payout, adjustments, and payroll cycle quality.';
    }

    if (this.featuredPaySlip.variance > 1) {
      return 'Reconcile the net salary against earnings and deductions before this payroll cycle is finalized.';
    }

    if (!this.featuredPaySlip.remarks) {
      return 'Add a short note when bonuses or deductions need audit context for future payroll reviews.';
    }

    return 'This pay slip looks aligned and includes enough context for payroll review.';
  }

  get featuredNextAction(): string {
    if (!this.featuredPaySlip) {
      return 'Create a pay slip or choose one from the list to review it here.';
    }

    if (this.featuredPaySlip.variance > 1) {
      return 'Next action: verify component totals and adjust net pay if necessary.';
    }

    return 'Next action: keep this cycle documented with any bonus or deduction rationale.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: PaySlipView): void {
    this.modalMode = 'edit';
    this.activePaySlipId = item.id;
    this.submitted = false;
    this.featuredPaySlip = item;
    this.paySlipForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      issueDate: item.issueDate,
      basicSalary: item.basicSalary ? String(item.basicSalary) : '',
      grossSalary: item.grossSalary ? String(item.grossSalary) : '',
      bonus: item.bonus ? String(item.bonus) : '0',
      deductions: item.deductions ? String(item.deductions) : '0',
      taxAmount: item.taxes ? String(item.taxes) : '0',
      netSalary: item.netSalary ? String(item.netSalary) : '',
      remarks: item.remarks,
    });
  }

  selectPaySlip(item: PaySlipView): void {
    this.featuredPaySlip = item;
  }

  openDetailsModal(item: PaySlipView): void {
    this.selectPaySlip(item);

    window.requestAnimationFrame(() => {
      this.showModal('paySlipDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: PaySlipFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: PaySlipSort): void {
    this.activeSort = value || 'latest-issue';
    this.applyFilters();
  }

  refreshPaySlips(): void {
    this.loadPaySlipWorkspace(true);
  }

  trackByPaySlipId(index: number, item: PaySlipView): number {
    return item.id || index;
  }

  async savePaySlip(): Promise<void> {
    if (!this.canManagePaySlips) {
      return;
    }

    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.paySlipForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activePaySlipId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/pay-slips/' + this.activePaySlipId,
          payload
        );
        super.show('Confirmation', 'Pay slip updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/pay-slips', payload);
        super.show('Confirmation', 'Pay slip created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadPaySlipWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deletePaySlip(item: PaySlipView): Promise<void> {
    if (!this.canManagePaySlips) {
      return;
    }

    const confirmed = confirm(
      'Delete the pay slip for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/pay-slips/' + item.id);
      super.show('Confirmation', 'Pay slip deleted successfully.', 'success');

      if (this.featuredPaySlip && this.featuredPaySlip.id === item.id) {
        this.featuredPaySlip = null;
      }

      this.loadPaySlipWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadPaySlipWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      paySlips: this.httpService.getAll(CONFIG.URL_BASE + '/api/pay-slips'),
      employees: this.canManagePaySlips
        ? this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([])))
        : of([]),
      currentEmployee: this.isEmployeeWorkspace
        ? this.httpService.get(CONFIG.URL_BASE + '/employee/me').pipe(catchError(() => of(null)))
        : of(null),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.currentEmployee = this.normalizeEmployeeOption(result.currentEmployee);
          this.employees = this.canManagePaySlips
            ? this.normalizeEmployeeOptions(result.employees)
            : this.currentEmployee
            ? [this.currentEmployee]
            : [];
          this.paySlips = this.normalizePaySlips(result.paySlips);

          if (this.isEmployeeWorkspace && !this.currentEmployee) {
            this.loadError = 'Your employee profile could not be resolved for pay slip access.';
          }

          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Pay slips refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.paySlips = [];
          this.filteredPaySlips = [];
          this.featuredPaySlip = null;
          this.loadError = 'Unable to load pay slips from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activePaySlipId = null;
    this.submitted = false;
    this.saving = false;
    this.paySlipForm.reset({
      employeeId: '',
      issueDate: '',
      basicSalary: '',
      grossSalary: '',
      bonus: '0',
      deductions: '0',
      taxAmount: '0',
      netSalary: '',
      remarks: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredPaySlips = this.paySlips
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.cycleLabel.toLowerCase().includes(searchValue) ||
          item.remarks.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'latest'
            ? item.latest
            : this.activeFilter === 'bonus'
            ? item.hasBonus
            : item.hasDeductions;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'net-desc') {
          const netDifference = right.netSalary - left.netSalary;
          return netDifference !== 0 ? netDifference : left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        return right.issueDate.localeCompare(left.issueDate);
      });

    if (!this.filteredPaySlips.length) {
      this.featuredPaySlip = null;
      return;
    }

    if (
      !this.featuredPaySlip ||
      !this.filteredPaySlips.some((item) => item.id === this.featuredPaySlip.id)
    ) {
      this.featuredPaySlip = this.filteredPaySlips[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): PaySlipReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => ({
        id: Number(record && record.id),
        name:
          this.normalizeText(record && record.fullName) ||
          [
            this.normalizeText(record && record.firstName),
            this.normalizeText(record && record.lastName),
          ]
            .filter((value) => value.length > 0)
            .join(' '),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.length > 0);
  }

  private normalizeEmployeeOption(record: unknown): PaySlipReference | null {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const id = Number((record as any).id);
    const name =
      this.normalizeText((record as any).fullName) ||
      [
        this.normalizeText((record as any).firstName),
        this.normalizeText((record as any).lastName),
      ]
        .filter((value) => value.length > 0)
        .join(' ');

    return Number.isFinite(id) && name.length > 0 ? { id, name } : null;
  }

  private normalizePaySlips(data: unknown): PaySlipView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toPaySlipView(record, index));
  }

  private toPaySlipView(record: any, index: number): PaySlipView {
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const issueDate = this.normalizeText(record && record.issueDate);
    const basicSalary = this.toAmount(record && record.basicSalary);
    const grossSalary = this.toAmount(record && record.grossSalary) || basicSalary;
    const bonus = this.toAmount(record && record.bonus);
    const deductions = this.toAmount(record && record.deductions);
    const taxes = this.toAmount(record && record.taxAmount);
    const netSalary = this.toAmount(record && record.netSalary);
    const expectedNet = Math.max(0, grossSalary + bonus - deductions - taxes);
    const variance = Math.abs(netSalary - expectedNet);
    const remarks = this.normalizeText(record && record.remarks);
    const quality = this.evaluateQuality(employeeName, issueDate, netSalary, variance);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      issueDate,
      issueDateLabel: this.formatDateLabel(issueDate),
      cycleLabel: this.formatCycleLabel(this.normalizeText(record && record.cycleMonth) || issueDate),
      basicSalary,
      grossSalary,
      bonus,
      deductions,
      taxes,
      netSalary,
      expectedNet,
      variance,
      remarks,
      summary: this.buildSummary(employeeName, issueDate, netSalary, bonus, deductions, taxes),
      latest: this.isLatest(issueDate),
      hasBonus: bonus > 0,
      hasDeductions: deductions > 0,
      hasTaxes: taxes > 0,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(
    employeeName: string,
    issueDate: string,
    netSalary: number,
    bonus: number,
    deductions: number,
    taxes: number
  ): string {
    return (
      employeeName +
      ' closes the ' +
      this.formatCycleLabel(issueDate) +
      ' cycle with a net payout of ' +
      this.formatMoney(netSalary) +
      ', including ' +
      this.formatMoney(bonus) +
      ' in bonus adjustments and ' +
      this.formatMoney(deductions) +
      ' in deductions plus ' +
      this.formatMoney(taxes) +
      ' in taxes.'
    );
  }

  private evaluateQuality(
    employeeName: string,
    issueDate: string,
    netSalary: number,
    variance: number
  ): PaySlipQuality {
    if (employeeName.length > 0 && issueDate.length > 0 && netSalary > 0 && variance <= 1) {
      return {
        label: 'Balanced',
        tone: 'strong',
        score: 100,
      };
    }

    if (employeeName.length > 0 && issueDate.length > 0 && netSalary > 0) {
      return {
        label: 'Check totals',
        tone: 'warning',
        score: 68,
      };
    }

    if (employeeName.length > 0 && issueDate.length > 0) {
      return {
        label: 'Draft',
        tone: 'medium',
        score: 46,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 18,
    };
  }

  private buildPayload(): {
    issueDate: string;
    basicSalary: number;
    allowanceTotal: number;
    grossSalary: number;
    bonus: number;
    deductions: number;
    taxAmount: number;
    netSalary: number;
    cycleMonth: string;
    salaryStructureName: string;
    employee: { id: number };
    remarks: string;
  } | null {
    const employeeId = this.toNumericId(this.paySlipForm.value.employeeId);
    const issueDate = this.normalizeText(this.paySlipForm.value.issueDate);
    const basicSalary = this.toAmount(this.paySlipForm.value.basicSalary);
    const enteredGross = this.toAmount(this.paySlipForm.value.grossSalary);
    const grossSalary = enteredGross > 0 ? enteredGross : basicSalary;
    const bonus = this.toAmount(this.paySlipForm.value.bonus);
    const deductions = this.toAmount(this.paySlipForm.value.deductions);
    const taxAmount = this.toAmount(this.paySlipForm.value.taxAmount);
    const enteredNet = this.toAmount(this.paySlipForm.value.netSalary);
    const netSalary = enteredNet > 0 ? enteredNet : Math.max(0, grossSalary + bonus - deductions - taxAmount);
    const remarks = this.normalizeText(this.paySlipForm.value.remarks);

    if (employeeId === null) {
      this.paySlipForm.get('employeeId').setErrors({ required: true });
    }

    if (!issueDate) {
      this.paySlipForm.get('issueDate').setErrors({ required: true });
    }

    if (basicSalary <= 0) {
      this.paySlipForm.get('basicSalary').setErrors({ required: true });
    }

    if (this.paySlipForm.invalid || employeeId === null || !issueDate || basicSalary <= 0) {
      return null;
    }

    return {
      issueDate,
      basicSalary,
      allowanceTotal: Math.max(0, grossSalary - basicSalary),
      grossSalary,
      bonus,
      deductions,
      taxAmount,
      netSalary,
      cycleMonth: issueDate.slice(0, 7),
      salaryStructureName: '',
      employee: { id: employeeId },
      remarks,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('paySlipCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private showModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    const bootstrapNamespace = (window as Window & {
      bootstrap?: {
        Modal?: {
          getInstance(element: Element): { show(): void } | null;
          new (element: Element): { show(): void };
        };
      };
    }).bootstrap;

    if (!modalElement || !bootstrapNamespace || !bootstrapNamespace.Modal) {
      return;
    }

    const existingInstance = bootstrapNamespace.Modal.getInstance(modalElement);
    const modalInstance = existingInstance || new bootstrapNamespace.Modal(modalElement);

    modalInstance.show();
  }

  private lookupOptionName(options: PaySlipReference[], value: unknown): string {
    const id = this.toNumericId(value);

    if (id === null) {
      return '';
    }

    const match = options.find((item) => item.id === id);
    return match ? match.name : '';
  }

  private isLatest(issueDate: string): boolean {
    const parsedDate = this.toDate(issueDate);

    if (!parsedDate) {
      return false;
    }

    const daysDifference = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDifference >= 0 && daysDifference <= 45;
  }

  private formatCycleLabel(issueDate: string): string {
    const parsedDate = this.toDate(issueDate);

    if (!parsedDate) {
      return 'Cycle pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatDateLabel(issueDate: string): string {
    const parsedDate = this.toDate(issueDate);

    if (!parsedDate) {
      return 'Date pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private toDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value + 'T00:00:00');
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toAmount(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? Math.round(numericValue) : 0;
  }

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the pay slip request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
