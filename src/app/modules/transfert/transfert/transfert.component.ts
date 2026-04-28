import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface TransferReference {
  id: number;
  name: string;
}

interface TransferQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface TransferView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  fromDepartementId: number | null;
  fromDepartementName: string;
  toDepartementId: number | null;
  toDepartementName: string;
  designation: string;
  noticeDate: string;
  noticeDateLabel: string;
  transferDate: string;
  transferDateLabel: string;
  description: string;
  scheduled: boolean;
  completed: boolean;
  summary: string;
  qualityLabel: TransferQuality['label'];
  qualityTone: TransferQuality['tone'];
  qualityScore: number;
  routeLabel: string;
  timelineLabel: string;
}

type TransferFilter = 'all' | 'scheduled' | 'completed' | 'needs-detail';
type TransferSort = 'latest-transfer' | 'employee-asc' | 'quality';
type TransferEditorMode = 'create' | 'edit';
@Component({
  selector: 'app-transfert',
  templateUrl: './transfert.component.html',
  styleUrls: ['./transfert.component.css'],
})
export class TransfertComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: TransferFilter = 'all';
  activeSort: TransferSort = 'latest-transfer';
  searchTerm = '';

  modalMode: TransferEditorMode = 'create';
  activeTransferId: number = null;

  transfers: TransferView[] = [];
  filteredTransfers: TransferView[] = [];
  featuredTransfer: TransferView = null;

  employees: TransferReference[] = [];
  departements: TransferReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly transferForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.transferForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      fromDepartementId: ['', [Validators.required]],
      toDepartementId: ['', [Validators.required]],
      designation: ['', [Validators.maxLength(160)]],
      noticeDate: [''],
      transferDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadTransferWorkspace();
    super.loadScripts();
  }

  get totalTransfersCount(): number {
    return this.transfers.length;
  }

  get scheduledTransfersCount(): number {
    return this.transfers.filter((item) => item.scheduled).length;
  }

  get completedTransfersCount(): number {
    return this.transfers.filter((item) => item.completed).length;
  }

  get documentedTransfersCount(): number {
    return this.transfers.filter((item) => item.description.length > 0).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredTransfers.length);
    const totalCount = this.formatCount(this.transfers.length);

    return this.filteredTransfers.length === this.transfers.length
      ? filteredCount + ' transfers'
      : filteredCount + ' of ' + totalCount + ' transfers';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create transfer' : 'Edit transfer';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Track departmental movement with the employee, handoff timing, and route context in one record.'
      : 'Refine the transfer route and keep the handoff timing visible to operations and HR.';
  }

  get draftEmployeeName(): string {
    return this.lookupOptionName(this.employees, this.transferForm.value.employeeId);
  }

  get draftFromDepartementName(): string {
    return this.lookupOptionName(this.departements, this.transferForm.value.fromDepartementId);
  }

  get draftToDepartementName(): string {
    return this.lookupOptionName(this.departements, this.transferForm.value.toDepartementId);
  }

  get draftQuality(): TransferQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.draftFromDepartementName,
      this.draftToDepartementName,
      this.normalizeText(this.transferForm.value.transferDate),
      this.normalizeText(this.transferForm.value.noticeDate),
      this.normalizeText(this.transferForm.value.designation),
      this.normalizeText(this.transferForm.value.description)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: TransferView): void {
    this.modalMode = 'edit';
    this.activeTransferId = item.id;
    this.submitted = false;
    this.featuredTransfer = item;
    this.transferForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      fromDepartementId: item.fromDepartementId !== null ? String(item.fromDepartementId) : '',
      toDepartementId: item.toDepartementId !== null ? String(item.toDepartementId) : '',
      designation: item.designation,
      noticeDate: item.noticeDate,
      transferDate: item.transferDate,
      description: item.description,
    });
  }

  selectTransfer(item: TransferView): void {
    this.featuredTransfer = item;
  }

  openDetailsModal(item: TransferView): void {
    this.selectTransfer(item);

    window.requestAnimationFrame(() => {
      this.showModal('transferDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: TransferFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: TransferSort): void {
    this.activeSort = value || 'latest-transfer';
    this.applyFilters();
  }

  refreshTransfers(): void {
    this.loadTransferWorkspace(true);
  }

  trackByTransferId(index: number, item: TransferView): number {
    return item.id || index;
  }

  async saveTransfer(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.transferForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeTransferId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/transfer/update/' + this.activeTransferId,
          payload
        );
        super.show('Confirmation', 'Transfer updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/transfer/create', payload);
        super.show('Confirmation', 'Transfer created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadTransferWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteTransfer(item: TransferView): Promise<void> {
    const confirmed = confirm(
      'Delete the transfer for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/transfer/delete/' + item.id);
      super.show('Confirmation', 'Transfer deleted successfully.', 'success');

      if (this.featuredTransfer && this.featuredTransfer.id === item.id) {
        this.featuredTransfer = null;
      }

      this.loadTransferWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadTransferWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      transfers: this.httpService.getAll(CONFIG.URL_BASE + '/transfer/all'),
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([]))),
      departements: this.httpService.getAll(CONFIG.URL_BASE + '/departement/all').pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployeeOptions(result.employees);
          this.departements = this.normalizeNamedOptions(result.departements);
          this.transfers = this.normalizeTransfers(result.transfers);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Transfers refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.transfers = [];
          this.filteredTransfers = [];
          this.featuredTransfer = null;
          this.loadError = 'Unable to load transfer records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeTransferId = null;
    this.submitted = false;
    this.saving = false;
    this.transferForm.reset({
      employeeId: '',
      fromDepartementId: '',
      toDepartementId: '',
      designation: '',
      noticeDate: '',
      transferDate: '',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredTransfers = this.transfers
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.fromDepartementName.toLowerCase().includes(searchValue) ||
          item.toDepartementName.toLowerCase().includes(searchValue) ||
          item.designation.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'scheduled'
            ? item.scheduled
            : this.activeFilter === 'completed'
            ? item.completed
            : !item.description;

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
            : left.employeeName.localeCompare(right.employeeName);
        }

        return this.toDateValue(right.transferDate) - this.toDateValue(left.transferDate);
      });

    if (!this.filteredTransfers.length) {
      this.featuredTransfer = null;
      return;
    }

    if (!this.featuredTransfer || !this.filteredTransfers.some((item) => item.id === this.featuredTransfer.id)) {
      this.featuredTransfer = this.filteredTransfers[0];
    }
  }

  private normalizeEmployeeOptions(data: unknown): TransferReference[] {
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

  private normalizeNamedOptions(data: unknown): TransferReference[] {
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

  private normalizeTransfers(data: unknown): TransferView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toTransferView(record, index));
  }

  private toTransferView(record: any, index: number): TransferView {
    const employeeName = this.normalizeText(record && record.employeeName && record.employeeName.fullName);
    const employeeId = this.toNumericId(record && record.employeeName && record.employeeName.id);
    const fromDepartementName = this.normalizeText(record && record.departementFrom && record.departementFrom.name);
    const fromDepartementId = this.toNumericId(record && record.departementFrom && record.departementFrom.id);
    const toDepartementName = this.normalizeText(record && record.departementTo && record.departementTo.name);
    const toDepartementId = this.toNumericId(record && record.departementTo && record.departementTo.id);
    const designation = this.normalizeText(record && record.designation);
    const noticeDate = this.normalizeText(record && record.noticeDate);
    const transferDate = this.normalizeText(record && record.transferDate);
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateQuality(
      employeeName,
      fromDepartementName,
      toDepartementName,
      transferDate,
      noticeDate,
      designation,
      description
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      fromDepartementId,
      fromDepartementName,
      toDepartementId,
      toDepartementName,
      designation,
      noticeDate,
      noticeDateLabel: this.formatDateLabel(noticeDate),
      transferDate,
      transferDateLabel: this.formatDateLabel(transferDate),
      description,
      scheduled: this.isUpcomingDate(transferDate),
      completed: this.isCompletedDate(transferDate),
      summary: this.buildSummary(employeeName, fromDepartementName, toDepartementName, description),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      routeLabel: [fromDepartementName, toDepartementName].filter(Boolean).join(' → ') || 'Route pending',
      timelineLabel: this.buildTimelineLabel(transferDate),
    };
  }

  private buildSummary(
    employeeName: string,
    fromDepartementName: string,
    toDepartementName: string,
    description: string
  ): string {
    if (description) {
      return description;
    }

    return [employeeName, fromDepartementName && toDepartementName ? fromDepartementName + ' → ' + toDepartementName : ''].filter(Boolean).join(' • ') || 'Add transfer context so teams can coordinate the handoff.';
  }

  private evaluateQuality(
    employeeName: string,
    fromDepartementName: string,
    toDepartementName: string,
    transferDate: string,
    noticeDate: string,
    designation: string,
    description: string
  ): TransferQuality {
    const coverage = [employeeName, fromDepartementName, toDepartementName, transferDate, designation || description].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 5 && noticeDate.length > 0 && description.length > 0) {
      return { label: 'Ready', tone: 'strong', score: 100 };
    }

    if (coverage >= 4) {
      return { label: 'Solid', tone: 'medium', score: 84 };
    }

    if (coverage >= 3) {
      return { label: 'Needs detail', tone: 'warning', score: 58 };
    }

    return { label: 'Incomplete', tone: 'critical', score: 16 };
  }

  private buildTimelineLabel(transferDate: string): string {
    if (this.isUpcomingDate(transferDate)) {
      return 'Moves on ' + this.formatDateLabel(transferDate);
    }

    if (this.isCompletedDate(transferDate)) {
      return 'Moved on ' + this.formatDateLabel(transferDate);
    }

    return 'Transfer date pending';
  }

  private buildPayload(): {
    employeeName: { id: number };
    departementFrom: { id: number };
    departementTo: { id: number };
    designation: string;
    noticeDate: string;
    transferDate: string;
    description: string;
  } | null {
    const employeeId = this.toNumericId(this.transferForm.value.employeeId);
    const fromDepartementId = this.toNumericId(this.transferForm.value.fromDepartementId);
    const toDepartementId = this.toNumericId(this.transferForm.value.toDepartementId);
    const designation = this.normalizeText(this.transferForm.value.designation);
    const noticeDate = this.normalizeText(this.transferForm.value.noticeDate);
    const transferDate = this.normalizeText(this.transferForm.value.transferDate);
    const description = this.normalizeText(this.transferForm.value.description);

    this.transferForm.patchValue(
      {
        employeeId: employeeId !== null ? String(employeeId) : '',
        fromDepartementId: fromDepartementId !== null ? String(fromDepartementId) : '',
        toDepartementId: toDepartementId !== null ? String(toDepartementId) : '',
        designation,
        noticeDate,
        transferDate,
        description,
      },
      { emitEvent: false }
    );

    if (employeeId === null) {
      this.transferForm.get('employeeId').setErrors({ required: true });
    }

    if (fromDepartementId === null) {
      this.transferForm.get('fromDepartementId').setErrors({ required: true });
    }

    if (toDepartementId === null) {
      this.transferForm.get('toDepartementId').setErrors({ required: true });
    }

    if (!transferDate) {
      this.transferForm.get('transferDate').setErrors({ required: true });
    }

    if (
      this.transferForm.invalid ||
      employeeId === null ||
      fromDepartementId === null ||
      toDepartementId === null ||
      !transferDate
    ) {
      return null;
    }

    return {
      employeeName: { id: employeeId },
      departementFrom: { id: fromDepartementId },
      departementTo: { id: toDepartementId },
      designation,
      noticeDate,
      transferDate,
      description,
    };
  }

  private lookupOptionName(options: TransferReference[], value: unknown): string {
    const targetId = this.toNumericId(value);
    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('transferCrudModalClose');

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

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private toDateValue(value: string): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const timestamp = Date.parse(value.length === 10 ? value + 'T00:00:00' : value);
    return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
  }

  private formatDateLabel(value: string): string {
    if (!value) {
      return 'Date not set';
    }

    const parsedDate = new Date(value.length === 10 ? value + 'T00:00:00' : value);
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

  private isUpcomingDate(value: string): boolean {
    return !!value && this.toDateValue(value) > this.startOfToday();
  }

  private isCompletedDate(value: string): boolean {
    return !!value && this.toDateValue(value) <= this.startOfToday();
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the transfer request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
