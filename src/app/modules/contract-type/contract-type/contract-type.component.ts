import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface ContractTypeQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface ContractTypeView {
  id: number;
  name: string;
  usageCount: number;
  inUse: boolean;
  alternative: boolean;
  summary: string;
  qualityLabel: ContractTypeQuality['label'];
  qualityTone: ContractTypeQuality['tone'];
  qualityScore: number;
}

type ContractTypeFilter = 'all' | 'in-use' | 'unused' | 'alternative';
type ContractTypeSort = 'quality' | 'name-asc' | 'usage-desc';
type ContractTypeEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-contract-type',
  templateUrl: './contract-type.component.html',
  styleUrls: ['./contract-type.component.css'],
})
export class ContractTypeComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: ContractTypeFilter = 'all';
  activeSort: ContractTypeSort = 'quality';
  searchTerm = '';

  modalMode: ContractTypeEditorMode = 'create';
  activeContractTypeId: number = null;

  contractTypes: ContractTypeView[] = [];
  filteredContractTypes: ContractTypeView[] = [];
  featuredContractType: ContractTypeView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly contractTypeForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.contractTypeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  ngOnInit(): void {
    this.loadContractTypeWorkspace();
    super.loadScripts();
  }

  get totalContractTypesCount(): number {
    return this.contractTypes.length;
  }

  get activeContractTypesCount(): number {
    return this.contractTypes.filter((item) => item.inUse).length;
  }

  get unusedContractTypesCount(): number {
    return this.contractTypes.filter((item) => !item.inUse).length;
  }

  get alternativeContractTypesCount(): number {
    return this.contractTypes.filter((item) => item.alternative).length;
  }

  get activeCoverage(): number {
    return this.toPercent(
      this.activeContractTypesCount,
      Math.max(this.totalContractTypesCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredContractTypes.length);
    const totalCount = this.formatCount(this.contractTypes.length);

    return this.filteredContractTypes.length === this.contractTypes.length
      ? filteredCount + ' contract types'
      : filteredCount + ' of ' + totalCount + ' contract types';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create contract type' : 'Edit contract type';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Add a reusable agreement model for hiring and employment records.'
      : 'Refine the contract type library and keep naming consistent.';
  }

  get draftName(): string {
    return this.normalizeText(this.contractTypeForm.value.name) || 'Untitled contract type';
  }

  get draftQuality(): ContractTypeQuality {
    return this.evaluateQuality(this.draftName, 0);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: ContractTypeView): void {
    this.modalMode = 'edit';
    this.activeContractTypeId = item.id;
    this.submitted = false;
    this.featuredContractType = item;
    this.contractTypeForm.reset({
      name: item.name,
    });
  }

  selectContractType(item: ContractTypeView): void {
    this.featuredContractType = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: ContractTypeFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: ContractTypeSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshContractTypes(): void {
    this.loadContractTypeWorkspace(true);
  }

  trackByContractTypeId(index: number, item: ContractTypeView): number {
    return item.id || index;
  }

  async saveContractType(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.contractTypeForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeContractTypeId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/contracttype/update/' + this.activeContractTypeId,
          payload
        );
        super.show('Confirmation', 'Contract type updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/contracttype/create', payload);
        super.show('Confirmation', 'Contract type created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadContractTypeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteContractType(item: ContractTypeView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/contracttype/delete/' + item.id
      );
      super.show('Confirmation', 'Contract type deleted successfully.', 'success');

      if (
        this.featuredContractType &&
        this.featuredContractType.id === item.id
      ) {
        this.featuredContractType = null;
      }

      this.loadContractTypeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadContractTypeWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      contractTypes: this.httpService.getAll(CONFIG.URL_BASE + '/contracttype/all'),
      contracts: this.httpService
        .getAll(CONFIG.URL_BASE + '/contract/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.contractTypes = this.normalizeContractTypes(
            result.contractTypes,
            result.contracts
          );
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Contract types refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.contractTypes = [];
          this.filteredContractTypes = [];
          this.featuredContractType = null;
          this.loadError = 'Unable to load contract type records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeContractTypeId = null;
    this.submitted = false;
    this.saving = false;
    this.contractTypeForm.reset({
      name: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredContractTypes = this.contractTypes
      .filter((item) => {
        const matchesSearch =
          !searchValue || item.name.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'in-use'
            ? item.inUse
            : this.activeFilter === 'unused'
            ? !item.inUse
            : item.alternative;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'usage-desc') {
          return right.usageCount - left.usageCount;
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredContractTypes.length) {
      this.featuredContractType = null;
      return;
    }

    if (
      !this.featuredContractType ||
      !this.filteredContractTypes.some(
        (item) => item.id === this.featuredContractType.id
      )
    ) {
      this.featuredContractType = this.filteredContractTypes[0];
    }
  }

  private normalizeContractTypes(
    contractTypes: unknown,
    contracts: unknown
  ): ContractTypeView[] {
    if (!Array.isArray(contractTypes)) {
      return [];
    }

    const usageMap = this.buildUsageMap(contracts);

    return contractTypes
      .filter((record) => this.normalizeText(record && record.name).length > 0)
      .map((record, index) => this.toContractTypeView(record, usageMap, index));
  }

  private toContractTypeView(
    record: any,
    usageMap: { [key: number]: number },
    index: number
  ): ContractTypeView {
    const name = this.normalizeText(record && record.name) || 'Untitled contract type';
    const numericId = Number(record && record.id);
    const id = Number.isFinite(numericId) ? numericId : index + 1;
    const usageCount = usageMap[id] || 0;
    const quality = this.evaluateQuality(name, usageCount);
    const lowerName = name.toLowerCase();
    const alternative =
      lowerName.includes('fixed') ||
      lowerName.includes('intern') ||
      lowerName.includes('consult') ||
      lowerName.includes('part');

    return {
      id,
      name,
      usageCount,
      inUse: usageCount > 0,
      alternative,
      summary:
        usageCount > 0
          ? 'Currently used by ' + usageCount + ' contract' + (usageCount === 1 ? '' : 's') + '.'
          : 'No contracts currently reference this agreement model.',
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private evaluateQuality(
    name: string,
    usageCount: number
  ): ContractTypeQuality {
    if (usageCount > 0) {
      return {
        label: 'Active',
        tone: 'strong',
        score: 100,
      };
    }

    if (name) {
      return {
        label: 'Ready',
        tone: 'medium',
        score: 76,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 14,
    };
  }

  private buildUsageMap(contracts: unknown): { [key: number]: number } {
    const usageMap: { [key: number]: number } = {};

    if (!Array.isArray(contracts)) {
      return usageMap;
    }

    contracts.forEach((record) => {
      const contractTypeId = Number(
        record && record.contractType && record.contractType.id
      );

      if (Number.isFinite(contractTypeId)) {
        usageMap[contractTypeId] = (usageMap[contractTypeId] || 0) + 1;
      }
    });

    return usageMap;
  }

  private buildPayload(): { name: string } | null {
    const name = this.normalizeText(this.contractTypeForm.value.name);

    this.contractTypeForm.patchValue(
      {
        name,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.contractTypeForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.contractTypeForm.invalid) {
      return null;
    }

    return {
      name,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('contractTypeCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the contract type request right now.';
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
