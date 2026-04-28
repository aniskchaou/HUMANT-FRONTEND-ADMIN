import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface AdvanceReference {
  id: number;
  name: string;
}

interface AdvanceQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface AdvanceView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  reason: string;
  amount: number;
  date: string;
  dateLabel: string;
  remarks: string;
  summary: string;
  highValue: boolean;
  documented: boolean;
  qualityLabel: AdvanceQuality['label'];
  qualityTone: AdvanceQuality['tone'];
  qualityScore: number;
}

type AdvanceFilter = 'all' | 'high-value' | 'documented' | 'needs-note';
type AdvanceSort = 'latest-date' | 'amount-desc' | 'employee-asc';
type AdvanceEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-advance',
  templateUrl: './advance.component.html',
  styleUrls: ['./advance.component.css'],
})
export class AdvanceComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: AdvanceFilter = 'all';
  activeSort: AdvanceSort = 'latest-date';
  searchTerm = '';

  modalMode: AdvanceEditorMode = 'create';
  activeAdvanceId: number = null;

  advances: AdvanceView[] = [];
  filteredAdvances: AdvanceView[] = [];
  featuredAdvance: AdvanceView = null;

  employees: AdvanceReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly advanceForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.advanceForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(120)]],
      amount: ['', [Validators.required]],
      date: ['', [Validators.required]],
      remarks: ['', [Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    this.loadAdvanceWorkspace();
    super.loadScripts();
  }

  get totalAdvancesCount(): number {
    return this.advances.length;
  }

  get highValueAdvanceCount(): number {
    return this.advances.filter((item) => item.highValue).length;
  }

  get documentedAdvanceCount(): number {
    return this.advances.filter((item) => item.documented).length;
  }

  get averageAdvanceAmount(): number {
    if (!this.advances.length) {
      return 0;
    }

    const total = this.advances.reduce((sum, item) => sum + item.amount, 0);
    return Math.round(total / this.advances.length);
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredAdvances.length);
    const totalCount = this.formatCount(this.advances.length);

    return this.filteredAdvances.length === this.advances.length
      ? filteredCount + ' advance requests'
      : filteredCount + ' of ' + totalCount + ' advance requests';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create salary advance' : 'Edit salary advance';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the employee, amount, and reason for an advance salary request.'
      : 'Adjust the advance amount or note and keep payroll support aligned.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.advanceForm.value.employeeId);
  }

  get draftAmount(): number {
    return this.toAmount(this.advanceForm.value.amount);
  }

  get draftQuality(): AdvanceQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.normalizeText(this.advanceForm.value.reason),
      this.draftAmount,
      this.normalizeText(this.advanceForm.value.date),
      this.normalizeText(this.advanceForm.value.remarks)
    );
  }

  get featuredRecommendation(): string {
    if (!this.featuredAdvance) {
      return 'Select an advance request to inspect the amount, date, and supporting notes.';
    }

    if (!this.featuredAdvance.documented) {
      return 'Add a clearer remark so payroll can understand why this advance was requested.';
    }

    if (this.featuredAdvance.highValue) {
      return 'This higher-value advance should stay visible to payroll until it is reconciled.';
    }

    return 'This advance request is clear enough for normal payroll follow-up.';
  }

  get featuredNextAction(): string {
    if (!this.featuredAdvance) {
      return 'Create an advance request or choose one from the list to review it here.';
    }

    if (!this.featuredAdvance.documented) {
      return 'Next action: add more context on why the employee needs the advance.';
    }

    return 'Next action: keep the amount and remarks aligned with the approved payroll deduction plan.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: AdvanceView): void {
    this.modalMode = 'edit';
    this.activeAdvanceId = item.id;
    this.submitted = false;
    this.featuredAdvance = item;
    this.advanceForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      reason: item.reason,
      amount: item.amount ? String(item.amount) : '',
      date: item.date,
      remarks: item.remarks,
    });
  }

  selectAdvance(item: AdvanceView): void {
    this.featuredAdvance = item;
  }

  openDetailsModal(item: AdvanceView): void {
    this.selectAdvance(item);

    window.requestAnimationFrame(() => {
      this.showModal('advanceDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: AdvanceFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: AdvanceSort): void {
    this.activeSort = value || 'latest-date';
    this.applyFilters();
  }

  refreshAdvances(): void {
    this.loadAdvanceWorkspace(true);
  }

  trackByAdvanceId(index: number, item: AdvanceView): number {
    return item.id || index;
  }

  async saveAdvance(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.advanceForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeAdvanceId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/advanceSalary/update/' + this.activeAdvanceId,
          payload
        );
        super.show('Confirmation', 'Salary advance updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/advanceSalary/create', payload);
        super.show('Confirmation', 'Salary advance created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadAdvanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteAdvance(item: AdvanceView): Promise<void> {
    const confirmed = confirm(
      'Delete the salary advance for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/advanceSalary/delete/' + item.id);
      super.show('Confirmation', 'Salary advance deleted successfully.', 'success');

      if (this.featuredAdvance && this.featuredAdvance.id === item.id) {
        this.featuredAdvance = null;
      }

      this.loadAdvanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadAdvanceWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      advances: this.httpService.getAll(CONFIG.URL_BASE + '/advanceSalary/all'),
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.advances = this.normalizeAdvances(result.advances);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Salary advances refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.advances = [];
          this.filteredAdvances = [];
          this.featuredAdvance = null;
          this.loadError = 'Unable to load salary advances from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeAdvanceId = null;
    this.submitted = false;
    this.saving = false;
    this.advanceForm.reset({
      employeeId: '',
      reason: '',
      amount: '',
      date: '',
      remarks: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredAdvances = this.advances
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.reason.toLowerCase().includes(searchValue) ||
          item.remarks.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'high-value'
            ? item.highValue
            : this.activeFilter === 'documented'
            ? item.documented
            : !item.documented;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'amount-desc') {
          const amountDifference = right.amount - left.amount;
          return amountDifference !== 0 ? amountDifference : left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        return right.date.localeCompare(left.date);
      });

    if (!this.filteredAdvances.length) {
      this.featuredAdvance = null;
      return;
    }

    if (!this.featuredAdvance || !this.filteredAdvances.some((item) => item.id === this.featuredAdvance.id)) {
      this.featuredAdvance = this.filteredAdvances[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): AdvanceReference[] {
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

  private normalizeAdvances(data: unknown): AdvanceView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toAdvanceView(record, index));
  }

  private toAdvanceView(record: any, index: number): AdvanceView {
    const employeeId = this.toNumericId(record && record.employeeName && record.employeeName.id);
    const employeeName =
      this.normalizeText(record && record.employeeName && record.employeeName.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const reason = this.normalizeText(record && record.reason) || 'Reason pending';
    const amount = this.toAmount(record && record.amount);
    const date = this.normalizeText(record && record.date);
    const remarks = this.normalizeText(record && record.remarks);
    const quality = this.evaluateQuality(employeeName, reason, amount, date, remarks);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      reason,
      amount,
      date,
      dateLabel: this.formatDateLabel(date),
      remarks,
      summary: this.buildSummary(employeeName, reason, amount),
      highValue: amount >= 500,
      documented: remarks.length >= 10,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(employeeName: string, reason: string, amount: number): string {
    return (
      employeeName +
      ' requested an advance of ' +
      this.formatMoney(amount) +
      ' for ' +
      reason.toLowerCase() +
      '.'
    );
  }

  private evaluateQuality(
    employeeName: string,
    reason: string,
    amount: number,
    date: string,
    remarks: string
  ): AdvanceQuality {
    if (employeeName.length > 0 && reason.length > 0 && amount > 0 && date.length > 0 && remarks.length >= 10) {
      return {
        label: 'Ready',
        tone: 'strong',
        score: 100,
      };
    }

    if (employeeName.length > 0 && reason.length > 0 && amount > 0 && date.length > 0) {
      return {
        label: 'Needs note',
        tone: 'warning',
        score: 72,
      };
    }

    if (employeeName.length > 0 && amount > 0) {
      return {
        label: 'Draft',
        tone: 'medium',
        score: 44,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 18,
    };
  }

  private buildPayload(): {
    reason: string;
    employeeName: { id: number };
    amount: string;
    date: string;
    remarks: string;
  } | null {
    const employeeId = this.toNumericId(this.advanceForm.value.employeeId);
    const reason = this.normalizeText(this.advanceForm.value.reason);
    const amount = this.toAmount(this.advanceForm.value.amount);
    const date = this.normalizeText(this.advanceForm.value.date);
    const remarks = this.normalizeText(this.advanceForm.value.remarks);

    if (employeeId === null) {
      this.advanceForm.get('employeeId').setErrors({ required: true });
    }

    if (!reason) {
      this.advanceForm.get('reason').setErrors({ required: true });
    }

    if (amount <= 0) {
      this.advanceForm.get('amount').setErrors({ required: true });
    }

    if (!date) {
      this.advanceForm.get('date').setErrors({ required: true });
    }

    if (
      this.advanceForm.invalid ||
      employeeId === null ||
      !reason ||
      amount <= 0 ||
      !date
    ) {
      return null;
    }

    return {
      reason,
      employeeName: { id: employeeId },
      amount: String(amount),
      date,
      remarks,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('advanceCrudModalClose');

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

  private lookupOptionName(options: AdvanceReference[], value: unknown): string {
    const id = this.toNumericId(value);

    if (id === null) {
      return '';
    }

    const match = options.find((item) => item.id === id);
    return match ? match.name : '';
  }

  private formatDateLabel(value: string): string {
    if (!value) {
      return 'Date pending';
    }

    const parsedDate = new Date(value + 'T00:00:00');

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
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

    return 'Unable to complete the salary advance request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
