import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface EducationQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface EducationLevelView {
  id: number;
  name: string;
  years: string;
  yearsLabel: string;
  certificateLevel: string;
  fieldofStudy: string;
  school: string;
  summary: string;
  complete: boolean;
  qualityLabel: EducationQuality['label'];
  qualityTone: EducationQuality['tone'];
  qualityScore: number;
}

type EducationFilter = 'all' | 'complete' | 'missing-school' | 'needs-detail';
type EducationSort = 'quality' | 'name-asc' | 'duration-desc';
type EducationEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-education-level',
  templateUrl: './education-level.component.html',
  styleUrls: ['./education-level.component.css'],
})
export class EducationLevelComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: EducationFilter = 'all';
  activeSort: EducationSort = 'quality';
  searchTerm = '';

  modalMode: EducationEditorMode = 'create';
  activeEducationLevelId: number = null;

  educationLevels: EducationLevelView[] = [];
  filteredEducationLevels: EducationLevelView[] = [];
  featuredEducationLevel: EducationLevelView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly educationLevelForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.educationLevelForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      years: ['', [Validators.maxLength(20)]],
      certificateLevel: ['', [Validators.maxLength(120)]],
      fieldofStudy: ['', [Validators.maxLength(160)]],
      school: ['', [Validators.maxLength(160)]],
    });
  }

  ngOnInit(): void {
    this.loadEducationLevels();
    super.loadScripts();
  }

  get totalEducationLevelsCount(): number {
    return this.educationLevels.length;
  }

  get completeProfilesCount(): number {
    return this.educationLevels.filter((item) => item.complete).length;
  }

  get schoolLinkedCount(): number {
    return this.educationLevels.filter((item) => item.school.length > 0).length;
  }

  get compactProgramsCount(): number {
    return this.educationLevels.filter((item) => this.toYears(item.years) <= 2).length;
  }

  get completionCoverage(): number {
    return this.toPercent(
      this.completeProfilesCount,
      Math.max(this.totalEducationLevelsCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredEducationLevels.length);
    const totalCount = this.formatCount(this.educationLevels.length);

    return this.filteredEducationLevels.length === this.educationLevels.length
      ? filteredCount + ' education levels'
      : filteredCount + ' of ' + totalCount + ' education levels';
  }

  get modalTitle(): string {
    return this.modalMode === 'create'
      ? 'Create education level'
      : 'Edit education level';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the credential, duration, and study context in one clear record.'
      : 'Refine the qualification catalog and keep credential details consistent.';
  }

  get draftQuality(): EducationQuality {
    return this.evaluateQuality(
      this.normalizeText(this.educationLevelForm.value.name),
      this.normalizeText(this.educationLevelForm.value.years),
      this.normalizeText(this.educationLevelForm.value.certificateLevel),
      this.normalizeText(this.educationLevelForm.value.fieldofStudy),
      this.normalizeText(this.educationLevelForm.value.school)
    );
  }

  get draftSummary(): string {
    return this.buildSummary(
      this.normalizeText(this.educationLevelForm.value.fieldofStudy),
      this.normalizeText(this.educationLevelForm.value.school)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: EducationLevelView): void {
    this.modalMode = 'edit';
    this.activeEducationLevelId = item.id;
    this.submitted = false;
    this.featuredEducationLevel = item;
    this.educationLevelForm.reset({
      name: item.name,
      years: item.years,
      certificateLevel: item.certificateLevel,
      fieldofStudy: item.fieldofStudy,
      school: item.school,
    });
  }

  selectEducationLevel(item: EducationLevelView): void {
    this.featuredEducationLevel = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: EducationFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: EducationSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshEducationLevels(): void {
    this.loadEducationLevels(true);
  }

  trackByEducationLevelId(index: number, item: EducationLevelView): number {
    return item.id || index;
  }

  async saveEducationLevel(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.educationLevelForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeEducationLevelId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/educationLevel/update/' + this.activeEducationLevelId,
          payload
        );
        super.show('Confirmation', 'Education level updated successfully.', 'success');
      } else {
        await this.httpService.create(
          CONFIG.URL_BASE + '/educationLevel/create',
          payload
        );
        super.show('Confirmation', 'Education level created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadEducationLevels();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteEducationLevel(item: EducationLevelView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/educationLevel/delete/' + item.id
      );
      super.show('Confirmation', 'Education level deleted successfully.', 'success');

      if (
        this.featuredEducationLevel &&
        this.featuredEducationLevel.id === item.id
      ) {
        this.featuredEducationLevel = null;
      }

      this.loadEducationLevels();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadEducationLevels(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/educationLevel/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.educationLevels = this.normalizeEducationLevels(data);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Education levels refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.educationLevels = [];
          this.filteredEducationLevels = [];
          this.featuredEducationLevel = null;
          this.loadError = 'Unable to load education level records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeEducationLevelId = null;
    this.submitted = false;
    this.saving = false;
    this.educationLevelForm.reset({
      name: '',
      years: '',
      certificateLevel: '',
      fieldofStudy: '',
      school: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredEducationLevels = this.educationLevels
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.certificateLevel.toLowerCase().includes(searchValue) ||
          item.fieldofStudy.toLowerCase().includes(searchValue) ||
          item.school.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'complete'
            ? item.complete
            : this.activeFilter === 'missing-school'
            ? !item.school
            : item.qualityScore < 80;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'duration-desc') {
          return this.toYears(right.years) - this.toYears(left.years);
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredEducationLevels.length) {
      this.featuredEducationLevel = null;
      return;
    }

    if (
      !this.featuredEducationLevel ||
      !this.filteredEducationLevels.some(
        (item) => item.id === this.featuredEducationLevel.id
      )
    ) {
      this.featuredEducationLevel = this.filteredEducationLevels[0];
    }
  }

  private normalizeEducationLevels(data: unknown): EducationLevelView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.normalizeText(record && record.name).length > 0)
      .map((record, index) => this.toEducationLevelView(record, index));
  }

  private toEducationLevelView(record: any, index: number): EducationLevelView {
    const name = this.normalizeText(record && record.name) || 'Untitled education level';
    const years = this.normalizeText(record && record.years);
    const certificateLevel = this.normalizeText(record && record.certificateLevel);
    const fieldofStudy = this.normalizeText(record && record.fieldofStudy);
    const school = this.normalizeText(record && record.school);
    const quality = this.evaluateQuality(
      name,
      years,
      certificateLevel,
      fieldofStudy,
      school
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      name,
      years,
      yearsLabel: years ? years + ' year' + (years === '1' ? '' : 's') : 'Duration not set',
      certificateLevel,
      fieldofStudy,
      school,
      summary: this.buildSummary(fieldofStudy, school),
      complete: !!(name && years && certificateLevel && fieldofStudy && school),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(fieldofStudy: string, school: string): string {
    const details = [fieldofStudy, school].filter((value) => value.length > 0);

    return details.length > 0
      ? details.join(' • ')
      : 'Add the study field and institution to make this credential easier to evaluate.';
  }

  private evaluateQuality(
    name: string,
    years: string,
    certificateLevel: string,
    fieldofStudy: string,
    school: string
  ): EducationQuality {
    const filledFields = [name, years, certificateLevel, fieldofStudy, school].filter(
      (value) => value.length > 0
    ).length;

    if (filledFields === 5) {
      return {
        label: 'Complete',
        tone: 'strong',
        score: 100,
      };
    }

    if (filledFields >= 4) {
      return {
        label: 'Solid',
        tone: 'medium',
        score: 82,
      };
    }

    if (filledFields >= 2) {
      return {
        label: 'Needs detail',
        tone: 'warning',
        score: 58,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 18,
    };
  }

  private buildPayload(): {
    name: string;
    years: string;
    certificateLevel: string;
    fieldofStudy: string;
    school: string;
  } | null {
    const name = this.normalizeText(this.educationLevelForm.value.name);
    const years = this.normalizeText(this.educationLevelForm.value.years);
    const certificateLevel = this.normalizeText(
      this.educationLevelForm.value.certificateLevel
    );
    const fieldofStudy = this.normalizeText(this.educationLevelForm.value.fieldofStudy);
    const school = this.normalizeText(this.educationLevelForm.value.school);

    this.educationLevelForm.patchValue(
      {
        name,
        years,
        certificateLevel,
        fieldofStudy,
        school,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.educationLevelForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.educationLevelForm.invalid) {
      return null;
    }

    return {
      name,
      years,
      certificateLevel,
      fieldofStudy,
      school,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('educationLevelCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toYears(value: string): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the education level request right now.';
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
