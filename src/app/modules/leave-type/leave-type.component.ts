import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface LeaveTypeQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface LeaveTypeView {
  id: number;
  name: string;
  days: string;
  daysValue: number;
  daysLabel: string;
  summary: string;
  extended: boolean;
  short: boolean;
  qualityLabel: LeaveTypeQuality['label'];
  qualityTone: LeaveTypeQuality['tone'];
  qualityScore: number;
}

type LeaveTypeFilter = 'all' | 'extended' | 'short' | 'standard';
type LeaveTypeSort = 'days-desc' | 'quality' | 'name-asc';
type LeaveTypeEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-leave-type',
  templateUrl: './leave-type.component.html',
  styleUrls: ['./leave-type.component.css'],
})
export class LeaveTypeComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: LeaveTypeFilter = 'all';
  activeSort: LeaveTypeSort = 'days-desc';
  searchTerm = '';

  modalMode: LeaveTypeEditorMode = 'create';
  activeLeaveTypeId: number = null;

  leaveTypes: LeaveTypeView[] = [];
  filteredLeaveTypes: LeaveTypeView[] = [];
  featuredLeaveType: LeaveTypeView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly leaveTypeForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.leaveTypeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      days: ['', [Validators.required, Validators.maxLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadLeaveTypes();
    super.loadScripts();
  }

  get totalLeaveTypesCount(): number {
    return this.leaveTypes.length;
  }

  get extendedTypesCount(): number {
    return this.leaveTypes.filter((item) => item.extended).length;
  }

  get shortTypesCount(): number {
    return this.leaveTypes.filter((item) => item.short).length;
  }

  get averageDays(): number {
    if (!this.leaveTypes.length) {
      return 0;
    }

    const totalDays = this.leaveTypes.reduce((total, item) => total + item.daysValue, 0);
    return Math.round(totalDays / this.leaveTypes.length);
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredLeaveTypes.length);
    const totalCount = this.formatCount(this.leaveTypes.length);

    return this.filteredLeaveTypes.length === this.leaveTypes.length
      ? filteredCount + ' leave types'
      : filteredCount + ' of ' + totalCount + ' leave types';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create leave type' : 'Edit leave type';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Define a leave policy that HR can reuse consistently across requests and planning.'
      : 'Refine the leave policy label and duration so entitlement tracking stays clear.';
  }

  get draftName(): string {
    return this.normalizeText(this.leaveTypeForm.value.name) || 'Untitled leave type';
  }

  get draftDaysLabel(): string {
    const daysValue = this.toPositiveNumber(this.leaveTypeForm.value.days);
    return daysValue > 0 ? daysValue + ' day' + (daysValue === 1 ? '' : 's') : 'Duration pending';
  }

  get draftQuality(): LeaveTypeQuality {
    return this.evaluateQuality(this.draftName, this.toPositiveNumber(this.leaveTypeForm.value.days));
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: LeaveTypeView): void {
    this.modalMode = 'edit';
    this.activeLeaveTypeId = item.id;
    this.submitted = false;
    this.featuredLeaveType = item;
    this.leaveTypeForm.reset({
      name: item.name,
      days: item.days,
    });
  }

  selectLeaveType(item: LeaveTypeView): void {
    this.featuredLeaveType = item;
  }

  openDetailsModal(item: LeaveTypeView): void {
    this.selectLeaveType(item);

    window.requestAnimationFrame(() => {
      this.showModal('leaveTypeDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: LeaveTypeFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: LeaveTypeSort): void {
    this.activeSort = value || 'days-desc';
    this.applyFilters();
  }

  refreshLeaveTypes(): void {
    this.loadLeaveTypes(true);
  }

  trackByLeaveTypeId(index: number, item: LeaveTypeView): number {
    return item.id || index;
  }

  async saveLeaveType(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.leaveTypeForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeLeaveTypeId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/typeleave/update/' + this.activeLeaveTypeId,
          payload
        );
        super.show('Confirmation', 'Leave type updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/typeleave/create', payload);
        super.show('Confirmation', 'Leave type created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadLeaveTypes();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteLeaveType(item: LeaveTypeView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/typeleave/delete/' + item.id);
      super.show('Confirmation', 'Leave type deleted successfully.', 'success');

      if (this.featuredLeaveType && this.featuredLeaveType.id === item.id) {
        this.featuredLeaveType = null;
      }

      this.loadLeaveTypes();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadLeaveTypes(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/typeleave/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.leaveTypes = this.normalizeLeaveTypes(data);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Leave types refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.leaveTypes = [];
          this.filteredLeaveTypes = [];
          this.featuredLeaveType = null;
          this.loadError = 'Unable to load leave types from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeLeaveTypeId = null;
    this.submitted = false;
    this.saving = false;
    this.leaveTypeForm.reset({
      name: '',
      days: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredLeaveTypes = this.leaveTypes
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.summary.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'extended'
            ? item.extended
            : this.activeFilter === 'short'
            ? item.short
            : !item.extended && !item.short;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'quality') {
          const qualityDifference = right.qualityScore - left.qualityScore;
          return qualityDifference !== 0
            ? qualityDifference
            : left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        const dayDifference = right.daysValue - left.daysValue;
        return dayDifference !== 0 ? dayDifference : left.name.localeCompare(right.name);
      });

    if (!this.filteredLeaveTypes.length) {
      this.featuredLeaveType = null;
      return;
    }

    if (
      !this.featuredLeaveType ||
      !this.filteredLeaveTypes.some((item) => item.id === this.featuredLeaveType.id)
    ) {
      this.featuredLeaveType = this.filteredLeaveTypes[0];
    }
  }

  private normalizeLeaveTypes(data: unknown): LeaveTypeView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toLeaveTypeView(record, index));
  }

  private toLeaveTypeView(record: any, index: number): LeaveTypeView {
    const name = this.normalizeText(record && record.name) || 'Untitled leave type';
    const days = this.normalizeText(record && record.days);
    const daysValue = this.toPositiveNumber(days);
    const quality = this.evaluateQuality(name, daysValue);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      name,
      days,
      daysValue,
      daysLabel: daysValue > 0 ? daysValue + ' day' + (daysValue === 1 ? '' : 's') : 'Duration pending',
      summary: this.buildSummary(name, daysValue),
      extended: daysValue >= 20,
      short: daysValue > 0 && daysValue <= 7,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private buildSummary(name: string, daysValue: number): string {
    if (daysValue > 0) {
      return name + ' policy grants ' + daysValue + ' day' + (daysValue === 1 ? '' : 's') + ' per request or cycle.';
    }

    return 'Add a clear entitlement window so teams know how this leave type should be used.';
  }

  private evaluateQuality(name: string, daysValue: number): LeaveTypeQuality {
    if (name.length > 0 && daysValue > 0) {
      return {
        label: daysValue >= 20 ? 'Strategic' : 'Ready',
        tone: 'strong',
        score: daysValue >= 20 ? 100 : 88,
      };
    }

    if (name.length > 0) {
      return {
        label: 'Needs duration',
        tone: 'warning',
        score: 52,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 16,
    };
  }

  private buildPayload(): { name: string; days: string } | null {
    const name = this.normalizeText(this.leaveTypeForm.value.name);
    const daysValue = this.toPositiveNumber(this.leaveTypeForm.value.days);
    const days = daysValue > 0 ? String(daysValue) : '';

    this.leaveTypeForm.patchValue(
      {
        name,
        days,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.leaveTypeForm.get('name').setErrors({ required: true });
    }

    if (!days) {
      this.leaveTypeForm.get('days').setErrors({ required: true });
    }

    if (this.leaveTypeForm.invalid || !name || !days) {
      return null;
    }

    return {
      name,
      days,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('leaveTypeCrudModalClose');

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

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toPositiveNumber(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : 0;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the leave type request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
