import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface TrainingTypeQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface TrainingTypeView {
  id: number;
  name: string;
  summary: string;
  programCount: number;
  linkedPrograms: string[];
  qualityLabel: TrainingTypeQuality['label'];
  qualityTone: TrainingTypeQuality['tone'];
  qualityScore: number;
  active: boolean;
}

type TrainingTypeFilter = 'all' | 'used' | 'unused';
type TrainingTypeSort = 'usage' | 'name-asc' | 'quality';
type TrainingTypeEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-training-type',
  templateUrl: './training-type.component.html',
  styleUrls: ['./training-type.component.css'],
})
export class TrainingTypeComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: TrainingTypeFilter = 'all';
  activeSort: TrainingTypeSort = 'usage';
  searchTerm = '';

  modalMode: TrainingTypeEditorMode = 'create';
  activeTrainingTypeId: number = null;

  trainingTypes: TrainingTypeView[] = [];
  filteredTrainingTypes: TrainingTypeView[] = [];
  featuredTrainingType: TrainingTypeView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly trainingTypeForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.trainingTypeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  ngOnInit(): void {
    this.loadTrainingTypeWorkspace();
    super.loadScripts();
  }

  get totalTypesCount(): number {
    return this.trainingTypes.length;
  }

  get activeTypesCount(): number {
    return this.trainingTypes.filter((item) => item.active).length;
  }

  get unusedTypesCount(): number {
    return this.trainingTypes.filter((item) => !item.active).length;
  }

  get linkedProgramsCount(): number {
    return this.trainingTypes.reduce((total, item) => total + item.programCount, 0);
  }

  get usageCoverage(): number {
    return this.toPercent(this.activeTypesCount, Math.max(this.totalTypesCount, 1));
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredTrainingTypes.length);
    const totalCount = this.formatCount(this.trainingTypes.length);

    return this.filteredTrainingTypes.length === this.trainingTypes.length
      ? filteredCount + ' training types'
      : filteredCount + ' of ' + totalCount + ' training types';
  }

  get modalTitle(): string {
    return this.modalMode === 'create'
      ? 'Create training type'
      : 'Edit training type';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Define a reusable learning category so programs stay structured and easier to scale.'
      : 'Refine the learning taxonomy and keep program labels consistent across the workspace.';
  }

  get draftName(): string {
    return this.normalizeText(this.trainingTypeForm.value.name) || 'Untitled training type';
  }

  get draftQuality(): TrainingTypeQuality {
    return this.evaluateQuality(this.draftName, 0);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: TrainingTypeView): void {
    this.modalMode = 'edit';
    this.activeTrainingTypeId = item.id;
    this.submitted = false;
    this.featuredTrainingType = item;
    this.trainingTypeForm.reset({
      name: item.name,
    });
  }

  selectTrainingType(item: TrainingTypeView): void {
    this.featuredTrainingType = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: TrainingTypeFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: TrainingTypeSort): void {
    this.activeSort = value || 'usage';
    this.applyFilters();
  }

  refreshTrainingTypes(): void {
    this.loadTrainingTypeWorkspace(true);
  }

  trackByTrainingTypeId(index: number, item: TrainingTypeView): number {
    return item.id || index;
  }

  async saveTrainingType(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.trainingTypeForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeTrainingTypeId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/typetraining/update/' + this.activeTrainingTypeId,
          payload
        );
        super.show('Confirmation', 'Training type updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/typetraining/create', payload);
        super.show('Confirmation', 'Training type created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadTrainingTypeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteTrainingType(item: TrainingTypeView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/typetraining/delete/' + item.id
      );
      super.show('Confirmation', 'Training type deleted successfully.', 'success');

      if (this.featuredTrainingType && this.featuredTrainingType.id === item.id) {
        this.featuredTrainingType = null;
      }

      this.loadTrainingTypeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadTrainingTypeWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      types: this.httpService.getAll(CONFIG.URL_BASE + '/typetraining/all'),
      trainings: this.httpService
        .getAll(CONFIG.URL_BASE + '/training/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.trainingTypes = this.normalizeTrainingTypes(result.types, result.trainings);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Training types refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.trainingTypes = [];
          this.filteredTrainingTypes = [];
          this.featuredTrainingType = null;
          this.loadError = 'Unable to load training type records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeTrainingTypeId = null;
    this.submitted = false;
    this.saving = false;
    this.trainingTypeForm.reset({
      name: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredTrainingTypes = this.trainingTypes
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.linkedPrograms.some((program) => program.toLowerCase().includes(searchValue));

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'used'
            ? item.active
            : !item.active;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'quality') {
          const qualityDifference = right.qualityScore - left.qualityScore;
          return qualityDifference !== 0
            ? qualityDifference
            : left.name.localeCompare(right.name);
        }

        const usageDifference = right.programCount - left.programCount;
        return usageDifference !== 0
          ? usageDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredTrainingTypes.length) {
      this.featuredTrainingType = null;
      return;
    }

    if (
      !this.featuredTrainingType ||
      !this.filteredTrainingTypes.some(
        (item) => item.id === this.featuredTrainingType.id
      )
    ) {
      this.featuredTrainingType = this.filteredTrainingTypes[0];
    }
  }

  private normalizeTrainingTypes(typesData: unknown, trainingsData: unknown): TrainingTypeView[] {
    if (!Array.isArray(typesData)) {
      return [];
    }

    const trainings = Array.isArray(trainingsData) ? trainingsData : [];

    return typesData
      .filter((record) => this.normalizeText(record && record.name).length > 0)
      .map((record, index) => this.toTrainingTypeView(record, index, trainings));
  }

  private toTrainingTypeView(record: any, index: number, trainings: any[]): TrainingTypeView {
    const name = this.normalizeText(record && record.name) || 'Untitled training type';
    const numericId = Number(record && record.id);
    const id = Number.isFinite(numericId) ? numericId : index + 1;
    const linkedPrograms = trainings
      .filter((item) => this.toNumericId(item && item.typetraining && item.typetraining.id) === id)
      .map((item) => this.normalizeText(item && item.name))
      .filter((item) => item.length > 0);
    const quality = this.evaluateQuality(name, linkedPrograms.length);

    return {
      id,
      name,
      summary: linkedPrograms.length
        ? linkedPrograms.length + ' learning program' + (linkedPrograms.length === 1 ? '' : 's') + ' currently use this type.'
        : 'No learning programs are assigned yet. Keep this type ready for future curriculum planning.',
      programCount: linkedPrograms.length,
      linkedPrograms,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      active: linkedPrograms.length > 0,
    };
  }

  private evaluateQuality(name: string, programCount: number): TrainingTypeQuality {
    if (name && programCount >= 2) {
      return {
        label: 'Core',
        tone: 'strong',
        score: 100,
      };
    }

    if (name && programCount === 1) {
      return {
        label: 'In use',
        tone: 'medium',
        score: 82,
      };
    }

    if (name) {
      return {
        label: 'Ready',
        tone: 'warning',
        score: 58,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 14,
    };
  }

  private buildPayload(): { name: string } | null {
    const name = this.normalizeText(this.trainingTypeForm.value.name);

    this.trainingTypeForm.patchValue(
      {
        name,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.trainingTypeForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.trainingTypeForm.invalid) {
      return null;
    }

    return {
      name,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('trainingTypeCrudModalClose');

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

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the training type request right now.';
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
