import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface NoticeQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface NoticeView {
  id: number;
  noticeTitle: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  noticeNote: string;
  active: boolean;
  upcoming: boolean;
  expired: boolean;
  summary: string;
  qualityLabel: NoticeQuality['label'];
  qualityTone: NoticeQuality['tone'];
  qualityScore: number;
  timelineLabel: string;
}

type NoticeFilter = 'all' | 'active' | 'upcoming' | 'expired' | 'needs-note';
type NoticeSort = 'latest-start' | 'quality' | 'title-asc';
type NoticeEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css'],
})
export class NoticeComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: NoticeFilter = 'all';
  activeSort: NoticeSort = 'latest-start';
  searchTerm = '';

  modalMode: NoticeEditorMode = 'create';
  activeNoticeId: number = null;

  notices: NoticeView[] = [];
  filteredNotices: NoticeView[] = [];
  featuredNotice: NoticeView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly noticeForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.noticeForm = this.formBuilder.group({
      noticeTitle: ['', [Validators.required, Validators.maxLength(160)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      noticeNote: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadNotices();
    this.loadScripts();
  }

  get totalNoticesCount(): number {
    return this.notices.length;
  }

  get activeNoticesCount(): number {
    return this.notices.filter((item) => item.active).length;
  }

  get upcomingNoticesCount(): number {
    return this.notices.filter((item) => item.upcoming).length;
  }

  get documentedNoticesCount(): number {
    return this.notices.filter((item) => item.noticeNote.length > 0).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredNotices.length);
    const totalCount = this.formatCount(this.notices.length);

    return this.filteredNotices.length === this.notices.length
      ? filteredCount + ' notices'
      : filteredCount + ' of ' + totalCount + ' notices';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create notice' : 'Edit notice';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Publish a notice with clear timing and message context so teams know what action to take.'
      : 'Update the notice timing and message so internal communication stays current.';
  }

  get draftTitle(): string {
    return this.normalizeText(this.noticeForm.value.noticeTitle) || 'Untitled notice';
  }

  get draftQuality(): NoticeQuality {
    return this.evaluateQuality(
      this.draftTitle,
      this.normalizeText(this.noticeForm.value.startDate),
      this.normalizeText(this.noticeForm.value.endDate),
      this.normalizeText(this.noticeForm.value.noticeNote)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: NoticeView): void {
    this.modalMode = 'edit';
    this.activeNoticeId = item.id;
    this.submitted = false;
    this.featuredNotice = item;
    this.noticeForm.reset({
      noticeTitle: item.noticeTitle,
      startDate: item.startDate,
      endDate: item.endDate,
      noticeNote: item.noticeNote,
    });
  }

  selectNotice(item: NoticeView): void {
    this.featuredNotice = item;
  }

  openDetailsModal(item: NoticeView): void {
    this.selectNotice(item);

    window.requestAnimationFrame(() => {
      this.showModal('noticeDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: NoticeFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: NoticeSort): void {
    this.activeSort = value || 'latest-start';
    this.applyFilters();
  }

  refreshNotices(): void {
    this.loadNotices(true);
  }

  trackByNoticeId(index: number, item: NoticeView): number {
    return item.id || index;
  }

  async saveNotice(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.noticeForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeNoticeId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/notice/update/' + this.activeNoticeId,
          payload
        );
        super.show('Confirmation', 'Notice updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/notice/create', payload);
        super.show('Confirmation', 'Notice created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadNotices();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteNotice(item: NoticeView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.noticeTitle + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/notice/delete/' + item.id);
      super.show('Confirmation', 'Notice deleted successfully.', 'success');

      if (this.featuredNotice && this.featuredNotice.id === item.id) {
        this.featuredNotice = null;
      }

      this.loadNotices();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadNotices(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/notice/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.notices = this.normalizeNotices(data);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Notices refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.notices = [];
          this.filteredNotices = [];
          this.featuredNotice = null;
          this.loadError = 'Unable to load notices from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeNoticeId = null;
    this.submitted = false;
    this.saving = false;
    this.noticeForm.reset({
      noticeTitle: '',
      startDate: '',
      endDate: '',
      noticeNote: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredNotices = this.notices
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.noticeTitle.toLowerCase().includes(searchValue) ||
          item.noticeNote.toLowerCase().includes(searchValue) ||
          item.summary.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'active'
            ? item.active
            : this.activeFilter === 'upcoming'
            ? item.upcoming
            : this.activeFilter === 'expired'
            ? item.expired
            : !item.noticeNote;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'quality') {
          const qualityDifference = right.qualityScore - left.qualityScore;
          return qualityDifference !== 0
            ? qualityDifference
            : left.noticeTitle.localeCompare(right.noticeTitle);
        }

        if (this.activeSort === 'title-asc') {
          return left.noticeTitle.localeCompare(right.noticeTitle);
        }

        return this.toDateValue(right.startDate) - this.toDateValue(left.startDate);
      });

    if (!this.filteredNotices.length) {
      this.featuredNotice = null;
      return;
    }

    if (
      !this.featuredNotice ||
      !this.filteredNotices.some((item) => item.id === this.featuredNotice.id)
    ) {
      this.featuredNotice = this.filteredNotices[0];
    }
  }

  private normalizeNotices(data: unknown): NoticeView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toNoticeView(record, index));
  }

  private toNoticeView(record: any, index: number): NoticeView {
    const noticeTitle = this.normalizeText(record && record.noticeTitle) || 'Untitled notice';
    const startDate = this.normalizeText(record && record.startDate);
    const endDate = this.normalizeText(record && record.endDate);
    const noticeNote = this.normalizeText(record && record.noticeNote);
    const quality = this.evaluateQuality(noticeTitle, startDate, endDate, noticeNote);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      noticeTitle,
      startDate,
      startDateLabel: this.formatDateLabel(startDate),
      endDate,
      endDateLabel: this.formatDateLabel(endDate),
      noticeNote,
      active: this.isActiveNotice(startDate, endDate),
      upcoming: this.isUpcomingNotice(startDate),
      expired: this.isExpiredNotice(endDate),
      summary: noticeNote || this.buildTimelineLabel(startDate, endDate),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      timelineLabel: this.buildTimelineLabel(startDate, endDate),
    };
  }

  private evaluateQuality(
    noticeTitle: string,
    startDate: string,
    endDate: string,
    noticeNote: string
  ): NoticeQuality {
    const coverage = [noticeTitle, startDate, endDate, noticeNote].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 4) {
      return { label: 'Ready', tone: 'strong', score: 100 };
    }

    if (coverage >= 3) {
      return { label: 'Solid', tone: 'medium', score: 82 };
    }

    if (coverage >= 2) {
      return { label: 'Needs detail', tone: 'warning', score: 58 };
    }

    return { label: 'Incomplete', tone: 'critical', score: 16 };
  }

  private buildTimelineLabel(startDate: string, endDate: string): string {
    if (this.isActiveNotice(startDate, endDate)) {
      return 'Active until ' + this.formatDateLabel(endDate);
    }

    if (this.isUpcomingNotice(startDate)) {
      return 'Starts on ' + this.formatDateLabel(startDate);
    }

    if (this.isExpiredNotice(endDate)) {
      return 'Closed on ' + this.formatDateLabel(endDate);
    }

    return 'Schedule pending';
  }

  private buildPayload(): {
    noticeTitle: string;
    startDate: string;
    endDate: string;
    noticeNote: string;
  } | null {
    const noticeTitle = this.normalizeText(this.noticeForm.value.noticeTitle);
    const startDate = this.normalizeText(this.noticeForm.value.startDate);
    const endDate = this.normalizeText(this.noticeForm.value.endDate);
    const noticeNote = this.normalizeText(this.noticeForm.value.noticeNote);

    this.noticeForm.patchValue(
      {
        noticeTitle,
        startDate,
        endDate,
        noticeNote,
      },
      { emitEvent: false }
    );

    if (!noticeTitle) {
      this.noticeForm.get('noticeTitle').setErrors({ required: true });
    }

    if (!startDate) {
      this.noticeForm.get('startDate').setErrors({ required: true });
    }

    if (!endDate) {
      this.noticeForm.get('endDate').setErrors({ required: true });
    }

    if (this.noticeForm.invalid || !noticeTitle || !startDate || !endDate) {
      return null;
    }

    return {
      noticeTitle,
      startDate,
      endDate,
      noticeNote,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('noticeCrudModalClose');

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

  private isActiveNotice(startDate: string, endDate: string): boolean {
    const today = this.startOfToday();
    return this.toDateValue(startDate) <= today && today <= this.toDateValue(endDate);
  }

  private isUpcomingNotice(startDate: string): boolean {
    return !!startDate && this.toDateValue(startDate) > this.startOfToday();
  }

  private isExpiredNotice(endDate: string): boolean {
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

    return 'Unable to complete the notice request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
