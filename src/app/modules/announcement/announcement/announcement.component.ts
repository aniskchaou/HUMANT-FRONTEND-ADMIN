import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface AnnouncementReference {
  id: number;
  name: string;
}

interface AnnouncementQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface AnnouncementView {
  id: number;
  title: string;
  departmentId: number | null;
  departmentName: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  attachment: string;
  summary: string;
  description: string;
  active: boolean;
  upcoming: boolean;
  expired: boolean;
  hasAttachment: boolean;
  qualityLabel: AnnouncementQuality['label'];
  qualityTone: AnnouncementQuality['tone'];
  qualityScore: number;
  timelineLabel: string;
}

type AnnouncementFilter =
  | 'all'
  | 'active'
  | 'upcoming'
  | 'expired'
  | 'needs-attachment';
type AnnouncementSort = 'quality' | 'latest-start' | 'title-asc';
type AnnouncementEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css'],
})
export class AnnouncementComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: AnnouncementFilter = 'all';
  activeSort: AnnouncementSort = 'quality';
  searchTerm = '';

  modalMode: AnnouncementEditorMode = 'create';
  activeAnnouncementId: number = null;

  announcements: AnnouncementView[] = [];
  filteredAnnouncements: AnnouncementView[] = [];
  featuredAnnouncement: AnnouncementView = null;

  departements: AnnouncementReference[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly announcementForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.announcementForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(160)]],
      departmentId: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      attachment: ['', [Validators.maxLength(240)]],
      summary: ['', [Validators.maxLength(240)]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadAnnouncementWorkspace();
    super.loadScripts();
  }

  get totalAnnouncementsCount(): number {
    return this.announcements.length;
  }

  get activeAnnouncementsCount(): number {
    return this.announcements.filter((item) => item.active).length;
  }

  get upcomingAnnouncementsCount(): number {
    return this.announcements.filter((item) => item.upcoming).length;
  }

  get attachmentCount(): number {
    return this.announcements.filter((item) => item.hasAttachment).length;
  }

  get documentedAnnouncementsCount(): number {
    return this.announcements.filter(
      (item) => item.summary.length > 0 || item.description.length > 0
    ).length;
  }

  get documentationCoverage(): number {
    return this.toPercent(
      this.documentedAnnouncementsCount,
      Math.max(this.totalAnnouncementsCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredAnnouncements.length);
    const totalCount = this.formatCount(this.announcements.length);

    return this.filteredAnnouncements.length === this.announcements.length
      ? filteredCount + ' announcements'
      : filteredCount + ' of ' + totalCount + ' announcements';
  }

  get modalTitle(): string {
    return this.modalMode === 'create'
      ? 'Create announcement'
      : 'Edit announcement';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Publish a clear announcement with dates, department context, and supporting references.'
      : 'Refine the announcement and keep communication timing, scope, and context up to date.';
  }

  get draftTitle(): string {
    return this.normalizeText(this.announcementForm.value.title) || 'Untitled announcement';
  }

  get draftDepartmentName(): string {
    return this.lookupOptionName(
      this.departements,
      this.announcementForm.value.departmentId
    );
  }

  get draftQuality(): AnnouncementQuality {
    return this.evaluateQuality(
      this.draftTitle,
      this.draftDepartmentName,
      this.normalizeText(this.announcementForm.value.startDate),
      this.normalizeText(this.announcementForm.value.endDate),
      this.normalizeText(this.announcementForm.value.summary),
      this.normalizeText(this.announcementForm.value.description),
      this.normalizeText(this.announcementForm.value.attachment)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: AnnouncementView): void {
    this.modalMode = 'edit';
    this.activeAnnouncementId = item.id;
    this.submitted = false;
    this.featuredAnnouncement = item;
    this.announcementForm.reset({
      title: item.title,
      departmentId: item.departmentId !== null ? String(item.departmentId) : '',
      startDate: item.startDate,
      endDate: item.endDate,
      attachment: item.attachment,
      summary: item.summary,
      description: item.description,
    });
  }

  selectAnnouncement(item: AnnouncementView): void {
    this.featuredAnnouncement = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: AnnouncementFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: AnnouncementSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshAnnouncements(): void {
    this.loadAnnouncementWorkspace(true);
  }

  trackByAnnouncementId(index: number, item: AnnouncementView): number {
    return item.id || index;
  }

  async saveAnnouncement(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeAnnouncementId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/announcement/update/' + this.activeAnnouncementId,
          payload
        );
        super.show('Confirmation', 'Announcement updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/announcement/create', payload);
        super.show('Confirmation', 'Announcement created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadAnnouncementWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteAnnouncement(item: AnnouncementView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.title + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/announcement/delete/' + item.id
      );
      super.show('Confirmation', 'Announcement deleted successfully.', 'success');

      if (this.featuredAnnouncement && this.featuredAnnouncement.id === item.id) {
        this.featuredAnnouncement = null;
      }

      this.loadAnnouncementWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadAnnouncementWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      announcements: this.httpService.getAll(CONFIG.URL_BASE + '/announcement/all'),
      departements: this.httpService
        .getAll(CONFIG.URL_BASE + '/departement/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.departements = this.normalizeNamedOptions(result.departements);
          this.announcements = this.normalizeAnnouncements(result.announcements);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Announcements refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.announcements = [];
          this.filteredAnnouncements = [];
          this.featuredAnnouncement = null;
          this.loadError = 'Unable to load announcements from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeAnnouncementId = null;
    this.submitted = false;
    this.saving = false;
    this.announcementForm.reset({
      title: '',
      departmentId: '',
      startDate: '',
      endDate: '',
      attachment: '',
      summary: '',
      description: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredAnnouncements = this.announcements
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.title.toLowerCase().includes(searchValue) ||
          item.departmentName.toLowerCase().includes(searchValue) ||
          item.summary.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'active'
            ? item.active
            : this.activeFilter === 'upcoming'
            ? item.upcoming
            : this.activeFilter === 'expired'
            ? item.expired
            : !item.hasAttachment;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'latest-start') {
          return this.toDateValue(right.startDate) - this.toDateValue(left.startDate);
        }

        if (this.activeSort === 'title-asc') {
          return left.title.localeCompare(right.title);
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.title.localeCompare(right.title);
      });

    if (!this.filteredAnnouncements.length) {
      this.featuredAnnouncement = null;
      return;
    }

    if (
      !this.featuredAnnouncement ||
      !this.filteredAnnouncements.some(
        (item) => item.id === this.featuredAnnouncement.id
      )
    ) {
      this.featuredAnnouncement = this.filteredAnnouncements[0];
    }
  }

  private normalizeNamedOptions(data: unknown): AnnouncementReference[] {
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

  private normalizeAnnouncements(data: unknown): AnnouncementView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.normalizeText(record && record.title).length > 0)
      .map((record, index) => this.toAnnouncementView(record, index));
  }

  private toAnnouncementView(record: any, index: number): AnnouncementView {
    const title = this.normalizeText(record && record.title) || 'Untitled announcement';
    const departmentName = this.normalizeText(
      record && record.department && record.department.name
    );
    const departmentId = this.toNumericId(record && record.department && record.department.id);
    const startDate = this.normalizeText(record && record.startDate);
    const endDate = this.normalizeText(record && record.endDate);
    const attachment = this.normalizeText(record && record.attachment);
    const summary = this.normalizeText(record && record.summary);
    const description = this.normalizeText(record && record.description);
    const quality = this.evaluateQuality(
      title,
      departmentName,
      startDate,
      endDate,
      summary,
      description,
      attachment
    );
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      title,
      departmentId,
      departmentName,
      startDate,
      startDateLabel: this.formatDateLabel(startDate),
      endDate,
      endDateLabel: this.formatDateLabel(endDate),
      attachment,
      summary,
      description,
      active: this.isActiveAnnouncement(startDate, endDate),
      upcoming: this.isUpcomingAnnouncement(startDate),
      expired: this.isExpiredAnnouncement(endDate),
      hasAttachment: attachment.length > 0,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      timelineLabel: this.buildTimelineLabel(startDate, endDate),
    };
  }

  private evaluateQuality(
    title: string,
    departmentName: string,
    startDate: string,
    endDate: string,
    summary: string,
    description: string,
    attachment: string
  ): AnnouncementQuality {
    const coverage = [title, departmentName, startDate, endDate, summary || description].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 5 && attachment.length > 0 && description.length >= 50) {
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
    if (this.isActiveAnnouncement(startDate, endDate)) {
      return 'Live until ' + this.formatDateLabel(endDate);
    }

    if (this.isUpcomingAnnouncement(startDate)) {
      return 'Starts on ' + this.formatDateLabel(startDate);
    }

    if (this.isExpiredAnnouncement(endDate)) {
      return 'Closed on ' + this.formatDateLabel(endDate);
    }

    if (startDate) {
      return 'Scheduled for ' + this.formatDateLabel(startDate);
    }

    return 'Publish window pending';
  }

  private buildPayload(): {
    title: string;
    department: { id: number } | null;
    startDate: string;
    endDate: string;
    attachment: string;
    summary: string;
    description: string;
  } | null {
    const title = this.normalizeText(this.announcementForm.value.title);
    const departmentId = this.toNumericId(this.announcementForm.value.departmentId);
    const startDate = this.normalizeText(this.announcementForm.value.startDate);
    const endDate = this.normalizeText(this.announcementForm.value.endDate);
    const attachment = this.normalizeText(this.announcementForm.value.attachment);
    const summary = this.normalizeText(this.announcementForm.value.summary);
    const description = this.normalizeText(this.announcementForm.value.description);

    this.announcementForm.patchValue(
      {
        title,
        departmentId: departmentId !== null ? String(departmentId) : '',
        startDate,
        endDate,
        attachment,
        summary,
        description,
      },
      { emitEvent: false }
    );

    if (!title) {
      this.announcementForm.get('title').setErrors({ required: true });
    }

    if (!startDate) {
      this.announcementForm.get('startDate').setErrors({ required: true });
    }

    if (!endDate) {
      this.announcementForm.get('endDate').setErrors({ required: true });
    }

    if (this.announcementForm.invalid || !title || !startDate || !endDate) {
      return null;
    }

    return {
      title,
      department: departmentId !== null ? { id: departmentId } : null,
      startDate,
      endDate,
      attachment,
      summary,
      description,
    };
  }

  private lookupOptionName(options: AnnouncementReference[], value: unknown): string {
    const targetId = this.toNumericId(value);

    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('announcementCrudModalClose');

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

  private isActiveAnnouncement(startDate: string, endDate: string): boolean {
    const today = this.startOfToday();
    const startValue = this.toDateValue(startDate);
    const endValue = this.toDateValue(endDate);

    return startValue <= today && today <= endValue;
  }

  private isUpcomingAnnouncement(startDate: string): boolean {
    return !!startDate && this.toDateValue(startDate) > this.startOfToday();
  }

  private isExpiredAnnouncement(endDate: string): boolean {
    return !!endDate && this.toDateValue(endDate) < this.startOfToday();
  }

  private startOfToday(): number {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the announcement request right now.';
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
