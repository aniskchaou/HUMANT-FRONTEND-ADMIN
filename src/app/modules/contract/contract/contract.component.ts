import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface ContractReference {
  id: number;
  name: string;
}

interface ContractQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface ContractView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  subject: string;
  contractValue: string;
  contractValueLabel: string;
  contractTypeId: number | null;
  contractTypeName: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  description: string;
  status: string;
  job: string;
  departement: string;
  salaryStructureType: string;
  workingSchedule: string;
  summary: string;
  active: boolean;
  expiringSoon: boolean;
  qualityLabel: ContractQuality['label'];
  qualityTone: ContractQuality['tone'];
  qualityScore: number;
  timelineLabel: string;
}

type ContractFilter = 'all' | 'active' | 'expiring' | 'needs-detail';
type ContractSort = 'quality' | 'latest-start' | 'highest-value';
type ContractEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css'],
})
export class ContractComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: ContractFilter = 'all';
  activeSort: ContractSort = 'quality';
  searchTerm = '';

  modalMode: ContractEditorMode = 'create';
  activeContractId: number = null;

  contracts: ContractView[] = [];
  filteredContracts: ContractView[] = [];
  featuredContract: ContractView = null;

  employees: ContractReference[] = [];
  contractTypes: ContractReference[] = [];
  departements: ContractReference[] = [];
  jobs: ContractReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly contractForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.contractForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      subject: ['', [Validators.required, Validators.maxLength(160)]],
      contractValue: ['', [Validators.maxLength(40)]],
      contractTypeId: ['', [Validators.required]],
      startDate: [''],
      endDate: [''],
      description: ['', [Validators.maxLength(1000)]],
      status: ['', [Validators.maxLength(80)]],
      job: ['', [Validators.maxLength(120)]],
      departement: ['', [Validators.maxLength(120)]],
      salaryStructureType: ['', [Validators.maxLength(120)]],
      workingSchedule: ['', [Validators.maxLength(120)]],
    });
  }

  ngOnInit(): void {
    this.loadContractWorkspace();
    super.loadScripts();
  }

  get totalContractsCount(): number {
    return this.contracts.length;
  }

  get activeContractsCount(): number {
    return this.contracts.filter((item) => item.active).length;
  }

  get expiringSoonCount(): number {
    return this.contracts.filter((item) => item.expiringSoon).length;
  }

  get documentedContractsCount(): number {
    return this.contracts.filter((item) => item.description.length > 0).length;
  }

  get documentationCoverage(): number {
    return this.toPercent(
      this.documentedContractsCount,
      Math.max(this.totalContractsCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredContracts.length);
    const totalCount = this.formatCount(this.contracts.length);

    return this.filteredContracts.length === this.contracts.length
      ? filteredCount + ' contracts'
      : filteredCount + ' of ' + totalCount + ' contracts';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create contract' : 'Edit contract';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the employee, agreement type, dates, and working terms in one reliable contract record.'
      : 'Refine the contract details and keep agreement data current across the workspace.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.contractForm.value.employeeId);
  }

  get draftContractTypeName(): string {
    return this.lookupOptionName(
      this.contractTypes,
      this.contractForm.value.contractTypeId
    );
  }

  get draftQuality(): ContractQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.normalizeText(this.contractForm.value.subject),
      this.draftContractTypeName,
      this.normalizeText(this.contractForm.value.startDate),
      this.normalizeText(this.contractForm.value.endDate),
      this.normalizeText(this.contractForm.value.description),
      this.normalizeText(this.contractForm.value.status)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: ContractView): void {
    this.modalMode = 'edit';
    this.activeContractId = item.id;
    this.submitted = false;
    this.featuredContract = item;
    this.contractForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      subject: item.subject,
      contractValue: item.contractValue,
      contractTypeId: item.contractTypeId !== null ? String(item.contractTypeId) : '',
      startDate: item.startDate,
      endDate: item.endDate,
      description: item.description,
      status: item.status,
      job: item.job,
      departement: item.departement,
      salaryStructureType: item.salaryStructureType,
      workingSchedule: item.workingSchedule,
    });
  }

  selectContract(item: ContractView): void {
    this.featuredContract = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: ContractFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: ContractSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshContracts(): void {
    this.loadContractWorkspace(true);
  }

  trackByContractId(index: number, item: ContractView): number {
    return item.id || index;
  }

  async saveContract(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.contractForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeContractId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/contract/update/' + this.activeContractId,
          payload
        );
        super.show('Confirmation', 'Contract updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/contract/create', payload);
        super.show('Confirmation', 'Contract created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadContractWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteContract(item: ContractView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.subject + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/contract/delete/' + item.id);
      super.show('Confirmation', 'Contract deleted successfully.', 'success');

      if (this.featuredContract && this.featuredContract.id === item.id) {
        this.featuredContract = null;
      }

      this.loadContractWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadContractWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      contracts: this.httpService.getAll(CONFIG.URL_BASE + '/contract/all'),
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
      contractTypes: this.httpService
        .getAll(CONFIG.URL_BASE + '/contracttype/all')
        .pipe(catchError(() => of([]))),
      departements: this.httpService
        .getAll(CONFIG.URL_BASE + '/departement/all')
        .pipe(catchError(() => of([]))),
      jobs: this.httpService
        .getAll(CONFIG.URL_BASE + '/job/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.contractTypes = this.normalizeNamedOptions(result.contractTypes);
          this.departements = this.normalizeNamedOptions(result.departements);
          this.jobs = this.normalizeNamedOptions(result.jobs);
          this.contracts = this.normalizeContracts(result.contracts);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Contracts refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.contracts = [];
          this.filteredContracts = [];
          this.featuredContract = null;
          this.loadError = 'Unable to load contract records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeContractId = null;
    this.submitted = false;
    this.saving = false;
    this.contractForm.reset({
      employeeId: '',
      subject: '',
      contractValue: '',
      contractTypeId: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'Active',
      job: '',
      departement: '',
      salaryStructureType: '',
      workingSchedule: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredContracts = this.contracts
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.subject.toLowerCase().includes(searchValue) ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.contractTypeName.toLowerCase().includes(searchValue) ||
          item.status.toLowerCase().includes(searchValue) ||
          item.departement.toLowerCase().includes(searchValue) ||
          item.job.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'active'
            ? item.active
            : this.activeFilter === 'expiring'
            ? item.expiringSoon
            : item.qualityScore < 80;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'latest-start') {
          return this.toDateValue(right.startDate) - this.toDateValue(left.startDate);
        }

        if (this.activeSort === 'highest-value') {
          return this.toMoneyValue(right.contractValue) - this.toMoneyValue(left.contractValue);
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.subject.localeCompare(right.subject);
      });

    if (!this.filteredContracts.length) {
      this.featuredContract = null;
      return;
    }

    if (
      !this.featuredContract ||
      !this.filteredContracts.some((item) => item.id === this.featuredContract.id)
    ) {
      this.featuredContract = this.filteredContracts[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): ContractReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => ({
        id: Number(record && record.id),
        name: this.normalizeText(record && record.fullName),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.length > 0);
  }

  private normalizeNamedOptions(data: unknown): ContractReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => ({
        id: Number(record && record.id),
        name: this.normalizeText(record && record.name),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.length > 0);
  }

  private normalizeContracts(data: unknown): ContractView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.hasContractContent(record))
      .map((record, index) => this.toContractView(record, index));
  }

  private hasContractContent(record: any): boolean {
    return !!(
      this.normalizeText(record && record.subject) ||
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.normalizeText(record && record.contractType && record.contractType.name)
    );
  }

  private toContractView(record: any, index: number): ContractView {
    const employeeName = this.normalizeText(record && record.employee && record.employee.fullName);
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const subject = this.normalizeText(record && record.subject) || 'Untitled contract';
    const contractValue = this.normalizeText(record && record.contractValue);
    const contractTypeName = this.normalizeText(
      record && record.contractType && record.contractType.name
    );
    const contractTypeId = this.toNumericId(
      record && record.contractType && record.contractType.id
    );
    const startDate = this.normalizeText(record && record.startDate);
    const endDate = this.normalizeText(record && record.endDate);
    const description = this.normalizeText(record && record.description);
    const status = this.normalizeText(record && record.status) || 'Draft';
    const job = this.normalizeText(record && record.job);
    const departement = this.normalizeText(record && record.departement);
    const salaryStructureType = this.normalizeText(record && record.salaryStructureType);
    const workingSchedule = this.normalizeText(record && record.workingSchedule);
    const quality = this.evaluateQuality(
      employeeName,
      subject,
      contractTypeName,
      startDate,
      endDate,
      description,
      status
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      subject,
      contractValue,
      contractValueLabel: this.formatMoney(contractValue),
      contractTypeId,
      contractTypeName,
      startDate,
      startDateLabel: this.formatDateLabel(startDate),
      endDate,
      endDateLabel: this.formatDateLabel(endDate),
      description,
      status,
      job,
      departement,
      salaryStructureType,
      workingSchedule,
      summary: this.buildContractSummary(description, employeeName, contractTypeName),
      active: status.toLowerCase() === 'active',
      expiringSoon: this.isExpiringSoon(endDate),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      timelineLabel: this.buildTimelineLabel(endDate),
    };
  }

  private buildContractSummary(
    description: string,
    employeeName: string,
    contractTypeName: string
  ): string {
    if (description) {
      return description.length > 170
        ? description.slice(0, 167).trim() + '...'
        : description;
    }

    return [employeeName, contractTypeName].filter(Boolean).join(' • ') ||
      'Add contract scope, working terms, and agreement context.';
  }

  private evaluateQuality(
    employeeName: string,
    subject: string,
    contractTypeName: string,
    startDate: string,
    endDate: string,
    description: string,
    status: string
  ): ContractQuality {
    const coverage = [
      employeeName,
      subject,
      contractTypeName,
      startDate,
      endDate,
      status,
    ].filter((value) => value.length > 0).length;

    if (coverage >= 6 && description.length >= 50) {
      return {
        label: 'Ready',
        tone: 'strong',
        score: 100,
      };
    }

    if (coverage >= 5) {
      return {
        label: 'Solid',
        tone: 'medium',
        score: 82,
      };
    }

    if (coverage >= 3) {
      return {
        label: 'Needs detail',
        tone: 'warning',
        score: 58,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 16,
    };
  }

  private buildTimelineLabel(endDate: string): string {
    if (!endDate) {
      return 'No end date set';
    }

    const remainingDays = this.daysUntil(endDate);

    if (remainingDays < 0) {
      return 'Expired ' + Math.abs(remainingDays) + ' day' + (Math.abs(remainingDays) === 1 ? '' : 's') + ' ago';
    }

    if (remainingDays <= 90) {
      return 'Ends in ' + remainingDays + ' day' + (remainingDays === 1 ? '' : 's');
    }

    return 'Ends on ' + this.formatDateLabel(endDate);
  }

  private buildPayload(): {
    employee: { id: number };
    subject: string;
    contractValue: string;
    contractType: { id: number };
    startDate: string;
    endDate: string;
    description: string;
    status: string;
    job: string;
    departement: string;
    salaryStructureType: string;
    workingSchedule: string;
  } | null {
    const employeeId = this.toNumericId(this.contractForm.value.employeeId);
    const subject = this.normalizeText(this.contractForm.value.subject);
    const contractValue = this.normalizeText(this.contractForm.value.contractValue);
    const contractTypeId = this.toNumericId(this.contractForm.value.contractTypeId);
    const startDate = this.normalizeText(this.contractForm.value.startDate);
    const endDate = this.normalizeText(this.contractForm.value.endDate);
    const description = this.normalizeText(this.contractForm.value.description);
    const status = this.normalizeText(this.contractForm.value.status);
    const job = this.normalizeText(this.contractForm.value.job);
    const departement = this.normalizeText(this.contractForm.value.departement);
    const salaryStructureType = this.normalizeText(
      this.contractForm.value.salaryStructureType
    );
    const workingSchedule = this.normalizeText(this.contractForm.value.workingSchedule);

    this.contractForm.patchValue(
      {
        employeeId: employeeId !== null ? String(employeeId) : '',
        subject,
        contractValue,
        contractTypeId: contractTypeId !== null ? String(contractTypeId) : '',
        startDate,
        endDate,
        description,
        status,
        job,
        departement,
        salaryStructureType,
        workingSchedule,
      },
      { emitEvent: false }
    );

    if (employeeId === null) {
      this.contractForm.get('employeeId').setErrors({ required: true });
    }

    if (!subject) {
      this.contractForm.get('subject').setErrors({ required: true });
    }

    if (contractTypeId === null) {
      this.contractForm.get('contractTypeId').setErrors({ required: true });
    }

    if (this.contractForm.invalid || employeeId === null || contractTypeId === null) {
      return null;
    }

    return {
      employee: { id: employeeId },
      subject,
      contractValue,
      contractType: { id: contractTypeId },
      startDate,
      endDate,
      description,
      status,
      job,
      departement,
      salaryStructureType,
      workingSchedule,
    };
  }

  private lookupOptionName(options: ContractReference[], value: unknown): string {
    const targetId = this.toNumericId(value);

    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('contractCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private toDateValue(value: string): number {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  private toMoneyValue(value: string): number {
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    const numericValue = Number(cleanedValue);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private formatMoney(value: string): string {
    const numericValue = this.toMoneyValue(value);

    if (!numericValue) {
      return 'Value not set';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numericValue);
  }

  private formatDateLabel(value: string): string {
    if (!value) {
      return 'Date not set';
    }

    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private daysUntil(value: string): number {
    const targetDate = new Date(value);

    if (isNaN(targetDate.getTime())) {
      return 9999;
    }

    const today = new Date();
    const todayAtMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const targetAtMidnight = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const difference = targetAtMidnight.getTime() - todayAtMidnight.getTime();

    return Math.round(difference / 86400000);
  }

  private isExpiringSoon(value: string): boolean {
    const remainingDays = this.daysUntil(value);
    return remainingDays >= 0 && remainingDays <= 90;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the contract request right now.';
  }

  private toPercent(value: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
