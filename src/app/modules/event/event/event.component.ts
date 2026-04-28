import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface EventQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface EventView {
  id: number;
  eventTitle: string;
  eventDateTime: string;
  eventDateTimeLabel: string;
  eventNote: string;
  summary: string;
  upcoming: boolean;
  past: boolean;
  thisMonth: boolean;
  qualityLabel: EventQuality['label'];
  qualityTone: EventQuality['tone'];
  qualityScore: number;
  relativeLabel: string;
}

type EventFilter = 'all' | 'upcoming' | 'this-month' | 'past';
type EventSort = 'nearest' | 'latest' | 'title-asc';
type EventEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: EventFilter = 'all';
  activeSort: EventSort = 'nearest';
  searchTerm = '';

  modalMode: EventEditorMode = 'create';
  activeEventId: number = null;

  events: EventView[] = [];
  filteredEvents: EventView[] = [];
  featuredEvent: EventView = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly eventForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.eventForm = this.formBuilder.group({
      eventTitle: ['', [Validators.required, Validators.maxLength(160)]],
      eventDateTime: ['', [Validators.required]],
      eventNote: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    super.loadScripts();
  }

  get totalEventsCount(): number {
    return this.events.length;
  }

  get upcomingEventsCount(): number {
    return this.events.filter((item) => item.upcoming).length;
  }

  get thisMonthEventsCount(): number {
    return this.events.filter((item) => item.thisMonth).length;
  }

  get documentedEventsCount(): number {
    return this.events.filter((item) => item.eventNote.length > 0).length;
  }

  get noteCoverage(): number {
    return this.toPercent(this.documentedEventsCount, Math.max(this.totalEventsCount, 1));
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredEvents.length);
    const totalCount = this.formatCount(this.events.length);

    return this.filteredEvents.length === this.events.length
      ? filteredCount + ' events'
      : filteredCount + ' of ' + totalCount + ' events';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create event' : 'Edit event';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the schedule and note so the event library supports planning, not guesswork.'
      : 'Refine the event timing and update the supporting note so the calendar stays reliable.';
  }

  get draftQuality(): EventQuality {
    return this.evaluateQuality(
      this.normalizeText(this.eventForm.value.eventTitle),
      this.normalizeText(this.eventForm.value.eventDateTime),
      this.normalizeText(this.eventForm.value.eventNote)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: EventView): void {
    this.modalMode = 'edit';
    this.activeEventId = item.id;
    this.submitted = false;
    this.featuredEvent = item;
    this.eventForm.reset({
      eventTitle: item.eventTitle,
      eventDateTime: this.toDateTimeInputValue(item.eventDateTime),
      eventNote: item.eventNote,
    });
  }

  selectEvent(item: EventView): void {
    this.featuredEvent = item;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: EventFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: EventSort): void {
    this.activeSort = value || 'nearest';
    this.applyFilters();
  }

  refreshEvents(): void {
    this.loadEvents(true);
  }

  trackByEventId(index: number, item: EventView): number {
    return item.id || index;
  }

  async saveEvent(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeEventId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/event/update/' + this.activeEventId,
          payload
        );
        super.show('Confirmation', 'Event updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/event/create', payload);
        super.show('Confirmation', 'Event created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadEvents();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteEvent(item: EventView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.eventTitle + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/event/delete/' + item.id);
      super.show('Confirmation', 'Event deleted successfully.', 'success');

      if (this.featuredEvent && this.featuredEvent.id === item.id) {
        this.featuredEvent = null;
      }

      this.loadEvents();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadEvents(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/event/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.events = this.normalizeEvents(data);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Events refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.events = [];
          this.filteredEvents = [];
          this.featuredEvent = null;
          this.loadError = 'Unable to load event records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeEventId = null;
    this.submitted = false;
    this.saving = false;
    this.eventForm.reset({
      eventTitle: '',
      eventDateTime: '',
      eventNote: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredEvents = this.events
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.eventTitle.toLowerCase().includes(searchValue) ||
          item.eventNote.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'upcoming'
            ? item.upcoming
            : this.activeFilter === 'this-month'
            ? item.thisMonth
            : item.past;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'latest') {
          return this.toDateTimeValue(right.eventDateTime) - this.toDateTimeValue(left.eventDateTime);
        }

        if (this.activeSort === 'title-asc') {
          return left.eventTitle.localeCompare(right.eventTitle);
        }

        return this.toDateTimeValue(left.eventDateTime) - this.toDateTimeValue(right.eventDateTime);
      });

    if (!this.filteredEvents.length) {
      this.featuredEvent = null;
      return;
    }

    if (
      !this.featuredEvent ||
      !this.filteredEvents.some((item) => item.id === this.featuredEvent.id)
    ) {
      this.featuredEvent = this.filteredEvents[0];
    }
  }

  private normalizeEvents(data: unknown): EventView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.normalizeText(record && record.eventTitle).length > 0)
      .map((record, index) => this.toEventView(record, index));
  }

  private toEventView(record: any, index: number): EventView {
    const eventTitle = this.normalizeText(record && record.eventTitle) || 'Untitled event';
    const eventDateTime = this.normalizeDateTimeValue(record && record.eventDateTime);
    const eventNote = this.normalizeText(record && record.eventNote);
    const quality = this.evaluateQuality(eventTitle, eventDateTime, eventNote);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      eventTitle,
      eventDateTime,
      eventDateTimeLabel: this.formatDateTimeLabel(eventDateTime),
      eventNote,
      summary: eventNote || this.buildRelativeLabel(eventDateTime),
      upcoming: this.isUpcomingEvent(eventDateTime),
      past: !this.isUpcomingEvent(eventDateTime),
      thisMonth: this.isThisMonth(eventDateTime),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      relativeLabel: this.buildRelativeLabel(eventDateTime),
    };
  }

  private evaluateQuality(
    eventTitle: string,
    eventDateTime: string,
    eventNote: string
  ): EventQuality {
    const coverage = [eventTitle, eventDateTime].filter((value) => value.length > 0).length;

    if (coverage >= 2 && eventNote.length >= 40) {
      return {
        label: 'Ready',
        tone: 'strong',
        score: 100,
      };
    }

    if (coverage >= 2) {
      return {
        label: 'Solid',
        tone: 'medium',
        score: 82,
      };
    }

    if (coverage === 1) {
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

  private buildRelativeLabel(eventDateTime: string): string {
    const eventValue = this.toDateTimeValue(eventDateTime);
    if (!Number.isFinite(eventValue)) {
      return 'Schedule pending';
    }

    const difference = eventValue - Date.now();
    const dayDifference = Math.round(difference / 86400000);

    if (Math.abs(dayDifference) <= 1) {
      return difference >= 0 ? 'Happening soon' : 'Just completed';
    }

    if (difference >= 0) {
      return 'Starts in ' + dayDifference + ' day' + (dayDifference === 1 ? '' : 's');
    }

    const absoluteDays = Math.abs(dayDifference);
    return 'Held ' + absoluteDays + ' day' + (absoluteDays === 1 ? '' : 's') + ' ago';
  }

  private buildPayload(): {
    eventTitle: string;
    eventDateTime: string;
    eventNote: string;
  } | null {
    const eventTitle = this.normalizeText(this.eventForm.value.eventTitle);
    const eventDateTime = this.normalizeDateTimeValue(this.eventForm.value.eventDateTime);
    const eventNote = this.normalizeText(this.eventForm.value.eventNote);

    this.eventForm.patchValue(
      {
        eventTitle,
        eventDateTime: this.toDateTimeInputValue(eventDateTime),
        eventNote,
      },
      { emitEvent: false }
    );

    if (!eventTitle) {
      this.eventForm.get('eventTitle').setErrors({ required: true });
    }

    if (!eventDateTime) {
      this.eventForm.get('eventDateTime').setErrors({ required: true });
    }

    if (this.eventForm.invalid || !eventTitle || !eventDateTime) {
      return null;
    }

    return {
      eventTitle,
      eventDateTime,
      eventNote,
    };
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('eventCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeDateTimeValue(value: unknown): string {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmedValue = value.trim();
    return trimmedValue.includes('T') ? trimmedValue : trimmedValue.replace(' ', 'T');
  }

  private toDateTimeInputValue(value: string): string {
    if (!value) {
      return '';
    }

    return value.length >= 16 ? value.slice(0, 16) : value;
  }

  private toDateTimeValue(value: string): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
  }

  private formatDateTimeLabel(value: string): string {
    if (!value) {
      return 'Time not set';
    }

    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsedDate);
  }

  private isUpcomingEvent(value: string): boolean {
    return this.toDateTimeValue(value) >= Date.now();
  }

  private isThisMonth(value: string): boolean {
    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) {
      return false;
    }

    const today = new Date();
    return (
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear()
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the event request right now.';
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
