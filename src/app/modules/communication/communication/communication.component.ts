import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

type NotificationType =
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'PAYROLL_PROCESSED'
  | 'TASK_ASSIGNED'
  | 'ANNOUNCEMENT'
  | 'INTERNAL_MESSAGE';

type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type NotificationFilter = 'all' | NotificationType;
type ReadFilter = 'all' | 'unread' | 'read';

interface EmployeeReference {
  id: number;
  name: string;
  departmentName: string;
}

interface NotificationRecord {
  id: number;
  employeeId: number | null;
  employeeName: string;
  departmentName: string;
  type: NotificationType;
  typeLabel: string;
  typeTone: string;
  priority: NotificationPriority;
  priorityLabel: string;
  title: string;
  message: string;
  excerpt: string;
  route: string;
  authorName: string;
  read: boolean;
  createdAt: string;
  createdAtLabel: string;
  createdAtFullLabel: string;
  isInternalMessage: boolean;
}

@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.css'],
})
export class CommunicationComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  loadError = '';

  searchTerm = '';
  activeTypeFilter: NotificationFilter = 'all';
  activeReadFilter: ReadFilter = 'all';
  activeEmployeeFilter = 'all';

  employees: EmployeeReference[] = [];
  notifications: NotificationRecord[] = [];
  filteredNotifications: NotificationRecord[] = [];
  featuredNotification: NotificationRecord = null;

  readonly notificationTypes: NotificationFilter[] = [
    'all',
    'INTERNAL_MESSAGE',
    'PAYROLL_PROCESSED',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'TASK_ASSIGNED',
    'ANNOUNCEMENT',
  ];

  readonly readFilters: ReadFilter[] = ['all', 'unread', 'read'];
  readonly messageForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.messageForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(160)]],
      message: ['', [Validators.required, Validators.maxLength(1000)]],
      priority: ['MEDIUM', [Validators.required]],
      route: ['/communication', [Validators.maxLength(240)]],
      authorName: ['HR Team', [Validators.maxLength(120)]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get totalNotificationsCount(): number {
    return this.notifications.length;
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter((item) => !item.read).length;
  }

  get internalMessagesCount(): number {
    return this.notifications.filter((item) => item.isInternalMessage).length;
  }

  get payrollNotificationsCount(): number {
    return this.notifications.filter((item) => item.type === 'PAYROLL_PROCESSED')
      .length;
  }

  get announcementNotificationsCount(): number {
    return this.notifications.filter((item) => item.type === 'ANNOUNCEMENT').length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredNotifications.length);
    const totalCount = this.formatCount(this.notifications.length);

    return this.filteredNotifications.length === this.notifications.length
      ? filteredCount + ' communication records'
      : filteredCount + ' of ' + totalCount + ' communication records';
  }

  get selectedEmployeeName(): string {
    return this.lookupEmployeeName(this.messageForm.value.employeeId);
  }

  get selectedPriorityLabel(): string {
    return this.normalizePriority(this.messageForm.value.priority || 'MEDIUM');
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onTypeFilterChange(value: NotificationFilter): void {
    this.activeTypeFilter = value || 'all';
    this.applyFilters();
  }

  onReadFilterChange(value: ReadFilter): void {
    this.activeReadFilter = value || 'all';
    this.applyFilters();
  }

  onEmployeeFilterChange(value: string): void {
    this.activeEmployeeFilter = value || 'all';
    this.applyFilters();
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  selectNotification(item: NotificationRecord): void {
    this.featuredNotification = item;
  }

  trackByNotificationId(index: number, item: NotificationRecord): number {
    return item.id || index;
  }

  async sendInternalMessage(): Promise<void> {
    this.submitted = true;

    if (this.messageForm.invalid || this.saving) {
      return;
    }

    this.saving = true;
    this.loadError = '';

    try {
      const createdNotification = await this.httpService.postWithResponse<any>(
        CONFIG.URL_BASE + '/api/notifications/internal-message',
        this.buildInternalMessagePayload()
      );
      const normalizedNotification = this.normalizeNotification(createdNotification);

      this.notifications = [normalizedNotification].concat(
        this.notifications.filter((item) => item.id !== normalizedNotification.id)
      );
      this.resetComposer();
      this.applyFilters();
      this.featuredNotification = normalizedNotification;
    } catch (error) {
      this.loadError = this.extractErrorMessage(
        error,
        'Unable to send the internal message.'
      );
    } finally {
      this.saving = false;
    }
  }

  async markAsRead(item: NotificationRecord): Promise<void> {
    if (!item || item.read) {
      return;
    }

    const previousReadState = item.read;
    item.read = true;
    this.applyFilters();

    try {
      await this.httpService.update(
        CONFIG.URL_BASE + '/api/notifications/' + item.id + '/read',
        {}
      );
    } catch (error) {
      item.read = previousReadState;
      this.applyFilters();
      this.loadError = this.extractErrorMessage(
        error,
        'Unable to update the communication status.'
      );
    }
  }

  private loadWorkspace(isRefresh = false): void {
    this.loading = true;

    if (!isRefresh) {
      this.loadError = '';
    }

    forkJoin({
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(
        catchError(() => of([]))
      ),
      notifications: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/notifications')
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.loadError = this.extractErrorMessage(
              error,
              'Unable to load the communications workspace.'
            );
            return of([]);
          })
        ),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((result: any) => {
        const employees = Array.isArray(result && result.employees)
          ? result.employees
          : [];
        const notifications = Array.isArray(result && result.notifications)
          ? result.notifications
          : [];

        this.employees = this.normalizeEmployees(employees);
        this.notifications = this.normalizeNotifications(notifications);
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredNotifications = this.notifications.filter((item) => {
      const matchesType =
        this.activeTypeFilter === 'all' || item.type === this.activeTypeFilter;
      const matchesRead =
        this.activeReadFilter === 'all' ||
        (this.activeReadFilter === 'unread' ? !item.read : item.read);
      const matchesEmployee =
        this.activeEmployeeFilter === 'all' ||
        String(item.employeeId) === this.activeEmployeeFilter;
      const matchesTerm =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term) ||
        item.employeeName.toLowerCase().includes(term) ||
        item.authorName.toLowerCase().includes(term) ||
        item.typeLabel.toLowerCase().includes(term);

      return matchesType && matchesRead && matchesEmployee && matchesTerm;
    });

    if (!this.filteredNotifications.length) {
      this.featuredNotification = null;
      return;
    }

    if (
      this.featuredNotification &&
      this.filteredNotifications.some(
        (item) => item.id === this.featuredNotification.id
      )
    ) {
      this.featuredNotification = this.filteredNotifications.find(
        (item) => item.id === this.featuredNotification.id
      );
      return;
    }

    this.featuredNotification = this.filteredNotifications[0];
  }

  private normalizeEmployees(records: any[]): EmployeeReference[] {
    return (records || [])
      .map((record) => ({
        id: this.toNumber(record && record.id),
        name: this.normalizeText(record && record.fullName) || 'Employee',
        departmentName:
          this.normalizeText(record && record.department && record.department.name) ||
          this.normalizeText(record && record.department && record.department.departementName) ||
          'Unassigned department',
      }))
      .filter((record) => record.id !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private normalizeNotifications(records: any[]): NotificationRecord[] {
    return (records || [])
      .map((record) => this.normalizeNotification(record))
      .filter((record) => record.id !== null);
  }

  private normalizeNotification(record: any): NotificationRecord {
    const type = this.normalizeType(record && record.type);
    const createdAt = this.normalizeText(record && record.createdAt);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      (record && record.employee && record.employee.id
        ? 'Employee #' + record.employee.id
        : 'Company-wide');
    const message = this.normalizeText(record && record.message);

    return {
      id: this.toNumber(record && record.id),
      employeeId: this.toNumber(record && record.employee && record.employee.id),
      employeeName,
      departmentName:
        this.normalizeText(
          record && record.employee && record.employee.department && record.employee.department.name
        ) ||
        this.normalizeText(
          record &&
            record.employee &&
            record.employee.department &&
            record.employee.department.departementName
        ) ||
        'All departments',
      type,
      typeLabel: this.normalizeTypeLabel(type),
      typeTone: this.normalizeTypeTone(type),
      priority: this.normalizePriorityValue(record && record.priority),
      priorityLabel: this.normalizePriority(record && record.priority),
      title: this.normalizeText(record && record.title) || 'Notification',
      message,
      excerpt: this.createExcerpt(message),
      route: this.normalizeText(record && record.route) || '/communication',
      authorName: this.normalizeText(record && record.authorName) || 'System',
      read: !!(record && record.read),
      createdAt,
      createdAtLabel: this.formatRelativeTime(createdAt),
      createdAtFullLabel: this.formatFullDate(createdAt),
      isInternalMessage: type === 'INTERNAL_MESSAGE',
    };
  }

  private buildInternalMessagePayload(): Record<string, unknown> {
    return {
      employee: {
        id: this.toNumber(this.messageForm.value.employeeId),
      },
      title: this.normalizeText(this.messageForm.value.title),
      message: this.normalizeText(this.messageForm.value.message),
      priority: this.normalizePriorityValue(this.messageForm.value.priority),
      route: this.normalizeText(this.messageForm.value.route) || '/communication',
      authorName: this.normalizeText(this.messageForm.value.authorName) || 'HR Team',
    };
  }

  private resetComposer(): void {
    this.submitted = false;
    this.messageForm.reset({
      employeeId: '',
      title: '',
      message: '',
      priority: 'MEDIUM',
      route: '/communication',
      authorName: 'HR Team',
    });
  }

  private lookupEmployeeName(value: string): string {
    const employeeId = this.toNumber(value);

    if (employeeId === null) {
      return 'Choose an employee';
    }

    const employee = this.employees.find((item) => item.id === employeeId);
    return employee ? employee.name : 'Choose an employee';
  }

  private normalizeType(value: string): NotificationType {
    switch (this.normalizeText(value)) {
      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
      case 'PAYROLL_PROCESSED':
      case 'TASK_ASSIGNED':
      case 'ANNOUNCEMENT':
      case 'INTERNAL_MESSAGE':
        return value as NotificationType;
      default:
        return 'INTERNAL_MESSAGE';
    }
  }

  private normalizeTypeLabel(value: NotificationType): string {
    switch (value) {
      case 'LEAVE_APPROVED':
        return 'Leave approved';
      case 'LEAVE_REJECTED':
        return 'Leave rejected';
      case 'PAYROLL_PROCESSED':
        return 'Payroll processed';
      case 'TASK_ASSIGNED':
        return 'Task assigned';
      case 'ANNOUNCEMENT':
        return 'Announcement';
      case 'INTERNAL_MESSAGE':
      default:
        return 'Internal message';
    }
  }

  private normalizeTypeTone(value: NotificationType): string {
    switch (value) {
      case 'LEAVE_APPROVED':
        return 'tone-positive';
      case 'LEAVE_REJECTED':
        return 'tone-critical';
      case 'PAYROLL_PROCESSED':
        return 'tone-finance';
      case 'TASK_ASSIGNED':
        return 'tone-focus';
      case 'ANNOUNCEMENT':
        return 'tone-broadcast';
      case 'INTERNAL_MESSAGE':
      default:
        return 'tone-message';
    }
  }

  private normalizePriorityValue(value: string): NotificationPriority {
    switch (this.normalizeText(value)) {
      case 'LOW':
      case 'HIGH':
      case 'MEDIUM':
        return value as NotificationPriority;
      default:
        return 'MEDIUM';
    }
  }

  private normalizePriority(value: string): string {
    const priority = this.normalizePriorityValue(value);
    return priority.charAt(0) + priority.slice(1).toLowerCase() + ' priority';
  }

  private createExcerpt(value: string): string {
    if (value.length <= 120) {
      return value;
    }

    return value.slice(0, 117).trim() + '...';
  }

  private formatRelativeTime(value: string): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Now';
    }

    const difference = Date.now() - date.getTime();
    const minutes = Math.max(Math.round(difference / 60000), 0);

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return minutes + 'm';
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
      return hours + 'h';
    }

    const days = Math.round(hours / 24);
    return days + 'd';
  }

  private formatFullDate(value: string): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleString();
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length) {
        return error.error.trim();
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return fallback;
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat().format(value || 0);
  }

  private toNumber(value: unknown): number | null {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}