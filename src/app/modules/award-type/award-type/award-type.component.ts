import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface AwardTypeQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface AwardTypeView {
  id: number;
  name: string;
  summary: string;
  awardCount: number;
  recipients: string[];
  qualityLabel: AwardTypeQuality['label'];
  qualityTone: AwardTypeQuality['tone'];
  qualityScore: number;
  active: boolean;
}

type AwardTypeFilter = 'all' | 'used' | 'unused';
type AwardTypeSort = 'usage' | 'name-asc' | 'quality';
type AwardTypeEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-award-type',
  templateUrl: './award-type.component.html',
  styleUrls: ['./award-type.component.css'],
})
export class AwardTypeComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: AwardTypeFilter = 'all';
  activeSort: AwardTypeSort = 'usage';
  searchTerm = '';

  modalMode: AwardTypeEditorMode = 'create';
  activeAwardTypeId: number = null;

  awardTypes: AwardTypeView[] = [];
  filteredAwardTypes: AwardTypeView[] = [];
  featuredAwardType: AwardTypeView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly awardTypeForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.awardTypeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  ngOnInit(): void {
    this.loadAwardTypeWorkspace();
    super.loadScripts();
  }

  get totalTypesCount(): number {
    return this.awardTypes.length;
  }

  get activeTypesCount(): number {
    return this.awardTypes.filter((item) => item.active).length;
  }

  get unusedTypesCount(): number {
    return this.awardTypes.filter((item) => !item.active).length;
  }

  get linkedAwardsCount(): number {
    return this.awardTypes.reduce((total, item) => total + item.awardCount, 0);
  }

  get usageCoverage(): number {
    return this.toPercent(this.activeTypesCount, Math.max(this.totalTypesCount, 1));
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredAwardTypes.length);
    const totalCount = this.formatCount(this.awardTypes.length);

    return this.filteredAwardTypes.length === this.awardTypes.length
      ? filteredCount + ' award types'
      : filteredCount + ' of ' + totalCount + ' award types';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create award type' : 'Edit award type';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Create a recognition category that can be reused across awards and employee celebration flows.'
      : 'Refine the recognition taxonomy so award reporting stays consistent and client-ready.';
  }

  get draftName(): string {
    return this.normalizeText(this.awardTypeForm.value.name) || 'Untitled award type';
  }

  get draftQuality(): AwardTypeQuality {
    return this.evaluateQuality(this.draftName, 0);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: AwardTypeView): void {
    this.modalMode = 'edit';
    this.activeAwardTypeId = item.id;
    this.submitted = false;
    this.featuredAwardType = item;
    this.awardTypeForm.reset({
      name: item.name,
    });
  }

  selectAwardType(item: AwardTypeView): void {
    this.featuredAwardType = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: AwardTypeFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: AwardTypeSort): void {
    this.activeSort = value || 'usage';
    this.applyFilters();
  }

  refreshAwardTypes(): void {
    this.loadAwardTypeWorkspace(true);
  }

  trackByAwardTypeId(index: number, item: AwardTypeView): number {
    return item.id || index;
  }

  async saveAwardType(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.awardTypeForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeAwardTypeId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/typeaward/update/' + this.activeAwardTypeId,
          payload
        );
        super.show('Confirmation', 'Award type updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/typeaward/create', payload);
        super.show('Confirmation', 'Award type created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadAwardTypeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteAwardType(item: AwardTypeView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/typeaward/delete/' + item.id);
      super.show('Confirmation', 'Award type deleted successfully.', 'success');

      if (this.featuredAwardType && this.featuredAwardType.id === item.id) {
        this.featuredAwardType = null;
      }

      this.loadAwardTypeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadAwardTypeWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      awardTypes: this.httpService.getAll(CONFIG.URL_BASE + '/typeaward/all'),
      awards: this.httpService
        .getAll(CONFIG.URL_BASE + '/award/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.awardTypes = this.normalizeAwardTypes(result.awardTypes, result.awards);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Award types refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.awardTypes = [];
          this.filteredAwardTypes = [];
          this.featuredAwardType = null;
          this.loadError = 'Unable to load award type records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeAwardTypeId = null;
    this.submitted = false;
    this.saving = false;
    this.awardTypeForm.reset({
      name: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredAwardTypes = this.awardTypes
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.recipients.some((recipient) => recipient.toLowerCase().includes(searchValue));

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

        const usageDifference = right.awardCount - left.awardCount;
        return usageDifference !== 0
          ? usageDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredAwardTypes.length) {
      this.featuredAwardType = null;
      return;
    }

    if (
      !this.featuredAwardType ||
      !this.filteredAwardTypes.some((item) => item.id === this.featuredAwardType.id)
    ) {
      this.featuredAwardType = this.filteredAwardTypes[0];
    }
  }

  private normalizeAwardTypes(awardTypesData: unknown, awardsData: unknown): AwardTypeView[] {
    if (!Array.isArray(awardTypesData)) {
      return [];
    }

    const awards = Array.isArray(awardsData) ? awardsData : [];

    return awardTypesData
      .filter((record) => this.normalizeText(record && record.name).length > 0)
      .map((record, index) => this.toAwardTypeView(record, index, awards));
  }

  private toAwardTypeView(record: any, index: number, awards: any[]): AwardTypeView {
    const name = this.normalizeText(record && record.name) || 'Untitled award type';
    const numericId = Number(record && record.id);
    const id = Number.isFinite(numericId) ? numericId : index + 1;
    const recipients = awards
      .filter((item) => this.toNumericId(item && item.awardType && item.awardType.id) === id)
      .map((item) => this.normalizeText(item && item.employeeName && item.employeeName.fullName))
      .filter((item) => item.length > 0);
    const quality = this.evaluateQuality(name, recipients.length);

    return {
      id,
      name,
      summary: recipients.length
        ? recipients.length + ' recognition record' + (recipients.length === 1 ? '' : 's') + ' currently use this category.'
        : 'No awards use this category yet. Keep it ready for the next recognition cycle.',
      awardCount: recipients.length,
      recipients,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      active: recipients.length > 0,
    };
  }

  private evaluateQuality(name: string, awardCount: number): AwardTypeQuality {
    if (name && awardCount >= 2) {
      return {
        label: 'Established',
        tone: 'strong',
        score: 100,
      };
    }

    if (name && awardCount === 1) {
      return {
        label: 'Active',
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
    const name = this.normalizeText(this.awardTypeForm.value.name);

    this.awardTypeForm.patchValue(
      {
        name,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.awardTypeForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.awardTypeForm.invalid) {
      return null;
    }

    return {
      name,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('awardTypeCrudModalClose');

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

    return 'Unable to complete the award type request right now.';
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
