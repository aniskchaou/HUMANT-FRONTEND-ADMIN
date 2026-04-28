import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface TrainingReference {
  id: number;
  name: string;
}

interface TrainingQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface TrainingView {
  id: number;
  name: string;
  employeeId: number | null;
  employeeName: string;
  trainingTypeId: number | null;
  trainingTypeName: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  description: string;
  summary: string;
  active: boolean;
  upcoming: boolean;
  completed: boolean;
  qualityLabel: TrainingQuality['label'];
  qualityTone: TrainingQuality['tone'];
  qualityScore: number;
  timelineLabel: string;
  durationLabel: string;
}

type TrainingFilter = 'all' | 'active' | 'upcoming' | 'completed';
type TrainingSort = 'quality' | 'nearest' | 'name-asc';
type TrainingEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
})
export class TrainingComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: TrainingFilter = 'all';
  activeSort: TrainingSort = 'quality';
  searchTerm = '';

  modalMode: TrainingEditorMode = 'create';
  activeTrainingId: number = null;

  trainings: TrainingView[] = [];
  filteredTrainings: TrainingView[] = [];
  featuredTraining: TrainingView = null;

  employees: TrainingReference[] = [];
  trainingTypes: TrainingReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly trainingForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.trainingForm = this.formBuilder.group({
      trainingTypeId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(160)]],
      employeeId: ['', [Validators.required]],
      startDate: [''],
      endDate: [''],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadTrainingWorkspace();
    super.loadScripts();
  }

  get totalTrainingsCount(): number {
    return this.trainings.length;
  }

  get activeTrainingsCount(): number {
    return this.trainings.filter((item) => item.active).length;
  }

  get upcomingTrainingsCount(): number {
    return this.trainings.filter((item) => item.upcoming).length;
  }

  get documentedTrainingsCount(): number {
    return this.trainings.filter((item) => item.description.length > 0).length;
  }

  get documentationCoverage(): number {
    return this.toPercent(
      this.documentedTrainingsCount,
      Math.max(this.totalTrainingsCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredTrainings.length);
    const totalCount = this.formatCount(this.trainings.length);

    return this.filteredTrainings.length === this.trainings.length
      ? filteredCount + ' learning programs'
      : filteredCount + ' of ' + totalCount + ' learning programs';
  }

  get modalTitle(): string {
    return this.modalMode === 'create'
      ? 'Create learning program'
      : 'Edit learning program';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Set the participant, learning track, and timeline so each program record can actually be trusted.'
      : 'Refine the learning program details and keep delivery, ownership, and timing aligned.';
  }

  get draftProgramName(): string {
    return this.normalizeText(this.trainingForm.value.name) || 'Untitled learning program';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.trainingForm.value.employeeId);
  }

  get draftTrainingTypeName(): string {
    return this.lookupOptionName(this.trainingTypes, this.trainingForm.value.trainingTypeId);
  }

  get draftQuality(): TrainingQuality {
    return this.evaluateQuality(
      this.draftProgramName,
      this.draftEmployeeName,
      this.draftTrainingTypeName,
      this.normalizeText(this.trainingForm.value.startDate),
      this.normalizeText(this.trainingForm.value.endDate),
      this.normalizeText(this.trainingForm.value.description)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: TrainingView): void {
    this.modalMode = 'edit';
    this.activeTrainingId = item.id;
    this.submitted = false;
    this.featuredTraining = item;
    this.trainingForm.reset({
      trainingTypeId: item.trainingTypeId !== null ? String(item.trainingTypeId) : '',
      name: item.name,
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      startDate: item.startDate,
      endDate: item.endDate,
      description: item.description,
    });
  }

  selectTraining(item: TrainingView): void {
    this.featuredTraining = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: TrainingFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: TrainingSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshTrainings(): void {
    this.loadTrainingWorkspace(true);
  }

  trackByTrainingId(index: number, item: TrainingView): number {
    return item.id || index;
  }

  async saveTraining(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.trainingForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeTrainingId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/training/update/' + this.activeTrainingId,
          payload
        );
        super.show('Confirmation', 'Learning program updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/training/create', payload);
        super.show('Confirmation', 'Learning program created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadTrainingWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteTraining(item: TrainingView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/training/delete/' + item.id);
      super.show('Confirmation', 'Learning program deleted successfully.', 'success');

      if (this.featuredTraining && this.featuredTraining.id === item.id) {
        this.featuredTraining = null;
      }

      this.loadTrainingWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadTrainingWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      trainings: this.httpService.getAll(CONFIG.URL_BASE + '/training/all'),
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
      trainingTypes: this.httpService
        .getAll(CONFIG.URL_BASE + '/typetraining/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.trainingTypes = this.normalizeNamedOptions(result.trainingTypes);
          this.trainings = this.normalizeTrainings(result.trainings);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Learning programs refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.trainings = [];
          this.filteredTrainings = [];
          this.featuredTraining = null;
          this.loadError = 'Unable to load learning programs from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeTrainingId = null;
    this.submitted = false;
    this.saving = false;
    this.trainingForm.reset({
      trainingTypeId: '',
      name: '',
      employeeId: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredTrainings = this.trainings
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.trainingTypeName.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'active'
            ? item.active
            : this.activeFilter === 'upcoming'
            ? item.upcoming
            : item.completed;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'nearest') {
          return this.toDateValue(left.startDate) - this.toDateValue(right.startDate);
        }

        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredTrainings.length) {
      this.featuredTraining = null;
      return;
    }

    if (
      !this.featuredTraining ||
      !this.filteredTrainings.some((item) => item.id === this.featuredTraining.id)
    ) {
      this.featuredTraining = this.filteredTrainings[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): TrainingReference[] {
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

  private normalizeNamedOptions(data: unknown): TrainingReference[] {
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

  private normalizeTrainings(data: unknown): TrainingView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.hasTrainingContent(record))
      .map((record, index) => this.toTrainingView(record, index));
  }

  private hasTrainingContent(record: any): boolean {
    return !!(
      this.normalizeText(record && record.name) ||
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.normalizeText(record && record.typetraining && record.typetraining.name)
    );
  }

  private toTrainingView(record: any, index: number): TrainingView {
    const name = this.normalizeText(record && record.name) || 'Untitled learning program';
    const employeeName = this.normalizeText(record && record.employee && record.employee.fullName);
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const trainingTypeName = this.normalizeText(
      record && record.typetraining && record.typetraining.name
    );
    const trainingTypeId = this.toNumericId(
      record && record.typetraining && record.typetraining.id
    );
    const startDate = this.normalizeText(record && record.startDate);
    const endDate = this.normalizeText(record && record.endDate);
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateQuality(
      name,
      employeeName,
      trainingTypeName,
      startDate,
      endDate,
      description
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      name,
      employeeId,
      employeeName,
      trainingTypeId,
      trainingTypeName,
      startDate,
      startDateLabel: this.formatDateLabel(startDate),
      endDate,
      endDateLabel: this.formatDateLabel(endDate),
      description,
      summary: this.buildSummary(description, employeeName, trainingTypeName),
      active: this.isActiveTraining(startDate, endDate),
      upcoming: this.isUpcomingTraining(startDate),
      completed: this.isCompletedTraining(endDate),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      timelineLabel: this.buildTimelineLabel(startDate, endDate),
      durationLabel: this.buildDurationLabel(startDate, endDate),
    };
  }

  private buildSummary(
    description: string,
    employeeName: string,
    trainingTypeName: string
  ): string {
    if (description) {
      return description.length > 170
        ? description.slice(0, 167).trim() + '...'
        : description;
    }

    return [employeeName, trainingTypeName].filter(Boolean).join(' • ') ||
      'Add participant context, learning goals, and timeline details.';
  }

  private evaluateQuality(
    name: string,
    employeeName: string,
    trainingTypeName: string,
    startDate: string,
    endDate: string,
    description: string
  ): TrainingQuality {
    const coverage = [name, employeeName, trainingTypeName, startDate, endDate].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 5 && description.length >= 40) {
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

  private buildTimelineLabel(startDate: string, endDate: string): string {
    if (this.isActiveTraining(startDate, endDate)) {
      if (endDate) {
        const remainingDays = this.daysUntil(endDate);
        return remainingDays >= 0
          ? 'Ends in ' + remainingDays + ' day' + (remainingDays === 1 ? '' : 's')
          : 'Program window needs review';
      }

      return 'In progress';
    }

    if (this.isUpcomingTraining(startDate)) {
      const remainingDays = this.daysUntil(startDate);
      return 'Starts in ' + remainingDays + ' day' + (remainingDays === 1 ? '' : 's');
    }

    if (this.isCompletedTraining(endDate)) {
      return 'Completed on ' + this.formatDateLabel(endDate);
    }

    if (startDate) {
      return 'Starts on ' + this.formatDateLabel(startDate);
    }

    return 'Schedule pending';
  }

  private buildDurationLabel(startDate: string, endDate: string): string {
    if (!startDate || !endDate) {
      return 'Dates not finalized';
    }

    const duration = this.daysBetween(startDate, endDate);
    if (duration < 1) {
      return 'Review date range';
    }

    return duration + ' day' + (duration === 1 ? '' : 's');
  }

  private buildPayload(): {
    typetraining: { id: number };
    name: string;
    employee: { id: number };
    startDate: string;
    endDate: string;
    description: string;
  } | null {
    const trainingTypeId = this.toNumericId(this.trainingForm.value.trainingTypeId);
    const name = this.normalizeText(this.trainingForm.value.name);
    const employeeId = this.toNumericId(this.trainingForm.value.employeeId);
    const startDate = this.normalizeText(this.trainingForm.value.startDate);
    const endDate = this.normalizeText(this.trainingForm.value.endDate);
    const description = this.normalizeText(this.trainingForm.value.description);

    this.trainingForm.patchValue(
      {
        trainingTypeId: trainingTypeId !== null ? String(trainingTypeId) : '',
        name,
        employeeId: employeeId !== null ? String(employeeId) : '',
        startDate,
        endDate,
        description,
      },
      { emitEvent: false }
    );

    if (trainingTypeId === null) {
      this.trainingForm.get('trainingTypeId').setErrors({ required: true });
    }

    if (!name) {
      this.trainingForm.get('name').setErrors({ required: true });
    }

    if (employeeId === null) {
      this.trainingForm.get('employeeId').setErrors({ required: true });
    }

    if (this.trainingForm.invalid || trainingTypeId === null || employeeId === null) {
      return null;
    }

    return {
      typetraining: { id: trainingTypeId },
      name,
      employee: { id: employeeId },
      startDate,
      endDate,
      description,
    };
  }

  private lookupOptionName(options: TrainingReference[], value: unknown): string {
    const targetId = this.toNumericId(value);

    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('trainingCrudModalClose');

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

  private isActiveTraining(startDate: string, endDate: string): boolean {
    const today = this.startOfToday();
    const startValue = this.toDateValue(startDate);
    const endValue = endDate ? this.toDateValue(endDate) : Number.MAX_SAFE_INTEGER;

    return startValue <= today && today <= endValue;
  }

  private isUpcomingTraining(startDate: string): boolean {
    return !!startDate && this.toDateValue(startDate) > this.startOfToday();
  }

  private isCompletedTraining(endDate: string): boolean {
    return !!endDate && this.toDateValue(endDate) < this.startOfToday();
  }

  private daysUntil(value: string): number {
    const targetDate = this.toDateValue(value);
    if (!Number.isFinite(targetDate)) {
      return 0;
    }

    return Math.round((targetDate - this.startOfToday()) / 86400000);
  }

  private daysBetween(startDate: string, endDate: string): number {
    const startValue = this.toDateValue(startDate);
    const endValue = this.toDateValue(endDate);

    if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) {
      return 0;
    }

    return Math.round((endValue - startValue) / 86400000) + 1;
  }

  private startOfToday(): number {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the learning program request right now.';
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
