import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface LeaveReference {
  id: number;
  name: string;
}

interface LeaveQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface LeaveBalanceSummary {
  employeeId: number | null;
  employeeName: string;
  leaveTypeId: number | null;
  leaveTypeName: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  usagePercent: number;
  status: string;
}

type LeaveApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

interface LeaveView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  leaveTypeId: number | null;
  leaveTypeName: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  attachment: string;
  remarks: string;
  reason: string;
  durationDays: number;
  durationLabel: string;
  active: boolean;
  upcoming: boolean;
  archived: boolean;
  hasAttachment: boolean;
  summary: string;
  qualityLabel: LeaveQuality['label'];
  qualityTone: LeaveQuality['tone'];
  qualityScore: number;
  approvalStatus: LeaveApprovalStatus;
  approvalTone: LeaveQuality['tone'];
  reviewedBy: string;
  reviewedAt: string;
  reviewedAtLabel: string;
  timelineLabel: string;
}

type LeaveFilter =
  | 'all'
  | 'active'
  | 'upcoming'
  | 'archived'
  | 'needs-attachment'
  | 'pending'
  | 'approved'
  | 'rejected';
type LeaveSort = 'latest-start' | 'longest' | 'employee-asc';
type LeaveEditorMode = 'create' | 'edit';
@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css'],
})
export class LeaveComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: LeaveFilter = 'all';
  activeSort: LeaveSort = 'latest-start';
  searchTerm = '';

  modalMode: LeaveEditorMode = 'create';
  activeLeaveId: number = null;

  leaves: LeaveView[] = [];
  filteredLeaves: LeaveView[] = [];
  featuredLeave: LeaveView = null;
  leaveBalances: LeaveBalanceSummary[] = [];

  employees: LeaveReference[] = [];
  leaveTypes: LeaveReference[] = [];
  currentEmployee: LeaveReference = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly leaveForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService
  ) {
    super();
    this.leaveForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      leaveTypeId: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      attachment: ['', [Validators.maxLength(240)]],
      remarks: ['', [Validators.maxLength(240)]],
      reason: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadLeaveWorkspace();
    super.loadScripts();
  }

  get isEmployeeWorkspace(): boolean {
    return this.authentificationService.hasRole('EMPLOYEE') && !this.canManageEmployeeSelection;
  }

  get canManageEmployeeSelection(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR', 'MANAGER']);
  }

  get canReviewLeaves(): boolean {
    return this.canManageEmployeeSelection;
  }

  get canViewLeaveBalances(): boolean {
    return this.canManageEmployeeSelection;
  }

  get currentReviewerName(): string {
    return this.authentificationService.getDisplayName();
  }

  get totalLeavesCount(): number {
    return this.leaves.length;
  }

  get activeLeavesCount(): number {
    return this.leaves.filter((item) => item.active).length;
  }

  get upcomingLeavesCount(): number {
    return this.leaves.filter((item) => item.upcoming).length;
  }

  get attachmentCoverageCount(): number {
    return this.leaves.filter((item) => item.hasAttachment).length;
  }

  get pendingLeavesCount(): number {
    return this.leaves.filter((item) => item.approvalStatus === 'Pending').length;
  }

  get approvedLeavesCount(): number {
    return this.leaves.filter((item) => item.approvalStatus === 'Approved').length;
  }

  get rejectedLeavesCount(): number {
    return this.leaves.filter((item) => item.approvalStatus === 'Rejected').length;
  }

  get leaveBalanceHighlights(): LeaveBalanceSummary[] {
    return this.leaveBalances.slice(0, 5);
  }

  get leaveBalanceAlertCount(): number {
    return this.leaveBalances.filter((item) => item.remainingDays <= 2).length;
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredLeaves.length);
    const totalCount = this.formatCount(this.leaves.length);

    return this.filteredLeaves.length === this.leaves.length
      ? filteredCount + ' leave records'
      : filteredCount + ' of ' + totalCount + ' leave records';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create leave request' : 'Edit leave request';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the employee, leave type, dates, and context in a request managers can review quickly.'
      : 'Refine the leave request and keep supporting context current for planning and approval.';
  }

  get draftEmployeeName(): string {
    return (
      this.lookupOptionName(this.employees, this.leaveForm.value.employeeId) ||
      (this.isEmployeeWorkspace && this.currentEmployee ? this.currentEmployee.name : '')
    );
  }

  get draftLeaveTypeName(): string {
    return this.lookupOptionName(this.leaveTypes, this.leaveForm.value.leaveTypeId);
  }

  get draftDurationLabel(): string {
    const durationDays = this.computeDurationDays(
      this.normalizeText(this.leaveForm.value.startDate),
      this.normalizeText(this.leaveForm.value.endDate)
    );

    return durationDays > 0
      ? durationDays + ' day' + (durationDays === 1 ? '' : 's')
      : 'Duration pending';
  }

  get draftQuality(): LeaveQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.draftLeaveTypeName,
      this.normalizeText(this.leaveForm.value.startDate),
      this.normalizeText(this.leaveForm.value.endDate),
      this.normalizeText(this.leaveForm.value.reason),
      this.normalizeText(this.leaveForm.value.remarks),
      this.normalizeText(this.leaveForm.value.attachment)
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: LeaveView): void {
    this.modalMode = 'edit';
    this.activeLeaveId = item.id;
    this.submitted = false;
    this.featuredLeave = item;
    this.leaveForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      leaveTypeId: item.leaveTypeId !== null ? String(item.leaveTypeId) : '',
      startDate: item.startDate,
      endDate: item.endDate,
      attachment: item.attachment,
      remarks: item.remarks,
      reason: item.reason,
    });
  }

  selectLeave(item: LeaveView): void {
    this.featuredLeave = item;
  }

  openDetailsModal(item: LeaveView): void {
    this.selectLeave(item);

    window.requestAnimationFrame(() => {
      this.showModal('leaveDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: LeaveFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: LeaveSort): void {
    this.activeSort = value || 'latest-start';
    this.applyFilters();
  }

  refreshLeaves(): void {
    this.loadLeaveWorkspace(true);
  }

  async approveLeave(item: LeaveView): Promise<void> {
    if (!item || item.approvalStatus === 'Approved') {
      return;
    }

    await this.updateLeaveApproval(item, 'Approved', 'Leave request approved successfully.');
  }

  async rejectLeave(item: LeaveView): Promise<void> {
    if (!item || item.approvalStatus === 'Rejected') {
      return;
    }

    await this.updateLeaveApproval(item, 'Rejected', 'Leave request rejected successfully.');
  }

  exportLeaveReport(): void {
    if (!this.filteredLeaves.length) {
      return;
    }

    const rows = [
      [
        'Record ID',
        'Employee',
        'Leave Type',
        'Approval Status',
        'Start Date',
        'End Date',
        'Duration Days',
        'Reason',
        'Remarks',
        'Attachment',
        'Reviewed By',
        'Reviewed At',
      ],
      ...this.filteredLeaves.map((item) => [
        String(item.id),
        item.employeeName,
        item.leaveTypeName,
        item.approvalStatus,
        item.startDate,
        item.endDate,
        String(item.durationDays),
        item.reason,
        item.remarks,
        item.attachment,
        item.reviewedBy,
        item.reviewedAt,
      ]),
    ];

    const csvContent = rows.map((row) => row.map((value) => this.escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = 'leave-report-' + this.getCurrentDateString() + '.csv';
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  trackByLeaveId(index: number, item: LeaveView): number {
    return item.id || index;
  }

  async saveLeave(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeLeaveId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/leave/update/' + this.activeLeaveId,
          payload
        );
        super.show('Confirmation', 'Leave request updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/leave/create', payload);
        super.show('Confirmation', 'Leave request created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadLeaveWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteLeave(item: LeaveView): Promise<void> {
    const confirmed = confirm(
      'Delete the leave record for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/leave/delete/' + item.id);
      super.show('Confirmation', 'Leave request deleted successfully.', 'success');

      if (this.featuredLeave && this.featuredLeave.id === item.id) {
        this.featuredLeave = null;
      }

      this.loadLeaveWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadLeaveWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      leaves: this.httpService.getAll(CONFIG.URL_BASE + '/leave/all'),
      employees: this.canManageEmployeeSelection
        ? this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([])))
        : of([]),
      currentEmployee: this.isEmployeeWorkspace
        ? this.httpService.get(CONFIG.URL_BASE + '/employee/me').pipe(catchError(() => of(null)))
        : of(null),
      leaveTypes: this.httpService.getAll(CONFIG.URL_BASE + '/typeleave/all').pipe(catchError(() => of([]))),
      leaveBalances: this.canViewLeaveBalances
        ? this.httpService
            .getAll(CONFIG.URL_BASE + '/api/workspace-automation/leave-balances')
            .pipe(catchError(() => of([])))
        : of([]),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.currentEmployee = this.normalizeEmployeeOption(result.currentEmployee);
          this.employees = this.canManageEmployeeSelection
            ? this.normalizeEmployeeOptions(result.employees)
            : this.currentEmployee
            ? [this.currentEmployee]
            : [];
          this.leaveTypes = this.normalizeNamedOptions(result.leaveTypes);
          this.leaves = this.normalizeLeaves(result.leaves);
          this.leaveBalances = this.normalizeLeaveBalances(result.leaveBalances);

          if (this.isEmployeeWorkspace && !this.currentEmployee) {
            this.loadError = 'Your employee profile could not be resolved for leave self-service.';
          }

          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Leave records refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.leaves = [];
          this.filteredLeaves = [];
          this.featuredLeave = null;
          this.leaveBalances = [];
          this.loadError = 'Unable to load leave records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeLeaveId = null;
    this.submitted = false;
    this.saving = false;
    this.leaveForm.reset({
      employeeId:
        this.isEmployeeWorkspace && this.currentEmployee ? String(this.currentEmployee.id) : '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      attachment: '',
      remarks: '',
      reason: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredLeaves = this.leaves
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.leaveTypeName.toLowerCase().includes(searchValue) ||
          item.approvalStatus.toLowerCase().includes(searchValue) ||
          item.reason.toLowerCase().includes(searchValue) ||
          item.remarks.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'active'
            ? item.active
            : this.activeFilter === 'upcoming'
            ? item.upcoming
            : this.activeFilter === 'archived'
            ? item.archived
            : this.activeFilter === 'pending'
            ? item.approvalStatus === 'Pending'
            : this.activeFilter === 'approved'
            ? item.approvalStatus === 'Approved'
            : this.activeFilter === 'rejected'
            ? item.approvalStatus === 'Rejected'
            : !item.hasAttachment;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'longest') {
          const durationDifference = right.durationDays - left.durationDays;
          return durationDifference !== 0
            ? durationDifference
            : left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        return this.toDateValue(right.startDate) - this.toDateValue(left.startDate);
      });

    if (!this.filteredLeaves.length) {
      this.featuredLeave = null;
      return;
    }

    const refreshedFeaturedLeave = this.featuredLeave
      ? this.filteredLeaves.find((item) => item.id === this.featuredLeave.id) || null
      : null;

    if (refreshedFeaturedLeave) {
      this.featuredLeave = refreshedFeaturedLeave;
      return;
    }

    if (!this.featuredLeave) {
      this.featuredLeave = this.filteredLeaves[0];
      return;
    }

    this.featuredLeave = this.filteredLeaves[0];
  }

  private normalizeEmployeeOptions(data: unknown): LeaveReference[] {
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

  private normalizeEmployeeOption(record: unknown): LeaveReference | null {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const id = Number((record as any).id);
    const name =
      this.normalizeText((record as any).fullName) ||
      [
        this.normalizeText((record as any).firstName),
        this.normalizeText((record as any).lastName),
      ]
        .filter((value) => value.length > 0)
        .join(' ');

    return Number.isFinite(id) && name.length > 0 ? { id, name } : null;
  }

  private normalizeNamedOptions(data: unknown): LeaveReference[] {
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

  private normalizeLeaves(data: unknown): LeaveView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toLeaveView(record, index));
  }

  private normalizeLeaveBalances(data: unknown): LeaveBalanceSummary[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => ({
        employeeId: this.toNumericId(record && record.employeeId),
        employeeName: this.normalizeText(record && record.employeeName) || 'Employee',
        leaveTypeId: this.toNumericId(record && record.leaveTypeId),
        leaveTypeName: this.normalizeText(record && record.leaveTypeName) || 'Leave type',
        allocatedDays: this.toNumber(record && record.allocatedDays),
        usedDays: this.toNumber(record && record.usedDays),
        remainingDays: this.toNumber(record && record.remainingDays),
        usagePercent: this.toNumber(record && record.usagePercent),
        status: this.normalizeText(record && record.status) || 'Normal',
      }))
      .sort((left, right) => left.remainingDays - right.remainingDays || left.employeeName.localeCompare(right.employeeName));
  }

  private toLeaveView(record: any, index: number): LeaveView {
    const employeeName = this.normalizeText(record && record.employee && record.employee.fullName);
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const leaveTypeName = this.normalizeText(record && record.typeLeave && record.typeLeave.name);
    const leaveTypeId = this.toNumericId(record && record.typeLeave && record.typeLeave.id);
    const startDate = this.normalizeText(record && record.startDate);
    const endDate = this.normalizeText(record && record.endDate);
    const attachment = this.normalizeText(record && record.attachment);
    const remarks = this.normalizeText(record && record.remarks);
    const reason = this.normalizeText(record && record.reason);
    const durationDays = this.computeDurationDays(startDate, endDate);
    const quality = this.evaluateQuality(
      employeeName,
      leaveTypeName,
      startDate,
      endDate,
      reason,
      remarks,
      attachment
    );
    const numericId = Number(record && record.id);
    const approvalStatus = this.normalizeApprovalStatus(record && record.approvalStatus);
    const reviewedAt = this.normalizeText(record && record.reviewedAt);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      leaveTypeId,
      leaveTypeName,
      startDate,
      startDateLabel: this.formatDateLabel(startDate),
      endDate,
      endDateLabel: this.formatDateLabel(endDate),
      attachment,
      remarks,
      reason,
      durationDays,
      durationLabel:
        durationDays > 0
          ? durationDays + ' day' + (durationDays === 1 ? '' : 's')
          : 'Duration pending',
      active: this.isActiveWindow(startDate, endDate),
      upcoming: this.isUpcomingDate(startDate),
      archived: this.isArchivedDate(endDate),
      hasAttachment: attachment.length > 0,
      summary: this.buildSummary(employeeName, leaveTypeName, reason, remarks),
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      approvalStatus,
      approvalTone: this.getApprovalTone(approvalStatus),
      reviewedBy: this.normalizeText(record && record.reviewedBy),
      reviewedAt,
      reviewedAtLabel: this.formatDateTimeLabel(reviewedAt, 'Not reviewed yet'),
      timelineLabel: this.buildTimelineLabel(startDate, endDate),
    };
  }

  private buildSummary(
    employeeName: string,
    leaveTypeName: string,
    reason: string,
    remarks: string
  ): string {
    if (reason) {
      return reason;
    }

    if (remarks) {
      return remarks;
    }

    return [employeeName, leaveTypeName].filter(Boolean).join(' • ') || 'Add leave context so the request is easier to review.';
  }

  private evaluateQuality(
    employeeName: string,
    leaveTypeName: string,
    startDate: string,
    endDate: string,
    reason: string,
    remarks: string,
    attachment: string
  ): LeaveQuality {
    const coverage = [employeeName, leaveTypeName, startDate, endDate, reason || remarks].filter(
      (value) => value.length > 0
    ).length;

    if (coverage >= 5 && attachment.length > 0) {
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

  private buildTimelineLabel(startDate: string, endDate: string): string {
    if (this.isActiveWindow(startDate, endDate)) {
      return 'On leave until ' + this.formatDateLabel(endDate);
    }

    if (this.isUpcomingDate(startDate)) {
      return 'Starts on ' + this.formatDateLabel(startDate);
    }

    if (this.isArchivedDate(endDate)) {
      return 'Ended on ' + this.formatDateLabel(endDate);
    }

    return 'Schedule pending';
  }

  private buildPayload(): {
    employee: { id: number };
    typeLeave: { id: number };
    startDate: string;
    endDate: string;
    attachment: string;
    remarks: string;
    reason: string;
  } | null {
    const employeeId = this.isEmployeeWorkspace && this.currentEmployee
      ? this.currentEmployee.id
      : this.toNumericId(this.leaveForm.value.employeeId);
    const leaveTypeId = this.toNumericId(this.leaveForm.value.leaveTypeId);
    const startDate = this.normalizeText(this.leaveForm.value.startDate);
    const endDate = this.normalizeText(this.leaveForm.value.endDate);
    const attachment = this.normalizeText(this.leaveForm.value.attachment);
    const remarks = this.normalizeText(this.leaveForm.value.remarks);
    const reason = this.normalizeText(this.leaveForm.value.reason);

    this.leaveForm.patchValue(
      {
        employeeId: employeeId !== null ? String(employeeId) : '',
        leaveTypeId: leaveTypeId !== null ? String(leaveTypeId) : '',
        startDate,
        endDate,
        attachment,
        remarks,
        reason,
      },
      { emitEvent: false }
    );

    if (employeeId === null) {
      this.leaveForm.get('employeeId').setErrors({ required: true });
    }

    if (leaveTypeId === null) {
      this.leaveForm.get('leaveTypeId').setErrors({ required: true });
    }

    if (!startDate) {
      this.leaveForm.get('startDate').setErrors({ required: true });
    }

    if (!endDate) {
      this.leaveForm.get('endDate').setErrors({ required: true });
    }

    if (this.leaveForm.invalid || employeeId === null || leaveTypeId === null || !startDate || !endDate) {
      return null;
    }

    return {
      employee: { id: employeeId },
      typeLeave: { id: leaveTypeId },
      startDate,
      endDate,
      attachment,
      remarks,
      reason,
    };
  }

  private buildReviewPayload(
    item: LeaveView,
    approvalStatus: LeaveApprovalStatus
  ): {
    employee: { id: number };
    typeLeave: { id: number };
    startDate: string;
    endDate: string;
    attachment: string;
    remarks: string;
    reason: string;
    approvalStatus: LeaveApprovalStatus;
    reviewedBy: string | null;
    reviewedAt: string | null;
  } | null {
    if (item.employeeId === null || item.leaveTypeId === null) {
      return null;
    }

    return {
      employee: { id: item.employeeId },
      typeLeave: { id: item.leaveTypeId },
      startDate: item.startDate,
      endDate: item.endDate,
      attachment: item.attachment,
      remarks: item.remarks,
      reason: item.reason,
      approvalStatus,
      reviewedBy: approvalStatus === 'Pending' ? null : this.currentReviewerName,
      reviewedAt: approvalStatus === 'Pending' ? null : this.getCurrentDateTimeString(),
    };
  }

  private async updateLeaveApproval(
    item: LeaveView,
    approvalStatus: LeaveApprovalStatus,
    successMessage: string
  ): Promise<void> {
    const payload = this.buildReviewPayload(item, approvalStatus);

    if (!payload) {
      super.show('Error', 'The selected leave record is missing employee or leave type information.', 'warning');
      return;
    }

    try {
      await this.httpService.update(CONFIG.URL_BASE + '/leave/update/' + item.id, payload);
      super.show('Confirmation', successMessage, 'success');
      this.loadLeaveWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    }
  }

  private lookupOptionName(options: LeaveReference[], value: unknown): string {
    const targetId = this.toNumericId(value);
    if (targetId === null) {
      return '';
    }

    const matched = options.find((item) => item.id === targetId);
    return matched ? matched.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('leaveCrudModalClose');

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

  private toNumber(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
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

  private formatDateTimeLabel(value: string, fallbackLabel: string): string {
    if (!value) {
      return fallbackLabel;
    }

    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) {
      return fallbackLabel;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsedDate);
  }

  private startOfToday(): number {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  }

  private isActiveWindow(startDate: string, endDate: string): boolean {
    const today = this.startOfToday();
    return this.toDateValue(startDate) <= today && today <= this.toDateValue(endDate);
  }

  private isUpcomingDate(startDate: string): boolean {
    return !!startDate && this.toDateValue(startDate) > this.startOfToday();
  }

  private isArchivedDate(endDate: string): boolean {
    return !!endDate && this.toDateValue(endDate) < this.startOfToday();
  }

  private computeDurationDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) {
      return 0;
    }

    const startValue = this.toDateValue(startDate);
    const endValue = this.toDateValue(endDate);

    if (!Number.isFinite(startValue) || !Number.isFinite(endValue) || endValue < startValue) {
      return 0;
    }

    return Math.round((endValue - startValue) / 86400000) + 1;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the leave request right now.';
  }

  private normalizeApprovalStatus(value: unknown): LeaveApprovalStatus {
    const normalizedValue = this.normalizeText(value).toLowerCase();

    if (normalizedValue === 'approved') {
      return 'Approved';
    }

    if (normalizedValue === 'rejected') {
      return 'Rejected';
    }

    return 'Pending';
  }

  private getApprovalTone(approvalStatus: LeaveApprovalStatus): LeaveQuality['tone'] {
    if (approvalStatus === 'Approved') {
      return 'strong';
    }

    if (approvalStatus === 'Rejected') {
      return 'critical';
    }

    return 'warning';
  }

  private getCurrentDateTimeString(): string {
    return new Date().toISOString();
  }

  private getCurrentDateString(): string {
    return this.getCurrentDateTimeString().slice(0, 10);
  }

  private escapeCsvValue(value: unknown): string {
    const normalizedValue = typeof value === 'string' ? value : String(value == null ? '' : value);
    return '"' + normalizedValue.replace(/"/g, '""') + '"';
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
