import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface LoanReference {
  id: number;
  name: string;
}

interface LoanQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface LoanView {
  id: number;
  loanName: string;
  receiveType: string;
  employeeId: number | null;
  employeeName: string;
  interestPercentage: number;
  loanAmount: number;
  estimatedInterest: number;
  applyDate: string;
  applyDateLabel: string;
  remarks: string;
  summary: string;
  banked: boolean;
  highValue: boolean;
  documented: boolean;
  qualityLabel: LoanQuality['label'];
  qualityTone: LoanQuality['tone'];
  qualityScore: number;
}

type LoanFilter = 'all' | 'bank' | 'high-value' | 'needs-note';
type LoanSort = 'latest-apply' | 'amount-desc' | 'employee-asc';
type LoanEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-loan',
  templateUrl: './loan.component.html',
  styleUrls: ['./loan.component.css'],
})
export class LoanComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: LoanFilter = 'all';
  activeSort: LoanSort = 'latest-apply';
  searchTerm = '';

  modalMode: LoanEditorMode = 'create';
  activeLoanId: number = null;

  loans: LoanView[] = [];
  filteredLoans: LoanView[] = [];
  featuredLoan: LoanView = null;

  employees: LoanReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly loanForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.loanForm = this.formBuilder.group({
      loanName: ['', [Validators.required, Validators.maxLength(120)]],
      receiveType: ['', [Validators.required, Validators.maxLength(80)]],
      employeeId: ['', [Validators.required]],
      interestPercentage: [''],
      loanAmount: ['', [Validators.required]],
      applyDate: ['', [Validators.required]],
      remarks: ['', [Validators.maxLength(400)]],
    });
  }

  ngOnInit(): void {
    this.loadLoanWorkspace();
    super.loadScripts();
  }

  get totalLoansCount(): number {
    return this.loans.length;
  }

  get bankLoanCount(): number {
    return this.loans.filter((item) => item.banked).length;
  }

  get highValueLoanCount(): number {
    return this.loans.filter((item) => item.highValue).length;
  }

  get documentedLoanCount(): number {
    return this.loans.filter((item) => item.documented).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredLoans.length);
    const totalCount = this.formatCount(this.loans.length);

    return this.filteredLoans.length === this.loans.length
      ? filteredCount + ' loans'
      : filteredCount + ' of ' + totalCount + ' loans';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create loan record' : 'Edit loan record';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the financing channel, amount, employee, and repayment context in one place.'
      : 'Refine the loan record and keep lending details current for HR and finance.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.loanForm.value.employeeId);
  }

  get draftLoanAmount(): number {
    return this.toAmount(this.loanForm.value.loanAmount);
  }

  get draftInterestPercentage(): number {
    return this.toAmount(this.loanForm.value.interestPercentage);
  }

  get draftInterestExposure(): number {
    return Math.round((this.draftLoanAmount * this.draftInterestPercentage) / 100);
  }

  get draftQuality(): LoanQuality {
    return this.evaluateQuality(
      this.normalizeText(this.loanForm.value.loanName),
      this.draftEmployeeName,
      this.normalizeText(this.loanForm.value.receiveType),
      this.draftLoanAmount,
      this.normalizeText(this.loanForm.value.applyDate),
      this.normalizeText(this.loanForm.value.remarks)
    );
  }

  get featuredRecommendation(): string {
    if (!this.featuredLoan) {
      return 'Select a loan record to inspect financing method, amount, and supporting notes.';
    }

    if (!this.featuredLoan.documented) {
      return 'Add repayment context or loan purpose so finance and HR can review this request consistently.';
    }

    if (this.featuredLoan.highValue) {
      return 'This is a higher-value loan, so keep the amount and interest terms under tighter review.';
    }

    return 'This loan record is documented clearly enough for routine follow-up and repayment tracking.';
  }

  get featuredNextAction(): string {
    if (!this.featuredLoan) {
      return 'Create a loan or choose one from the list to review it here.';
    }

    if (!this.featuredLoan.documented) {
      return 'Next action: add a clear note on purpose, approval, or repayment expectations.';
    }

    return 'Next action: keep the interest terms and remarks aligned with the final agreement.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: LoanView): void {
    this.modalMode = 'edit';
    this.activeLoanId = item.id;
    this.submitted = false;
    this.featuredLoan = item;
    this.loanForm.reset({
      loanName: item.loanName,
      receiveType: item.receiveType,
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      interestPercentage: item.interestPercentage ? String(item.interestPercentage) : '0',
      loanAmount: item.loanAmount ? String(item.loanAmount) : '',
      applyDate: item.applyDate,
      remarks: item.remarks,
    });
  }

  selectLoan(item: LoanView): void {
    this.featuredLoan = item;
  }

  openDetailsModal(item: LoanView): void {
    this.selectLoan(item);

    window.requestAnimationFrame(() => {
      this.showModal('loanDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: LoanFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: LoanSort): void {
    this.activeSort = value || 'latest-apply';
    this.applyFilters();
  }

  refreshLoans(): void {
    this.loadLoanWorkspace(true);
  }

  trackByLoanId(index: number, item: LoanView): number {
    return item.id || index;
  }

  async saveLoan(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.loanForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeLoanId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/loan/update/' + this.activeLoanId,
          payload
        );
        super.show('Confirmation', 'Loan updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/loan/create', payload);
        super.show('Confirmation', 'Loan created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadLoanWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteLoan(item: LoanView): Promise<void> {
    const confirmed = confirm(
      'Delete the loan "' + item.loanName + '" for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/loan/delete/' + item.id);
      super.show('Confirmation', 'Loan deleted successfully.', 'success');

      if (this.featuredLoan && this.featuredLoan.id === item.id) {
        this.featuredLoan = null;
      }

      this.loadLoanWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadLoanWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      loans: this.httpService.getAll(CONFIG.URL_BASE + '/loan/all'),
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.loans = this.normalizeLoans(result.loans);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Loans refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.loans = [];
          this.filteredLoans = [];
          this.featuredLoan = null;
          this.loadError = 'Unable to load loan records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeLoanId = null;
    this.submitted = false;
    this.saving = false;
    this.loanForm.reset({
      loanName: '',
      receiveType: '',
      employeeId: '',
      interestPercentage: '0',
      loanAmount: '',
      applyDate: '',
      remarks: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredLoans = this.loans
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.loanName.toLowerCase().includes(searchValue) ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.receiveType.toLowerCase().includes(searchValue) ||
          item.remarks.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'bank'
            ? item.banked
            : this.activeFilter === 'high-value'
            ? item.highValue
            : !item.documented;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'amount-desc') {
          const amountDifference = right.loanAmount - left.loanAmount;
          return amountDifference !== 0 ? amountDifference : left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        return right.applyDate.localeCompare(left.applyDate);
      });

    if (!this.filteredLoans.length) {
      this.featuredLoan = null;
      return;
    }

    if (!this.featuredLoan || !this.filteredLoans.some((item) => item.id === this.featuredLoan.id)) {
      this.featuredLoan = this.filteredLoans[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): LoanReference[] {
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

  private normalizeLoans(data: unknown): LoanView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toLoanView(record, index));
  }

  private toLoanView(record: any, index: number): LoanView {
    const loanName = this.normalizeText(record && record.loanName) || 'Untitled loan';
    const receiveType = this.normalizeText(record && record.receiveType) || 'Channel pending';
    const employeeId = this.toNumericId(record && record.name && record.name.id);
    const employeeName =
      this.normalizeText(record && record.name && record.name.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const interestPercentage = this.toAmount(record && record.interestPercentage);
    const loanAmount = this.toAmount(record && record.loanAmount);
    const applyDate = this.normalizeText(record && record.applyDate);
    const remarks = this.normalizeText(record && record.remarks);
    const quality = this.evaluateQuality(
      loanName,
      employeeName,
      receiveType,
      loanAmount,
      applyDate,
      remarks
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      loanName,
      receiveType,
      employeeId,
      employeeName,
      interestPercentage,
      loanAmount,
      estimatedInterest: Math.round((loanAmount * interestPercentage) / 100),
      applyDate,
      applyDateLabel: this.formatDateLabel(applyDate),
      remarks,
      summary: this.buildSummary(employeeName, loanName, receiveType, loanAmount),
      banked: receiveType.toLowerCase().includes('bank'),
      highValue: loanAmount >= 10000,
      documented: remarks.length >= 10,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(
    employeeName: string,
    loanName: string,
    receiveType: string,
    loanAmount: number
  ): string {
    return (
      employeeName +
      ' is currently assigned the ' +
      loanName +
      ' record through ' +
      receiveType +
      ' for ' +
      this.formatMoney(loanAmount) +
      '.'
    );
  }

  private evaluateQuality(
    loanName: string,
    employeeName: string,
    receiveType: string,
    loanAmount: number,
    applyDate: string,
    remarks: string
  ): LoanQuality {
    if (
      loanName.length > 0 &&
      employeeName.length > 0 &&
      receiveType.length > 0 &&
      loanAmount > 0 &&
      applyDate.length > 0 &&
      remarks.length >= 10
    ) {
      return {
        label: 'Ready',
        tone: 'strong',
        score: 100,
      };
    }

    if (
      loanName.length > 0 &&
      employeeName.length > 0 &&
      receiveType.length > 0 &&
      loanAmount > 0 &&
      applyDate.length > 0
    ) {
      return {
        label: 'Needs note',
        tone: 'warning',
        score: 70,
      };
    }

    if (loanName.length > 0 && employeeName.length > 0) {
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
    loanName: string;
    receiveType: string;
    name: { id: number };
    interestPercentage: string;
    loanAmount: string;
    applyDate: string;
    remarks: string;
  } | null {
    const loanName = this.normalizeText(this.loanForm.value.loanName);
    const receiveType = this.normalizeText(this.loanForm.value.receiveType);
    const employeeId = this.toNumericId(this.loanForm.value.employeeId);
    const interestPercentage = this.toAmount(this.loanForm.value.interestPercentage);
    const loanAmount = this.toAmount(this.loanForm.value.loanAmount);
    const applyDate = this.normalizeText(this.loanForm.value.applyDate);
    const remarks = this.normalizeText(this.loanForm.value.remarks);

    if (!loanName) {
      this.loanForm.get('loanName').setErrors({ required: true });
    }

    if (!receiveType) {
      this.loanForm.get('receiveType').setErrors({ required: true });
    }

    if (employeeId === null) {
      this.loanForm.get('employeeId').setErrors({ required: true });
    }

    if (loanAmount <= 0) {
      this.loanForm.get('loanAmount').setErrors({ required: true });
    }

    if (!applyDate) {
      this.loanForm.get('applyDate').setErrors({ required: true });
    }

    if (
      this.loanForm.invalid ||
      !loanName ||
      !receiveType ||
      employeeId === null ||
      loanAmount <= 0 ||
      !applyDate
    ) {
      return null;
    }

    return {
      loanName,
      receiveType,
      name: { id: employeeId },
      interestPercentage: String(interestPercentage),
      loanAmount: String(loanAmount),
      applyDate,
      remarks,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('loanCrudModalClose');

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

  private lookupOptionName(options: LoanReference[], value: unknown): string {
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

    return 'Unable to complete the loan request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
