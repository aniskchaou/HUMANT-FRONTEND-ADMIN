import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface DesignationQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface DepartementReference {
  id: number;
  name: string;
}

interface DesignationView {
  id: number;
  name: string;
  departementId: number | null;
  departementName: string;
  summary: string;
  aligned: boolean;
  qualityLabel: DesignationQuality['label'];
  qualityTone: DesignationQuality['tone'];
  qualityScore: number;
}

type DesignationFilter = 'all' | 'aligned' | 'unassigned';
type DesignationSort = 'quality' | 'name-asc' | 'departement-asc';
type DesignationEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css'],
})
export class DesignationComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: DesignationFilter = 'all';
  activeSort: DesignationSort = 'quality';
  searchTerm = '';

  modalMode: DesignationEditorMode = 'create';
  activeDesignationId: number = null;

  designations: DesignationView[] = [];
  filteredDesignations: DesignationView[] = [];
  featuredDesignation: DesignationView = null;
  departements: DepartementReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly designationForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.designationForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      departementId: [''],
    });
  }

  ngOnInit(): void {
    this.loadDesignationWorkspace();
    super.loadScripts();
  }

  get totalDesignationsCount(): number {
    return this.designations.length;
  }

  get alignedDesignationsCount(): number {
    return this.designations.filter((item) => item.aligned).length;
  }

  get unassignedDesignationsCount(): number {
    return this.designations.filter((item) => !item.aligned).length;
  }

  get representedDepartementsCount(): number {
    const represented = this.designations
      .map((item) => item.departementName)
      .filter((value) => value.length > 0);

    return new Set(represented).size;
  }

  get alignmentCoverage(): number {
    return this.toPercent(
      this.alignedDesignationsCount,
      Math.max(this.totalDesignationsCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredDesignations.length);
    const totalCount = this.formatCount(this.designations.length);

    return this.filteredDesignations.length === this.designations.length
      ? filteredCount + ' designations'
      : filteredCount + ' of ' + totalCount + ' designations';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create designation' : 'Edit designation';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Add a reusable job title and anchor it to the right department.'
      : 'Refine the title library and keep the team alignment consistent.';
  }

  get draftName(): string {
    return this.normalizeText(this.designationForm.value.name) || 'Untitled designation';
  }

  get draftDepartementName(): string {
    return this.lookupDepartementName(this.designationForm.value.departementId);
  }

  get draftQuality(): DesignationQuality {
    return this.evaluateQuality(this.draftName, this.draftDepartementName);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: DesignationView): void {
    this.modalMode = 'edit';
    this.activeDesignationId = item.id;
    this.submitted = false;
    this.featuredDesignation = item;
    this.designationForm.reset({
      name: item.name,
      departementId: item.departementId !== null ? String(item.departementId) : '',
    });
  }

  selectDesignation(item: DesignationView): void {
    this.featuredDesignation = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: DesignationFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: DesignationSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshDesignations(): void {
    this.loadDesignationWorkspace(true);
  }

  trackByDesignationId(index: number, item: DesignationView): number {
    return item.id || index;
  }

  async saveDesignation(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.designationForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeDesignationId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/designation/update/' + this.activeDesignationId,
          payload
        );
        super.show('Confirmation', 'Designation updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/designation/create', payload);
        super.show('Confirmation', 'Designation created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadDesignationWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteDesignation(item: DesignationView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/designation/delete/' + item.id
      );
      super.show('Confirmation', 'Designation deleted successfully.', 'success');

      if (this.featuredDesignation && this.featuredDesignation.id === item.id) {
        this.featuredDesignation = null;
      }

      this.loadDesignationWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadDesignationWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      designations: this.httpService.getAll(CONFIG.URL_BASE + '/designation/all'),
      departements: this.httpService
        .getAll(CONFIG.URL_BASE + '/departement/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.departements = this.normalizeDepartements(result.departements);
          this.designations = this.normalizeDesignations(result.designations);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Designations refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.designations = [];
          this.filteredDesignations = [];
          this.featuredDesignation = null;
          this.departements = [];
          this.loadError = 'Unable to load designation records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeDesignationId = null;
    this.submitted = false;
    this.saving = false;
    this.designationForm.reset({
      name: '',
      departementId: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredDesignations = this.designations
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.departementName.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'aligned'
            ? item.aligned
            : !item.aligned;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'departement-asc') {
          return left.departementName.localeCompare(right.departementName);
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredDesignations.length) {
      this.featuredDesignation = null;
      return;
    }

    if (
      !this.featuredDesignation ||
      !this.filteredDesignations.some(
        (item) => item.id === this.featuredDesignation.id
      )
    ) {
      this.featuredDesignation = this.filteredDesignations[0];
    }
  }

  private normalizeDepartements(data: unknown): DepartementReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => ({
        id: Number(item && item.id),
        name: this.normalizeText(item && item.name),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.length > 0);
  }

  private normalizeDesignations(data: unknown): DesignationView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.normalizeText(record && record.name).length > 0)
      .map((record, index) => this.toDesignationView(record, index));
  }

  private toDesignationView(record: any, index: number): DesignationView {
    const name = this.normalizeText(record && record.name) || 'Untitled designation';
    const departementId = this.toNumericId(record && record.departement && record.departement.id);
    const departementName = this.normalizeText(
      record && record.departement && record.departement.name
    );
    const quality = this.evaluateQuality(name, departementName);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      name,
      departementId,
      departementName,
      summary: departementName
        ? 'Aligned to ' + departementName + ' for cleaner org planning and reporting.'
        : 'Assign a department so this title is ready for contracts, transfers, and employee mapping.',
      aligned: departementName.length > 0,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private evaluateQuality(
    name: string,
    departementName: string
  ): DesignationQuality {
    if (name && departementName) {
      return {
        label: 'Aligned',
        tone: 'strong',
        score: 100,
      };
    }

    if (name) {
      return {
        label: 'Needs team',
        tone: 'warning',
        score: 58,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 12,
    };
  }

  private buildPayload(): { name: string; departement: { id: number } | null } | null {
    const name = this.normalizeText(this.designationForm.value.name);
    const departementId = this.toNumericId(this.designationForm.value.departementId);

    this.designationForm.patchValue(
      {
        name,
        departementId: departementId !== null ? String(departementId) : '',
      },
      { emitEvent: false }
    );

    if (!name) {
      this.designationForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.designationForm.invalid) {
      return null;
    }

    return {
      name,
      departement: departementId !== null ? { id: departementId } : null,
    };
  }

  private lookupDepartementName(value: unknown): string {
    const targetId = this.toNumericId(value);

    if (targetId === null) {
      return '';
    }

    const matched = this.departements.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('designationCrudModalClose');

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

    return 'Unable to complete the designation request right now.';
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
