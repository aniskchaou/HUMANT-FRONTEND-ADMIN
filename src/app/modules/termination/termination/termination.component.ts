import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface TerminationReference {
  id: number;
  name: string;
}

interface TerminationQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface TerminationView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  typeTermination: string;
  reason: string;
  noticeDate: string;
  noticeDateLabel: string;
  terminationDate: string;
  terminationDateLabel: string;
  description: string;
  summary: string;
  scheduled: boolean;
  completed: boolean;
  documented: boolean;
  qualityLabel: TerminationQuality['label'];
  qualityTone: TerminationQuality['tone'];
  qualityScore: number;
}

type TerminationFilter = 'all' | 'scheduled' | 'completed' | 'needs-context';
type TerminationSort = 'latest-date' | 'employee-asc' | 'type-asc';
type TerminationEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-termination',
  templateUrl: './termination.component.html',
  styleUrls: ['./termination.component.css'],
})
export class TerminationComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: TerminationFilter = 'all';
  activeSort: TerminationSort = 'latest-date';
  searchTerm = '';

  modalMode: TerminationEditorMode = 'create';
  activeTerminationId: number = null;

  terminations: TerminationView[] = [];
  filteredTerminations: TerminationView[] = [];
  featuredTermination: TerminationView = null;

  employees: TerminationReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly terminationForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.terminationForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      typeTermination: ['', [Validators.required, Validators.maxLength(120)]],
      reason: ['', [Validators.required, Validators.maxLength(200)]],
      noticeDate: ['', [Validators.required]],
      terminationDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loadTerminationWorkspace();
    super.loadScripts();
  }

  get totalTerminationsCount(): number {
    return this.terminations.length;
  }

  get scheduledTerminationsCount(): number {
    return this.terminations.filter((item) => item.scheduled).length;
  }

  get completedTerminationsCount(): number {
    return this.terminations.filter((item) => item.completed).length;
  }

  get documentedTerminationsCount(): number {
    return this.terminations.filter((item) => item.documented).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredTerminations.length);
    const totalCount = this.formatCount(this.terminations.length);

    return this.filteredTerminations.length === this.terminations.length
      ? filteredCount + ' terminations'
      : filteredCount + ' of ' + totalCount + ' terminations';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create termination' : 'Edit termination';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Record the employee, notice window, termination type, and supporting description.'
      : 'Refine the termination timeline and keep supporting context ready for review.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.terminationForm.value.employeeId);
  }

  get draftQuality(): TerminationQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.normalizeText(this.terminationForm.value.typeTermination),
      this.normalizeText(this.terminationForm.value.reason),
      this.normalizeText(this.terminationForm.value.noticeDate),
      this.normalizeText(this.terminationForm.value.terminationDate),
      this.normalizeText(this.terminationForm.value.description)
    );
  }

  get featuredRecommendation(): string {
    if (!this.featuredTermination) {
      return 'Select a termination record to inspect timing, type, and follow-up context.';
    }

    if (!this.featuredTermination.documented) {
      return 'Add more description so the termination record is easier to review and audit later.';
    }

    if (this.featuredTermination.scheduled) {
      return 'This termination is still upcoming, so compliance and access handoff steps should stay active.';
    }

    return 'This termination record looks clear enough for archive and compliance review.';
  }

  get featuredNextAction(): string {
    if (!this.featuredTermination) {
      return 'Create a termination or choose one from the list to review it here.';
    }

    if (this.featuredTermination.scheduled) {
      return 'Next action: confirm notice, system access, and final exit steps before the date arrives.';
    }

    return 'Next action: keep the recorded description aligned with the final employee file.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: TerminationView): void {
    this.modalMode = 'edit';
    this.activeTerminationId = item.id;
    this.submitted = false;
    this.featuredTermination = item;
    this.terminationForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      typeTermination: item.typeTermination,
      reason: item.reason,
      noticeDate: item.noticeDate,
      terminationDate: item.terminationDate,
      description: item.description,
    });
  }

  selectTermination(item: TerminationView): void {
    this.featuredTermination = item;
  }

  openDetailsModal(item: TerminationView): void {
    this.selectTermination(item);

    window.requestAnimationFrame(() => {
      this.showModal('terminationDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: TerminationFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: TerminationSort): void {
    this.activeSort = value || 'latest-date';
    this.applyFilters();
  }

  refreshTerminations(): void {
    this.loadTerminationWorkspace(true);
  }

  trackByTerminationId(index: number, item: TerminationView): number {
    return item.id || index;
  }

  async saveTermination(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.terminationForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeTerminationId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/termination/update/' + this.activeTerminationId,
          payload
        );
        super.show('Confirmation', 'Termination updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/termination/create', payload);
        super.show('Confirmation', 'Termination created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadTerminationWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteTermination(item: TerminationView): Promise<void> {
    const confirmed = confirm(
      'Delete the termination record for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/termination/delete/' + item.id);
      super.show('Confirmation', 'Termination deleted successfully.', 'success');

      if (this.featuredTermination && this.featuredTermination.id === item.id) {
        this.featuredTermination = null;
      }

      this.loadTerminationWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadTerminationWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      terminations: this.httpService.getAll(CONFIG.URL_BASE + '/termination/all'),
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.terminations = this.normalizeTerminations(result.terminations);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Terminations refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.terminations = [];
          this.filteredTerminations = [];
          this.featuredTermination = null;
          this.loadError = 'Unable to load termination records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeTerminationId = null;
    this.submitted = false;
    this.saving = false;
    this.terminationForm.reset({
      employeeId: '',
      typeTermination: '',
      reason: '',
      noticeDate: '',
      terminationDate: '',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredTerminations = this.terminations
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.typeTermination.toLowerCase().includes(searchValue) ||
          item.reason.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'scheduled'
            ? item.scheduled
            : this.activeFilter === 'completed'
            ? item.completed
            : !item.documented;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'type-asc') {
          return left.typeTermination.localeCompare(right.typeTermination);
        }

        return right.terminationDate.localeCompare(left.terminationDate);
      });

    if (!this.filteredTerminations.length) {
      this.featuredTermination = null;
      return;
    }

    if (
      !this.featuredTermination ||
      !this.filteredTerminations.some((item) => item.id === this.featuredTermination.id)
    ) {
      this.featuredTermination = this.filteredTerminations[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): TerminationReference[] {
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

  private normalizeTerminations(data: unknown): TerminationView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toTerminationView(record, index));
  }

  private toTerminationView(record: any, index: number): TerminationView {
    const employeeId = this.toNumericId(record && record.name && record.name.id);
    const employeeName =
      this.normalizeText(record && record.name && record.name.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const typeTermination = this.normalizeText(record && record.typeTermination) || 'Type pending';
    const reason = this.normalizeText(record && record.reason) || 'Reason pending';
    const noticeDate = this.normalizeText(record && record.noticeDate);
    const terminationDate = this.normalizeText(record && record.terminationDate);
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateQuality(
      employeeName,
      typeTermination,
      reason,
      noticeDate,
      terminationDate,
      description
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      typeTermination,
      reason,
      noticeDate,
      noticeDateLabel: this.formatDateLabel(noticeDate),
      terminationDate,
      terminationDateLabel: this.formatDateLabel(terminationDate),
      description,
      summary: this.buildSummary(employeeName, typeTermination, reason),
      scheduled: this.isFutureOrToday(terminationDate),
      completed: this.isPast(terminationDate),
      documented: description.length >= 15,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(
    employeeName: string,
    typeTermination: string,
    reason: string
  ): string {
    return (
      employeeName +
      ' is assigned a ' +
      typeTermination.toLowerCase() +
      ' termination with the recorded reason: ' +
      reason +
      '.'
    );
  }

  private evaluateQuality(
    employeeName: string,
    typeTermination: string,
    reason: string,
    noticeDate: string,
    terminationDate: string,
    description: string
  ): TerminationQuality {
    if (
      employeeName.length > 0 &&
      typeTermination.length > 0 &&
      reason.length > 0 &&
      noticeDate.length > 0 &&
      terminationDate.length > 0 &&
      description.length >= 15
    ) {
      return {
        label: 'Documented',
        tone: 'strong',
        score: 100,
      };
    }

    if (
      employeeName.length > 0 &&
      typeTermination.length > 0 &&
      reason.length > 0 &&
      noticeDate.length > 0 &&
      terminationDate.length > 0
    ) {
      return {
        label: 'Needs context',
        tone: 'warning',
        score: 72,
      };
    }

    if (employeeName.length > 0 && typeTermination.length > 0) {
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
    typeTermination: string;
    reason: string;
    name: { id: number };
    noticeDate: string;
    terminationDate: string;
    description: string;
  } | null {
    const employeeId = this.toNumericId(this.terminationForm.value.employeeId);
    const typeTermination = this.normalizeText(this.terminationForm.value.typeTermination);
    const reason = this.normalizeText(this.terminationForm.value.reason);
    const noticeDate = this.normalizeText(this.terminationForm.value.noticeDate);
    const terminationDate = this.normalizeText(this.terminationForm.value.terminationDate);
    const description = this.normalizeText(this.terminationForm.value.description);

    if (employeeId === null) {
      this.terminationForm.get('employeeId').setErrors({ required: true });
    }

    if (!typeTermination) {
      this.terminationForm.get('typeTermination').setErrors({ required: true });
    }

    if (!reason) {
      this.terminationForm.get('reason').setErrors({ required: true });
    }

    if (!noticeDate) {
      this.terminationForm.get('noticeDate').setErrors({ required: true });
    }

    if (!terminationDate) {
      this.terminationForm.get('terminationDate').setErrors({ required: true });
    }

    if (
      this.terminationForm.invalid ||
      employeeId === null ||
      !typeTermination ||
      !reason ||
      !noticeDate ||
      !terminationDate
    ) {
      return null;
    }

    return {
      typeTermination,
      reason,
      name: { id: employeeId },
      noticeDate,
      terminationDate,
      description,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('terminationCrudModalClose');

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

  private lookupOptionName(options: TerminationReference[], value: unknown): string {
    const id = this.toNumericId(value);

    if (id === null) {
      return '';
    }

    const match = options.find((item) => item.id === id);
    return match ? match.name : '';
  }

  private isFutureOrToday(value: string): boolean {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsedDate.getTime() >= today.getTime();
  }

  private isPast(value: string): boolean {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsedDate.getTime() < today.getTime();
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

  private toDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value + 'T00:00:00');
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the termination request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
