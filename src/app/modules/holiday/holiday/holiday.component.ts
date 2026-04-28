import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface HolidayQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface HolidayView {
  id: number;
  name: string;
  date: string;
  dateLabel: string;
  recurring: boolean;
  upcoming: boolean;
  past: boolean;
  summary: string;
  qualityLabel: HolidayQuality['label'];
  qualityTone: HolidayQuality['tone'];
  qualityScore: number;
  relativeLabel: string;
}

type HolidayFilter = 'all' | 'upcoming' | 'recurring' | 'past';
type HolidaySort = 'nearest' | 'latest' | 'name-asc';
type HolidayEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.css'],
})
export class HolidayComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: HolidayFilter = 'all';
  activeSort: HolidaySort = 'nearest';
  searchTerm = '';

  modalMode: HolidayEditorMode = 'create';
  activeHolidayId: number = null;

  holidays: HolidayView[] = [];
  filteredHolidays: HolidayView[] = [];
  featuredHoliday: HolidayView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly holidayForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.holidayForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(160)]],
      date: ['', [Validators.required]],
      recurring: [false],
    });
  }

  ngOnInit(): void {
    this.loadHolidays();
    super.loadScripts();
  }

  get totalHolidaysCount(): number {
    return this.holidays.length;
  }

  get upcomingHolidaysCount(): number {
    return this.holidays.filter((item) => item.upcoming).length;
  }

  get recurringHolidaysCount(): number {
    return this.holidays.filter((item) => item.recurring).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredHolidays.length);
    const totalCount = this.formatCount(this.holidays.length);

    return this.filteredHolidays.length === this.holidays.length
      ? filteredCount + ' holidays'
      : filteredCount + ' of ' + totalCount + ' holidays';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create holiday' : 'Edit holiday';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the holiday date and whether it repeats yearly so teams can plan capacity earlier.'
      : 'Refine the holiday schedule and keep the calendar accurate across the workspace.';
  }

  get draftName(): string {
    return this.normalizeText(this.holidayForm.value.name) || 'Untitled holiday';
  }

  get draftDateLabel(): string {
    return this.formatDateLabel(this.normalizeText(this.holidayForm.value.date));
  }

  get draftQuality(): HolidayQuality {
    return this.evaluateQuality(this.draftName, this.normalizeText(this.holidayForm.value.date), !!this.holidayForm.value.recurring);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: HolidayView): void {
    this.modalMode = 'edit';
    this.activeHolidayId = item.id;
    this.submitted = false;
    this.featuredHoliday = item;
    this.holidayForm.reset({
      name: item.name,
      date: item.date,
      recurring: item.recurring,
    });
  }

  selectHoliday(item: HolidayView): void {
    this.featuredHoliday = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: HolidayFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: HolidaySort): void {
    this.activeSort = value || 'nearest';
    this.applyFilters();
  }

  refreshHolidays(): void {
    this.loadHolidays(true);
  }

  trackByHolidayId(index: number, item: HolidayView): number {
    return item.id || index;
  }

  async saveHoliday(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.holidayForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeHolidayId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/holiday/update/' + this.activeHolidayId,
          payload
        );
        super.show('Confirmation', 'Holiday updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/holiday/create', payload);
        super.show('Confirmation', 'Holiday created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadHolidays();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteHoliday(item: HolidayView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/holiday/delete/' + item.id);
      super.show('Confirmation', 'Holiday deleted successfully.', 'success');

      if (this.featuredHoliday && this.featuredHoliday.id === item.id) {
        this.featuredHoliday = null;
      }

      this.loadHolidays();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadHolidays(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/holiday/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.holidays = this.normalizeHolidays(data);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Holidays refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.holidays = [];
          this.filteredHolidays = [];
          this.featuredHoliday = null;
          this.loadError = 'Unable to load holiday records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeHolidayId = null;
    this.submitted = false;
    this.saving = false;
    this.holidayForm.reset({
      name: '',
      date: '',
      recurring: false,
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredHolidays = this.holidays
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.summary.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'upcoming'
            ? item.upcoming
            : this.activeFilter === 'recurring'
            ? item.recurring
            : item.past;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'latest') {
          return this.toDateValue(right.date) - this.toDateValue(left.date);
        }

        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        return this.toDateValue(left.date) - this.toDateValue(right.date);
      });

    if (!this.filteredHolidays.length) {
      this.featuredHoliday = null;
      return;
    }

    if (
      !this.featuredHoliday ||
      !this.filteredHolidays.some((item) => item.id === this.featuredHoliday.id)
    ) {
      this.featuredHoliday = this.filteredHolidays[0];
    }
  }

  private normalizeHolidays(data: unknown): HolidayView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toHolidayView(record, index));
  }

  private toHolidayView(record: any, index: number): HolidayView {
    const name = this.normalizeText(record && record.name) || 'Untitled holiday';
    const date = this.normalizeText(record && record.date);
    const recurring = this.toBoolean(record && (record.recurring ?? record.isRecurring));
    const quality = this.evaluateQuality(name, date, recurring);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      name,
      date,
      dateLabel: this.formatDateLabel(date),
      recurring,
      upcoming: this.toDateValue(date) >= this.startOfToday(),
      past: !!date && this.toDateValue(date) < this.startOfToday(),
      summary: recurring ? 'Repeats yearly and should stay visible in long-range planning.' : 'One-time holiday entry for this calendar cycle.',
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      relativeLabel: this.buildRelativeLabel(date),
    };
  }

  private evaluateQuality(name: string, date: string, recurring: boolean): HolidayQuality {
    if (name.length > 0 && date.length > 0) {
      return {
        label: recurring ? 'Evergreen' : 'Ready',
        tone: 'strong',
        score: recurring ? 100 : 88,
      };
    }

    if (name.length > 0 || date.length > 0) {
      return {
        label: 'Needs detail',
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

  private buildRelativeLabel(date: string): string {
    const dateValue = this.toDateValue(date);

    if (!Number.isFinite(dateValue) || !date) {
      return 'Date pending';
    }

    const today = this.startOfToday();
    const difference = Math.round((dateValue - today) / 86400000);

    if (difference === 0) {
      return 'Today';
    }

    if (difference > 0) {
      return 'In ' + difference + ' day' + (difference === 1 ? '' : 's');
    }

    const absoluteDays = Math.abs(difference);
    return absoluteDays + ' day' + (absoluteDays === 1 ? '' : 's') + ' ago';
  }

  private buildPayload(): { name: string; date: string; recurring: boolean } | null {
    const name = this.normalizeText(this.holidayForm.value.name);
    const date = this.normalizeText(this.holidayForm.value.date);
    const recurring = !!this.holidayForm.value.recurring;

    this.holidayForm.patchValue(
      {
        name,
        date,
        recurring,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.holidayForm.get('name').setErrors({ required: true });
    }

    if (!date) {
      this.holidayForm.get('date').setErrors({ required: true });
    }

    if (this.holidayForm.invalid || !name || !date) {
      return null;
    }

    return {
      name,
      date,
      recurring,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('holidayCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toBoolean(value: unknown): boolean {
    return value === true || value === 'true';
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

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the holiday request right now.';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
