import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface AwardReference {
  id: number;
  name: string;
}

interface AwardQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface AwardView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  awardTypeId: number | null;
  awardTypeName: string;
  awardDate: string;
  awardDateLabel: string;
  description: string;
  summary: string;
  recent: boolean;
  documented: boolean;
  qualityLabel: AwardQuality['label'];
  qualityTone: AwardQuality['tone'];
  qualityScore: number;
  timelineLabel: string;
}

type AwardFilter = 'all' | 'recent' | 'needs-note' | 'archive';
type AwardSort = 'recent' | 'employee-asc' | 'quality';
type AwardEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-award',
  templateUrl: './award.component.html',
  styleUrls: ['./award.component.css'],
})
export class AwardComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: AwardFilter = 'all';
  activeSort: AwardSort = 'recent';
  searchTerm = '';

  modalMode: AwardEditorMode = 'create';
  activeAwardId: number = null;

  awards: AwardView[] = [];
  filteredAwards: AwardView[] = [];
  featuredAward: AwardView = null;

  employees: AwardReference[] = [];
  awardTypes: AwardReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly awardForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.awardForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      awardTypeId: ['', [Validators.required]],
      awardDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadAwardWorkspace();
    super.loadScripts();
  }

  get totalAwardsCount(): number {
    return this.awards.length;
  }

  get recentAwardsCount(): number {
    return this.awards.filter((item) => item.recent).length;
  }

  get documentedAwardsCount(): number {
    return this.awards.filter((item) => item.documented).length;
  }

  get recognizedEmployeesCount(): number {
    return new Set(
      this.awards
        .map((item) => item.employeeName)
        .filter((value) => value.length > 0)
    ).size;
  }

  get noteCoverage(): number {
    return this.toPercent(this.documentedAwardsCount, Math.max(this.totalAwardsCount, 1));
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredAwards.length);
    const totalCount = this.formatCount(this.awards.length);

    return this.filteredAwards.length === this.awards.length
      ? filteredCount + ' awards'
      : filteredCount + ' of ' + totalCount + ' awards';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create award' : 'Edit award';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the recipient, award category, and date so recognition stays traceable and client-ready.'
      : 'Refine the recognition record and preserve the story behind the achievement.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.awardForm.value.employeeId);
  }

  get draftAwardTypeName(): string {
    return this.lookupOptionName(this.awardTypes, this.awardForm.value.awardTypeId);
  }

  get draftQuality(): AwardQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.draftAwardTypeName,
      this.normalizeText(this.awardForm.value.awardDate),
      this.normalizeText(this.awardForm.value.description)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: AwardView): void {
    this.modalMode = 'edit';
    this.activeAwardId = item.id;
    this.submitted = false;
    this.featuredAward = item;
    this.awardForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      awardTypeId: item.awardTypeId !== null ? String(item.awardTypeId) : '',
      awardDate: item.awardDate,
      description: item.description,
    });
  }

  selectAward(item: AwardView): void {
    this.featuredAward = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: AwardFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: AwardSort): void {
    this.activeSort = value || 'recent';
    this.applyFilters();
  }

  refreshAwards(): void {
    this.loadAwardWorkspace(true);
  }

  trackByAwardId(index: number, item: AwardView): number {
    return item.id || index;
  }

  async saveAward(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.awardForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeAwardId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/award/update/' + this.activeAwardId,
          payload
        );
        super.show('Confirmation', 'Award updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/award/create', payload);
        super.show('Confirmation', 'Award created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadAwardWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteAward(item: AwardView): Promise<void> {
    const confirmed = confirm(
      'Delete the award for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/award/delete/' + item.id);
      super.show('Confirmation', 'Award deleted successfully.', 'success');

      if (this.featuredAward && this.featuredAward.id === item.id) {
        this.featuredAward = null;
      }

      this.loadAwardWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadAwardWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      awards: this.httpService.getAll(CONFIG.URL_BASE + '/award/all'),
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
      awardTypes: this.httpService
        .getAll(CONFIG.URL_BASE + '/typeaward/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.awardTypes = this.normalizeNamedOptions(result.awardTypes);
          this.awards = this.normalizeAwards(result.awards);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Awards refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.awards = [];
          this.filteredAwards = [];
          this.featuredAward = null;
          this.loadError = 'Unable to load award records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeAwardId = null;
    this.submitted = false;
    this.saving = false;
    this.awardForm.reset({
      employeeId: '',
      awardTypeId: '',
      awardDate: '',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredAwards = this.awards
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.awardTypeName.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'recent'
            ? item.recent
            : this.activeFilter === 'needs-note'
            ? !item.documented
            : !item.recent;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'quality') {
          const qualityDifference = right.qualityScore - left.qualityScore;
          return qualityDifference !== 0
            ? qualityDifference
            : right.awardDate.localeCompare(left.awardDate);
        }

        return right.awardDate.localeCompare(left.awardDate);
      });

    if (!this.filteredAwards.length) {
      this.featuredAward = null;
      return;
    }

    if (
      !this.featuredAward ||
      !this.filteredAwards.some((item) => item.id === this.featuredAward.id)
    ) {
      this.featuredAward = this.filteredAwards[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): AwardReference[] {
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

  private normalizeNamedOptions(data: unknown): AwardReference[] {
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

  private normalizeAwards(data: unknown): AwardView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.hasAwardContent(record))
      .map((record, index) => this.toAwardView(record, index));
  }

  private hasAwardContent(record: any): boolean {
    return !!(
      this.normalizeText(record && record.employeeName && record.employeeName.fullName) ||
      this.normalizeText(record && record.awardType && record.awardType.name) ||
      this.normalizeText(record && record.awardDate)
    );
  }

  private toAwardView(record: any, index: number): AwardView {
    const employeeName = this.normalizeText(record && record.employeeName && record.employeeName.fullName);
    const employeeId = this.toNumericId(record && record.employeeName && record.employeeName.id);
    const awardTypeName = this.normalizeText(record && record.awardType && record.awardType.name);
    const awardTypeId = this.toNumericId(record && record.awardType && record.awardType.id);
    const awardDate = this.normalizeText(record && record.awardDate);
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateQuality(
      employeeName,
      awardTypeName,
      awardDate,
      description
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      awardTypeId,
      awardTypeName,
      awardDate,
      awardDateLabel: this.formatDateLabel(awardDate),
      description,
      summary: this.buildSummary(description, employeeName, awardTypeName),
      recent: this.isRecentAward(awardDate),
      documented: description.length > 0,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      timelineLabel: this.buildTimelineLabel(awardDate),
    };
  }

  private buildSummary(
    description: string,
    employeeName: string,
    awardTypeName: string
  ): string {
    if (description) {
      return description.length > 170
        ? description.slice(0, 167).trim() + '...'
        : description;
    }

    return [employeeName, awardTypeName].filter(Boolean).join(' • ') ||
      'Add recognition context so the achievement is visible beyond the title.';
  }

  private evaluateQuality(
    employeeName: string,
    awardTypeName: string,
    awardDate: string,
    description: string
  ): AwardQuality {
    const coverage = [employeeName, awardTypeName, awardDate].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 3 && description.length >= 40) {
      return {
        label: 'Rich',
        tone: 'strong',
        score: 100,
      };
    }

    if (coverage >= 3) {
      return {
        label: 'Solid',
        tone: 'medium',
        score: 82,
      };
    }

    if (coverage >= 2) {
      return {
        label: 'Needs detail',
        tone: 'warning',
        score: 56,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 16,
    };
  }

  private buildTimelineLabel(awardDate: string): string {
    if (!awardDate) {
      return 'Award date not set';
    }

    const daysSinceAward = this.daysSince(awardDate);
    if (daysSinceAward <= 30) {
      return daysSinceAward === 0 ? 'Awarded today' : 'Awarded ' + daysSinceAward + ' day' + (daysSinceAward === 1 ? '' : 's') + ' ago';
    }

    return 'Awarded on ' + this.formatDateLabel(awardDate);
  }

  private buildPayload(): {
    employeeName: { id: number };
    awardType: { id: number };
    awardDate: string;
    description: string;
  } | null {
    const employeeId = this.toNumericId(this.awardForm.value.employeeId);
    const awardTypeId = this.toNumericId(this.awardForm.value.awardTypeId);
    const awardDate = this.normalizeText(this.awardForm.value.awardDate);
    const description = this.normalizeText(this.awardForm.value.description);

    this.awardForm.patchValue(
      {
        employeeId: employeeId !== null ? String(employeeId) : '',
        awardTypeId: awardTypeId !== null ? String(awardTypeId) : '',
        awardDate,
        description,
      },
      { emitEvent: false }
    );

    if (employeeId === null) {
      this.awardForm.get('employeeId').setErrors({ required: true });
    }

    if (awardTypeId === null) {
      this.awardForm.get('awardTypeId').setErrors({ required: true });
    }

    if (!awardDate) {
      this.awardForm.get('awardDate').setErrors({ required: true });
    }

    if (this.awardForm.invalid || employeeId === null || awardTypeId === null || !awardDate) {
      return null;
    }

    return {
      employeeName: { id: employeeId },
      awardType: { id: awardTypeId },
      awardDate,
      description,
    };
  }

  private lookupOptionName(options: AwardReference[], value: unknown): string {
    const targetId = this.toNumericId(value);

    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('awardCrudModalClose');

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

  private isRecentAward(awardDate: string): boolean {
    return this.daysSince(awardDate) <= 90;
  }

  private daysSince(value: string): number {
    const targetValue = this.toDateValue(value);
    if (!Number.isFinite(targetValue)) {
      return Number.MAX_SAFE_INTEGER;
    }

    return Math.abs(Math.round((this.startOfToday() - targetValue) / 86400000));
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

  private startOfToday(): number {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the award request right now.';
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
