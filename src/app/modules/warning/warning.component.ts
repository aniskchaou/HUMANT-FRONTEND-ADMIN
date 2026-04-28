import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface WarningReference {
  id: number;
  name: string;
}

interface WarningQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface WarningView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  warningTitle: string;
  warningDate: string;
  warningDateLabel: string;
  description: string;
  summary: string;
  recent: boolean;
  documented: boolean;
  severe: boolean;
  qualityLabel: WarningQuality['label'];
  qualityTone: WarningQuality['tone'];
  qualityScore: number;
}

type WarningFilter = 'all' | 'recent' | 'severe' | 'needs-note';
type WarningSort = 'latest-date' | 'employee-asc' | 'title-asc';
type WarningEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.css'],
})
export class WarningComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: WarningFilter = 'all';
  activeSort: WarningSort = 'latest-date';
  searchTerm = '';

  modalMode: WarningEditorMode = 'create';
  activeWarningId: number = null;

  warnings: WarningView[] = [];
  filteredWarnings: WarningView[] = [];
  featuredWarning: WarningView = null;

  employees: WarningReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly warningForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.warningForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      warningTitle: ['', [Validators.required, Validators.maxLength(120)]],
      warningDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loadWarningWorkspace();
    super.loadScripts();
  }

  get totalWarningsCount(): number {
    return this.warnings.length;
  }

  get recentWarningsCount(): number {
    return this.warnings.filter((item) => item.recent).length;
  }

  get severeWarningsCount(): number {
    return this.warnings.filter((item) => item.severe).length;
  }

  get documentedWarningsCount(): number {
    return this.warnings.filter((item) => item.documented).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredWarnings.length);
    const totalCount = this.formatCount(this.warnings.length);

    return this.filteredWarnings.length === this.warnings.length
      ? filteredCount + ' warnings'
      : filteredCount + ' of ' + totalCount + ' warnings';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create warning' : 'Edit warning';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the employee, warning title, and supporting note for the record.'
      : 'Refine the warning entry and keep the disciplinary context clear.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.warningForm.value.employeeId);
  }

  get draftQuality(): WarningQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.normalizeText(this.warningForm.value.warningTitle),
      this.normalizeText(this.warningForm.value.warningDate),
      this.normalizeText(this.warningForm.value.description)
    );
  }

  get featuredRecommendation(): string {
    if (!this.featuredWarning) {
      return 'Select a warning record to inspect employee context, severity, and follow-up notes.';
    }

    if (!this.featuredWarning.documented) {
      return 'Add more description so the warning record is easier to defend and review later.';
    }

    if (this.featuredWarning.severe) {
      return 'This warning looks more serious, so keep manager follow-up and record clarity tight.';
    }

    return 'This warning record is documented clearly enough for routine HR follow-up.';
  }

  get featuredNextAction(): string {
    if (!this.featuredWarning) {
      return 'Create a warning or choose one from the list to review it here.';
    }

    if (!this.featuredWarning.documented) {
      return 'Next action: add the supporting narrative and any action already taken.';
    }

    return 'Next action: keep any further disciplinary follow-up aligned with this record.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: WarningView): void {
    this.modalMode = 'edit';
    this.activeWarningId = item.id;
    this.submitted = false;
    this.featuredWarning = item;
    this.warningForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      warningTitle: item.warningTitle,
      warningDate: item.warningDate,
      description: item.description,
    });
  }

  selectWarning(item: WarningView): void {
    this.featuredWarning = item;
  }

  openDetailsModal(item: WarningView): void {
    this.selectWarning(item);

    window.requestAnimationFrame(() => {
      this.showModal('warningDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: WarningFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: WarningSort): void {
    this.activeSort = value || 'latest-date';
    this.applyFilters();
  }

  refreshWarnings(): void {
    this.loadWarningWorkspace(true);
  }

  trackByWarningId(index: number, item: WarningView): number {
    return item.id || index;
  }

  async saveWarning(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.warningForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeWarningId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/warning/update/' + this.activeWarningId,
          payload
        );
        super.show('Confirmation', 'Warning updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/warning/create', payload);
        super.show('Confirmation', 'Warning created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadWarningWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteWarning(item: WarningView): Promise<void> {
    const confirmed = confirm(
      'Delete the warning for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/warning/delete/' + item.id);
      super.show('Confirmation', 'Warning deleted successfully.', 'success');

      if (this.featuredWarning && this.featuredWarning.id === item.id) {
        this.featuredWarning = null;
      }

      this.loadWarningWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadWarningWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      warnings: this.httpService.getAll(CONFIG.URL_BASE + '/warning/all'),
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.warnings = this.normalizeWarnings(result.warnings);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Warnings refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.warnings = [];
          this.filteredWarnings = [];
          this.featuredWarning = null;
          this.loadError = 'Unable to load warning records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeWarningId = null;
    this.submitted = false;
    this.saving = false;
    this.warningForm.reset({
      employeeId: '',
      warningTitle: '',
      warningDate: '',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredWarnings = this.warnings
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.warningTitle.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'recent'
            ? item.recent
            : this.activeFilter === 'severe'
            ? item.severe
            : !item.documented;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'title-asc') {
          return left.warningTitle.localeCompare(right.warningTitle);
        }

        return right.warningDate.localeCompare(left.warningDate);
      });

    if (!this.filteredWarnings.length) {
      this.featuredWarning = null;
      return;
    }

    if (!this.featuredWarning || !this.filteredWarnings.some((item) => item.id === this.featuredWarning.id)) {
      this.featuredWarning = this.filteredWarnings[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): WarningReference[] {
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

  private normalizeWarnings(data: unknown): WarningView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toWarningView(record, index));
  }

  private toWarningView(record: any, index: number): WarningView {
    const employeeId = this.toNumericId(record && record.against && record.against.id);
    const employeeName =
      this.normalizeText(record && record.against && record.against.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const warningTitle = this.normalizeText(record && record.warningTitle) || 'Untitled warning';
    const warningDate = this.normalizeText(record && record.warningDate);
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateQuality(employeeName, warningTitle, warningDate, description);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      warningTitle,
      warningDate,
      warningDateLabel: this.formatDateLabel(warningDate),
      description,
      summary: this.buildSummary(employeeName, warningTitle),
      recent: this.isRecent(warningDate, 30),
      documented: description.length >= 15,
      severe: /(final|conduct|safety|gross|serious)/i.test(warningTitle + ' ' + description),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(employeeName: string, warningTitle: string): string {
    return employeeName + ' is currently linked to the warning record titled "' + warningTitle + '".';
  }

  private evaluateQuality(
    employeeName: string,
    warningTitle: string,
    warningDate: string,
    description: string
  ): WarningQuality {
    if (employeeName.length > 0 && warningTitle.length > 0 && warningDate.length > 0 && description.length >= 15) {
      return {
        label: 'Documented',
        tone: 'strong',
        score: 100,
      };
    }

    if (employeeName.length > 0 && warningTitle.length > 0 && warningDate.length > 0) {
      return {
        label: 'Needs note',
        tone: 'warning',
        score: 72,
      };
    }

    if (employeeName.length > 0 && warningTitle.length > 0) {
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
    against: { id: number };
    warningTitle: string;
    warningDate: string;
    description: string;
  } | null {
    const employeeId = this.toNumericId(this.warningForm.value.employeeId);
    const warningTitle = this.normalizeText(this.warningForm.value.warningTitle);
    const warningDate = this.normalizeText(this.warningForm.value.warningDate);
    const description = this.normalizeText(this.warningForm.value.description);

    if (employeeId === null) {
      this.warningForm.get('employeeId').setErrors({ required: true });
    }

    if (!warningTitle) {
      this.warningForm.get('warningTitle').setErrors({ required: true });
    }

    if (!warningDate) {
      this.warningForm.get('warningDate').setErrors({ required: true });
    }

    if (this.warningForm.invalid || employeeId === null || !warningTitle || !warningDate) {
      return null;
    }

    return {
      against: { id: employeeId },
      warningTitle,
      warningDate,
      description,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('warningCrudModalClose');

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

  private lookupOptionName(options: WarningReference[], value: unknown): string {
    const id = this.toNumericId(value);

    if (id === null) {
      return '';
    }

    const match = options.find((item) => item.id === id);
    return match ? match.name : '';
  }

  private isRecent(value: string, days: number): boolean {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return false;
    }

    const difference = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    return difference >= 0 && difference <= days;
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

    return 'Unable to complete the warning request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
