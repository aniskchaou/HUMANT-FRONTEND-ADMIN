import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface JobQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface JobView {
  id: number;
  name: string;
  description: string;
  excerpt: string;
  briefLength: number;
  documented: boolean;
  ready: boolean;
  readinessLabel: JobQuality['label'];
  readinessTone: JobQuality['tone'];
  documentationScore: number;
}

type JobFilter = 'all' | 'ready' | 'needs-attention' | 'missing-brief';
type JobSort = 'quality' | 'name-asc' | 'name-desc';
type JobEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css'],
})
export class JobComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: JobFilter = 'all';
  activeSort: JobSort = 'quality';
  searchTerm = '';

  modalMode: JobEditorMode = 'create';
  activeJobId: number = null;

  jobs: JobView[] = [];
  filteredJobs: JobView[] = [];
  featuredJob: JobView = null;
  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly jobForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.jobForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadJobs();
    super.loadScripts();
  }

  get totalJobsCount(): number {
    return this.jobs.length;
  }

  get documentedJobsCount(): number {
    return this.jobs.filter((job) => job.documented).length;
  }

  get readyJobsCount(): number {
    return this.jobs.filter((job) => job.ready).length;
  }

  get needsAttentionCount(): number {
    return this.jobs.filter((job) => job.documentationScore < 80).length;
  }

  get documentationCoverage(): number {
    return this.toPercent(this.documentedJobsCount, Math.max(this.totalJobsCount, 1));
  }

  get averageBriefLength(): number {
    if (!this.jobs.length) {
      return 0;
    }

    const totalCharacters = this.jobs.reduce(
      (sum, job) => sum + job.briefLength,
      0
    );

    return Math.round(totalCharacters / this.jobs.length);
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredJobs.length);
    const totalCount = this.formatCount(this.jobs.length);

    return this.filteredJobs.length === this.jobs.length
      ? filteredCount + ' roles'
      : filteredCount + ' of ' + totalCount + ' roles';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create role' : 'Edit role';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Write a clear job profile with enough context for hiring and approvals.'
      : 'Refine the role brief and keep the hiring record polished.';
  }

  get draftName(): string {
    return this.normalizeText(this.jobForm.value.name) || 'Untitled role';
  }

  get draftDescription(): string {
    return (
      this.normalizeText(this.jobForm.value.description) ||
      'Add responsibilities, expected outcomes, and team context to make this role publish-ready.'
    );
  }

  get draftDescriptionLength(): number {
    return this.normalizeText(this.jobForm.value.description).length;
  }

  get draftQuality(): JobQuality {
    return this.evaluateDescription(this.normalizeText(this.jobForm.value.description));
  }

  get featuredRecommendation(): string {
    if (!this.featuredJob) {
      return 'Select a role to review its brief quality and recommended next step.';
    }

    if (!this.featuredJob.documented) {
      return 'Add a short brief with responsibilities, team scope, and expected outcomes before sharing this role more widely.';
    }

    if (!this.featuredJob.ready) {
      return 'Expand the description with day-to-day ownership and success measures so recruiters and managers read the same brief.';
    }

    return 'This role has enough detail to support hiring conversations and internal approval reviews.';
  }

  get featuredNextAction(): string {
    if (!this.featuredJob) {
      return 'Create a role or choose one from the list to inspect it here.';
    }

    if (!this.featuredJob.documented) {
      return 'Next action: edit the role and add the first version of the brief.';
    }

    if (!this.featuredJob.ready) {
      return 'Next action: enrich the brief until it covers scope, deliverables, and collaboration.';
    }

    return 'Next action: keep the brief current as responsibilities evolve.';
  }

  get formControls() {
    return this.jobForm.controls;
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.activeJobId = null;
    this.submitted = false;
    this.jobForm.reset({
      name: '',
      description: '',
    });
  }

  openEditModal(job: JobView): void {
    this.modalMode = 'edit';
    this.activeJobId = job.id;
    this.submitted = false;
    this.featuredJob = job;
    this.jobForm.reset({
      name: job.name,
      description: job.description,
    });
  }

  resetEditor(): void {
    this.activeJobId = null;
    this.submitted = false;
    this.saving = false;
    this.jobForm.reset({
      name: '',
      description: '',
    });
  }

  selectJob(job: JobView): void {
    this.featuredJob = job;
  }

  openDetailsModal(job: JobView): void {
    this.selectJob(job);

    window.requestAnimationFrame(() => {
      this.showModal('jobDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: JobFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: JobSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshJobs(): void {
    this.loadJobs(true);
  }

  trackByJobId(index: number, job: JobView): number {
    return job.id || index;
  }

  async saveJob(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeJobId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/job/update/' + this.activeJobId,
          payload
        );
        super.show('Confirmation', 'Job updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/job/create', payload);
        super.show('Confirmation', 'Job created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadJobs();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async delete(job: JobView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + job.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = job.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/job/delete/' + job.id);
      super.show('Confirmation', 'Job deleted successfully.', 'success');

      if (this.featuredJob && this.featuredJob.id === job.id) {
        this.featuredJob = null;
      }

      this.loadJobs();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadJobs(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/job/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.jobs = this.normalizeJobs(data);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Jobs refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.jobs = [];
          this.filteredJobs = [];
          this.featuredJob = null;
          this.loadError = 'Unable to load job records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredJobs = this.jobs
      .filter((job) => {
        const matchesSearch =
          !searchValue ||
          job.name.toLowerCase().includes(searchValue) ||
          job.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'ready'
            ? job.ready
            : this.activeFilter === 'missing-brief'
            ? !job.documented
            : job.documentationScore < 80;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'name-desc') {
          return right.name.localeCompare(left.name);
        }

        const qualityDifference = right.documentationScore - left.documentationScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredJobs.length) {
      this.featuredJob = null;
      return;
    }

    if (
      !this.featuredJob ||
      !this.filteredJobs.some((job) => job.id === this.featuredJob.id)
    ) {
      this.featuredJob = this.filteredJobs[0];
    }
  }

  private normalizeJobs(data: unknown): JobView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toJobView(record, index));
  }

  private toJobView(record: any, index: number): JobView {
    const name = this.normalizeText(record && record.name) || 'Untitled role';
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateDescription(description);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      name,
      description,
      excerpt: this.buildExcerpt(description),
      briefLength: description.length,
      documented: description.length > 0,
      ready: quality.score >= 80,
      readinessLabel: quality.label,
      readinessTone: quality.tone,
      documentationScore: quality.score,
    };
  }

  private buildExcerpt(description: string): string {
    if (!description) {
      return 'No responsibilities or role context yet. Add a brief to make this position ready for hiring and internal review.';
    }

    return description.length > 180
      ? description.slice(0, 177).trim() + '...'
      : description;
  }

  private evaluateDescription(description: string): JobQuality {
    const length = description.length;

    if (length >= 140) {
      return {
        label: 'Ready brief',
        tone: 'strong',
        score: 100,
      };
    }

    if (length >= 80) {
      return {
        label: 'Solid brief',
        tone: 'medium',
        score: 78,
      };
    }

    if (length > 0) {
      return {
        label: 'Needs detail',
        tone: 'warning',
        score: Math.max(24, Math.min(68, length)),
      };
    }

    return {
      label: 'Missing brief',
      tone: 'critical',
      score: 12,
    };
  }

  private buildPayload(): { name: string; description: string } | null {
    const name = this.normalizeText(this.jobForm.value.name);
    const description = this.normalizeText(this.jobForm.value.description);

    this.jobForm.patchValue(
      {
        name,
        description,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.jobForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.jobForm.invalid) {
      return null;
    }

    return {
      name,
      description,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('jobCrudModalClose');

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

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the job request right now.';
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
