import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface TopbarNotification {
  id: number;
  title: string;
  message: string;
  route: string;
  read: boolean;
  createdAtLabel: string;
  typeLabel: string;
  accentClass: string;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  loading = false;
  notifications: TopbarNotification[] = [];

  constructor(private httpService: HTTPService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get unreadCount(): number {
    return this.notifications.filter((item) => !item.read).length;
  }

  async markAsRead(item: TopbarNotification): Promise<void> {
    if (!item || item.read) {
      return;
    }

    const previousReadState = item.read;
    item.read = true;

    try {
      await this.httpService.update(
        CONFIG.URL_BASE + '/api/notifications/' + item.id + '/read',
        {}
      );
    } catch (error) {
      item.read = previousReadState;
    }
  }

  private loadNotifications(): void {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/api/notifications')
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((records: any[]) => {
        this.notifications = (records || [])
          .map((record) => this.normalizeNotification(record))
          .filter((record) => record.id !== null)
          .slice(0, 4);
      });
  }

  private normalizeNotification(record: any): TopbarNotification {
    const type = typeof record?.type === 'string' ? record.type : 'INTERNAL_MESSAGE';

    return {
      id: this.toNumber(record && record.id),
      title: this.normalizeText(record && record.title) || 'Notification',
      message: this.createExcerpt(this.normalizeText(record && record.message)),
      route: this.normalizeText(record && record.route) || '/communication',
      read: !!(record && record.read),
      createdAtLabel: this.formatRelativeTime(this.normalizeText(record && record.createdAt)),
      typeLabel: this.resolveTypeLabel(type),
      accentClass: this.resolveAccent(type),
    };
  }

  private resolveTypeLabel(value: string): string {
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

  private resolveAccent(value: string): string {
    switch (value) {
      case 'LEAVE_APPROVED':
        return 'accent-green';
      case 'LEAVE_REJECTED':
        return 'accent-red';
      case 'PAYROLL_PROCESSED':
        return 'accent-teal';
      case 'TASK_ASSIGNED':
        return 'accent-gold';
      case 'ANNOUNCEMENT':
        return 'accent-blue';
      case 'INTERNAL_MESSAGE':
      default:
        return 'accent-orange';
    }
  }

  private createExcerpt(value: string): string {
    if (value.length <= 84) {
      return value;
    }

    return value.slice(0, 81).trim() + '...';
  }

  private formatRelativeTime(value: string): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Now';
    }

    const difference = Date.now() - date.getTime();
    const minutes = Math.max(Math.round(difference / 60000), 0);

    if (minutes < 1) {
      return 'Now';
    }

    if (minutes < 60) {
      return minutes + 'm';
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
      return hours + 'h';
    }

    return Math.round(hours / 24) + 'd';
  }

  private toNumber(value: unknown): number | null {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}
