import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface LaunchPlanReference {
  id: number;
  name: string;
}

interface LaunchPlanQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface LaunchPlanView {
  id: number;
  title: string;
  description: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  status: string;
  statusLabel: string;
  statusTone: LaunchPlanQuality['tone'];
  employeeId: number | null;
  employeeName: string;
  summary: string;
  ownerAssigned: boolean;
  qualityLabel: LaunchPlanQuality['label'];
  qualityTone: LaunchPlanQuality['tone'];
  qualityScore: number;
  timelineLabel: string;
}

type LaunchPlanFilter = 'all' | 'in-progress' | 'completed' | 'on-hold' | 'needs-owner';
type LaunchPlanSort = 'timeline' | 'status' | 'title-asc';
type LaunchPlanEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-launchplan',
  templateUrl: './launchplan.component.html',
  styleUrls: ['./launchplan.component.css'],
})
export class LaunchplanComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: LaunchPlanFilter = 'all';
  activeSort: LaunchPlanSort = 'timeline';
  searchTerm = '';

  modalMode: LaunchPlanEditorMode = 'create';
  activeLaunchPlanId: number = null;

  launchPlans: LaunchPlanView[] = [];
  filteredLaunchPlans: LaunchPlanView[] = [];
  featuredLaunchPlan: LaunchPlanView = null;

  employees: LaunchPlanReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly launchPlanForm: FormGroup;
  readonly statusOptions = [
    { value: 'NOT_STARTED', label: 'Not started' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On hold' },
  ];

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.launchPlanForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(160)]],
      employeeId: [''],
      startDate: [''],
      endDate: [''],
      status: ['NOT_STARTED', [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadLaunchPlanWorkspace();
    super.loadScripts();
  }

  get totalLaunchPlansCount(): number {
    return this.launchPlans.length;
  }

  get inProgressCount(): number {
    return this.launchPlans.filter((item) => item.status === 'IN_PROGRESS').length;
  }

  get completedCount(): number {
    return this.launchPlans.filter((item) => item.status === 'COMPLETED').length;
  }

  get ownerAssignedCount(): number {
    return this.launchPlans.filter((item) => item.ownerAssigned).length;
  }

  get ownershipCoverage(): number {
    return this.toPercent(this.ownerAssignedCount, Math.max(this.totalLaunchPlansCount, 1));
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredLaunchPlans.length);
    const totalCount = this.formatCount(this.launchPlans.length);

    return this.filteredLaunchPlans.length === this.launchPlans.length
      ? filteredCount + ' launch plans'
      : filteredCount + ' of ' + totalCount + ' launch plans';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create launch plan' : 'Edit launch plan';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Set the owner, timing, and delivery status so launch coordination stays visible.'
      : 'Refine the launch plan scope and keep the handoff timeline current.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.launchPlanForm.value.employeeId);
  }

  get draftQuality(): LaunchPlanQuality {
    return this.evaluateQuality(
      this.normalizeText(this.launchPlanForm.value.title),
      this.draftEmployeeName,
      this.normalizeText(this.launchPlanForm.value.startDate),
      this.normalizeText(this.launchPlanForm.value.endDate),
      this.normalizeText(this.launchPlanForm.value.status),
      this.normalizeText(this.launchPlanForm.value.description)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: LaunchPlanView): void {
    this.modalMode = 'edit';
    this.activeLaunchPlanId = item.id;
    this.submitted = false;
    this.featuredLaunchPlan = item;
    this.launchPlanForm.reset({
      title: item.title,
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      description: item.description,
    });
  }

  selectLaunchPlan(item: LaunchPlanView): void {
    this.featuredLaunchPlan = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: LaunchPlanFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: LaunchPlanSort): void {
    this.activeSort = value || 'timeline';
    this.applyFilters();
  }

  refreshLaunchPlans(): void {
    this.loadLaunchPlanWorkspace(true);
  }

  trackByLaunchPlanId(index: number, item: LaunchPlanView): number {
    return item.id || index;
  }

  async saveLaunchPlan(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.launchPlanForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeLaunchPlanId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/launchplan/update/' + this.activeLaunchPlanId,
          payload
        );
        super.show('Confirmation', 'Launch plan updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/launchplan/create', payload);
        super.show('Confirmation', 'Launch plan created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadLaunchPlanWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteLaunchPlan(item: LaunchPlanView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.title + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/launchplan/delete/' + item.id);
      super.show('Confirmation', 'Launch plan deleted successfully.', 'success');

      if (this.featuredLaunchPlan && this.featuredLaunchPlan.id === item.id) {
        this.featuredLaunchPlan = null;
      }

      this.loadLaunchPlanWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadLaunchPlanWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      launchPlans: this.httpService.getAll(CONFIG.URL_BASE + '/launchplan/all'),
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.launchPlans = this.normalizeLaunchPlans(result.launchPlans);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Launch plans refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.launchPlans = [];
          this.filteredLaunchPlans = [];
          this.featuredLaunchPlan = null;
          this.loadError = 'Unable to load launch plans from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeLaunchPlanId = null;
    this.submitted = false;
    this.saving = false;
    this.launchPlanForm.reset({
      title: '',
      employeeId: '',
      startDate: '',
      endDate: '',
      status: 'NOT_STARTED',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredLaunchPlans = this.launchPlans
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.title.toLowerCase().includes(searchValue) ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.statusLabel.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'in-progress'
            ? item.status === 'IN_PROGRESS'
            : this.activeFilter === 'completed'
            ? item.status === 'COMPLETED'
            : this.activeFilter === 'on-hold'
            ? item.status === 'ON_HOLD'
            : !item.ownerAssigned;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'status') {
          return left.statusLabel.localeCompare(right.statusLabel);
        }

        if (this.activeSort === 'title-asc') {
          return left.title.localeCompare(right.title);
        }

        return this.toDateValue(left.startDate) - this.toDateValue(right.startDate);
      });

    if (!this.filteredLaunchPlans.length) {
      this.featuredLaunchPlan = null;
      return;
    }

    if (
      !this.featuredLaunchPlan ||
      !this.filteredLaunchPlans.some((item) => item.id === this.featuredLaunchPlan.id)
    ) {
      this.featuredLaunchPlan = this.filteredLaunchPlans[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): LaunchPlanReference[] {
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

  private normalizeLaunchPlans(data: unknown): LaunchPlanView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.normalizeText(record && record.title).length > 0)
      .map((record, index) => this.toLaunchPlanView(record, index));
  }

  private toLaunchPlanView(record: any, index: number): LaunchPlanView {
    const title = this.normalizeText(record && record.title) || 'Untitled launch plan';
    const description = this.normalizeText(record && record.description);
    const startDate = this.normalizeText(record && record.startDate);
    const endDate = this.normalizeText(record && record.endDate);
    const status = this.normalizeText(record && record.status) || 'NOT_STARTED';
    const employeeName = this.normalizeText(record && record.employee && record.employee.fullName);
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const quality = this.evaluateQuality(
      title,
      employeeName,
      startDate,
      endDate,
      status,
      description
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      title,
      description,
      startDate,
      startDateLabel: this.formatDateLabel(startDate),
      endDate,
      endDateLabel: this.formatDateLabel(endDate),
      status,
      statusLabel: this.formatStatusLabel(status),
      statusTone: this.getStatusTone(status),
      employeeId,
      employeeName,
      summary: description || [employeeName, this.formatStatusLabel(status)].filter(Boolean).join(' • ') || 'Add scope and delivery context for this launch plan.',
      ownerAssigned: employeeName.length > 0,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      timelineLabel: this.buildTimelineLabel(startDate, endDate, status),
    };
  }

  private evaluateQuality(
    title: string,
    employeeName: string,
    startDate: string,
    endDate: string,
    status: string,
    description: string
  ): LaunchPlanQuality {
    const coverage = [title, employeeName, startDate, endDate, status].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 5 && description.length >= 50) {
      return {
        label: 'Ready',
        tone: 'strong',
        score: 100,
      };
    }

    if (coverage >= 4) {
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

  private buildTimelineLabel(startDate: string, endDate: string, status: string): string {
    if (status === 'COMPLETED') {
      return endDate ? 'Completed on ' + this.formatDateLabel(endDate) : 'Marked completed';
    }

    if (status === 'IN_PROGRESS') {
      return endDate ? 'Ends on ' + this.formatDateLabel(endDate) : 'Currently in progress';
    }

    if (status === 'ON_HOLD') {
      return 'On hold until the plan timeline is updated';
    }

    if (startDate) {
      return 'Starts on ' + this.formatDateLabel(startDate);
    }

    return 'Timeline pending';
  }

  private buildPayload(): {
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    status: string;
    employee: { id: number } | null;
  } | null {
    const title = this.normalizeText(this.launchPlanForm.value.title);
    const employeeId = this.toNumericId(this.launchPlanForm.value.employeeId);
    const startDate = this.normalizeText(this.launchPlanForm.value.startDate);
    const endDate = this.normalizeText(this.launchPlanForm.value.endDate);
    const status = this.normalizeText(this.launchPlanForm.value.status) || 'NOT_STARTED';
    const description = this.normalizeText(this.launchPlanForm.value.description);

    this.launchPlanForm.patchValue(
      {
        title,
        employeeId: employeeId !== null ? String(employeeId) : '',
        startDate,
        endDate,
        status,
        description,
      },
      { emitEvent: false }
    );

    if (!title) {
      this.launchPlanForm.get('title').setErrors({ required: true });
    }

    if (!status) {
      this.launchPlanForm.get('status').setErrors({ required: true });
    }

    if (this.launchPlanForm.invalid || !title || !status) {
      return null;
    }

    return {
      title,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      status,
      employee: employeeId !== null ? { id: employeeId } : null,
    };
  }

  private lookupOptionName(options: LaunchPlanReference[], value: unknown): string {
    const targetId = this.toNumericId(value);

    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('launchPlanCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  formatStatusLabel(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private getStatusTone(value: string): LaunchPlanQuality['tone'] {
    if (value === 'COMPLETED') {
      return 'strong';
    }

    if (value === 'IN_PROGRESS') {
      return 'medium';
    }

    if (value === 'ON_HOLD') {
      return 'critical';
    }

    return 'warning';
  }

  normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private toDateValue(value: string): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const normalizedValue = value.length === 10 ? value + 'T00:00:00' : value;
    const timestamp = Date.parse(normalizedValue);
    return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
  }

  private formatDateLabel(value: string): string {
    if (!value) {
      return 'Date not set';
    }

    const normalizedValue = value.length === 10 ? value + 'T00:00:00' : value;
    const parsedDate = new Date(normalizedValue);
    if (isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the launch plan request right now.';
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
