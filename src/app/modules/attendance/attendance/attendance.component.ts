import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import CONFIG from 'src/app/main/urls/urls';

interface AttendanceEmployee {
  id: number;
  fullName: string;
  departmentName: string;
  roleName: string;
}

interface AttendancePaySlip {
  id: number;
  employeeId: number | null;
  issueDate: string;
  cycleLabel: string;
  netSalary: number;
  remarks: string;
}

interface AttendanceRecordView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  departmentName: string;
  roleName: string;
  date: string;
  dateLabel: string;
  checkInTime: string;
  checkOutTime: string;
  source: string;
  sourceSystem: string;
  deviceId: string;
  externalRecordId: string;
  syncBatchId: string;
  importedAt: string;
  importedAtLabel: string;
  notes: string;
  attendanceStatus: string;
  approvalStatus: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewedAtLabel: string;
  lateMinutes: number;
  overtimeMinutes: number;
  workedMinutes: number;
  workedHoursLabel: string;
  isOpen: boolean;
  statusLabel: string;
  statusTone: 'strong' | 'medium' | 'warning';
  payrollStatus: string;
  payrollTone: 'strong' | 'medium' | 'warning';
  linkedPaySlipId: number | null;
  linkedPaySlipCycle: string;
  linkedPaySlipNetSalary: number;
}

interface AttendanceMonthlySummary {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  roleName: string;
  presentDays: number;
  absenceCount: number;
  pendingCount: number;
  approvedCount: number;
  lateArrivalCount: number;
  biometricCount: number;
  overtimeMinutes: number;
  overtimeLabel: string;
  payrollStatus: string;
  payrollTone: 'strong' | 'medium' | 'warning';
  linkedPaySlipId: number | null;
  linkedPaySlipCycle: string;
  linkedPaySlipNetSalary: number;
}

interface AttendanceBiometricImportEntry {
  employeeId: number | null;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  attendanceStatus: string;
  approvalStatus: string;
  deviceId: string;
  externalRecordId: string;
  notes: string;
}

interface AttendanceBiometricImportResponse {
  providerName: string;
  batchId: string;
  importedAt: string;
  importedAtLabel: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
}

type AttendanceFilter =
  | 'all'
  | 'today'
  | 'late'
  | 'open'
  | 'absence'
  | 'pending-approval'
  | 'payroll-ready';
type AttendanceSort = 'latest' | 'employee-asc' | 'most-overtime';
type AttendanceEditorMode = 'create' | 'edit';
type AttendanceBiometricImportMode = 'csv' | 'json';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: AttendanceFilter = 'all';
  activeSort: AttendanceSort = 'latest';
  searchTerm = '';
  reportMonth = this.getTodayString().slice(0, 7);

  modalMode: AttendanceEditorMode = 'create';
  activeAttendanceId: number = null;
  quickClockEmployeeId: number = null;
  biometricImportMode: AttendanceBiometricImportMode = 'csv';
  biometricProviderName = 'HQ biometric bridge';
  biometricDefaultApprovalStatus: 'Pending' | 'Approved' = 'Pending';
  biometricOverwriteExisting = false;
  biometricPayload = '';
  biometricParseError = '';
  biometricSyncing = false;

  employees: AttendanceEmployee[] = [];
  paySlips: AttendancePaySlip[] = [];
  records: AttendanceRecordView[] = [];
  filteredRecords: AttendanceRecordView[] = [];
  featuredRecord: AttendanceRecordView = null;
  biometricPreviewEntries: AttendanceBiometricImportEntry[] = [];
  biometricImportResult: AttendanceBiometricImportResponse | null = null;

  readonly loadingPlaceholders = [1, 2, 3, 4, 5, 6];
  readonly attendanceForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService,
    private httpClient: HttpClient
  ) {
    super();
    this.attendanceForm = this.formBuilder.group({
      employeeId: ['', Validators.required],
      date: ['', Validators.required],
      attendanceStatus: ['Present', Validators.required],
      checkInTime: [''],
      checkOutTime: [''],
      source: ['manual'],
      approvalStatus: ['Pending'],
      notes: ['', [Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    this.loadAttendanceWorkspace();
    this.updateBiometricPreview();
    super.loadScripts();
  }

  get totalRecordsCount(): number {
    return this.monthlyRecords.length;
  }

  get totalOpenCount(): number {
    return this.records.filter((record) => record.isOpen).length;
  }

  get lateArrivalsCount(): number {
    return this.monthlyRecords.filter((record) => record.lateMinutes > 0).length;
  }

  get overtimeRecordCount(): number {
    return this.monthlyRecords.filter((record) => record.overtimeMinutes > 0).length;
  }

  get biometricRecordCount(): number {
    return this.monthlyRecords.filter((record) => record.source === 'Biometric').length;
  }

  get overtimeMinutesTotal(): number {
    return this.monthlyRecords.reduce(
      (sum, record) => sum + record.overtimeMinutes,
      0
    );
  }

  get overtimeHoursLabel(): string {
    return this.formatDurationLabel(this.overtimeMinutesTotal);
  }

  get pendingApprovalCount(): number {
    return this.monthlyRecords.filter((record) => record.approvalStatus === 'Pending').length;
  }

  get absenceCount(): number {
    return this.monthlyRecords.filter((record) => this.isAbsenceStatus(record.attendanceStatus)).length;
  }

  get payrollLinkedCount(): number {
    return this.monthlySummaries.filter((summary) => summary.linkedPaySlipId !== null).length;
  }

  get monthlyRecords(): AttendanceRecordView[] {
    const activeMonth = this.reportMonth || this.getTodayString().slice(0, 7);
    return this.records.filter((record) => record.date.slice(0, 7) === activeMonth);
  }

  get reportMonthLabel(): string {
    const activeMonth = this.reportMonth || this.getTodayString().slice(0, 7);
    return this.formatMonthCycleLabel(activeMonth + '-01');
  }

  get monthlyCoverage(): number {
    const coveredEmployees = new Set(
      this.monthlyRecords
        .map((record) => record.employeeId)
        .filter((employeeId): employeeId is number => !!employeeId)
    ).size;

    return this.toPercent(coveredEmployees, Math.max(this.employees.length, 1));
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredRecords.length);
    const totalCount = this.formatCount(this.records.length);

    return this.filteredRecords.length === this.records.length
      ? filteredCount + ' attendance records'
      : filteredCount + ' of ' + totalCount + ' attendance records';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Add attendance entry' : 'Edit attendance entry';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture presence or absence, route the record through approval, and keep payroll readiness visible.'
      : 'Adjust attendance, review status, and payroll readiness from one workflow.';
  }

  get currentReviewerName(): string {
    return this.authentificationService.getDisplayName();
  }

  get attendanceEditorSourceLabel(): string {
    return this.normalizeSourceLabel(this.attendanceForm.value.source);
  }

  get selectedStatusRequiresTime(): boolean {
    return this.statusRequiresTime(this.attendanceForm.value.attendanceStatus);
  }

  get selectedQuickClockEmployee(): AttendanceEmployee | null {
    return this.employees.find((employee) => employee.id === this.quickClockEmployeeId) || null;
  }

  get selectedQuickClockOpenRecord(): AttendanceRecordView | null {
    const today = this.getTodayString();

    return (
      this.records.find(
        (record) =>
          record.employeeId === this.quickClockEmployeeId &&
          record.date === today &&
          record.isOpen
      ) || null
    );
  }

  get reportLateArrivals(): AttendanceRecordView[] {
    return this.monthlyRecords
      .filter((record) => record.lateMinutes > 0)
      .sort((left, right) => {
        const lateDifference = right.lateMinutes - left.lateMinutes;
        return lateDifference !== 0 ? lateDifference : right.date.localeCompare(left.date);
      });
  }

  get reportOvertimeRecords(): AttendanceRecordView[] {
    return this.monthlyRecords
      .filter((record) => record.overtimeMinutes > 0)
      .sort((left, right) => {
        const overtimeDifference = right.overtimeMinutes - left.overtimeMinutes;
        return overtimeDifference !== 0
          ? overtimeDifference
          : right.date.localeCompare(left.date);
      });
  }

  get monthlySummaries(): AttendanceMonthlySummary[] {
    const activeMonth = this.reportMonth || this.getTodayString().slice(0, 7);
    const summaryMap = new Map<number, AttendanceMonthlySummary>();

    this.monthlyRecords.forEach((record) => {
      if (!record.employeeId) {
        return;
      }

      const existing = summaryMap.get(record.employeeId) || {
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        departmentName: record.departmentName,
        roleName: record.roleName,
        presentDays: 0,
        absenceCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        lateArrivalCount: 0,
        biometricCount: 0,
        overtimeMinutes: 0,
        overtimeLabel: '0h 00m',
        payrollStatus: 'Awaiting approval',
        payrollTone: 'warning' as AttendanceMonthlySummary['payrollTone'],
        linkedPaySlipId: null,
        linkedPaySlipCycle: '',
        linkedPaySlipNetSalary: 0,
      };

      existing.presentDays += this.isAbsenceStatus(record.attendanceStatus) ? 0 : 1;
      existing.absenceCount += this.isAbsenceStatus(record.attendanceStatus) ? 1 : 0;
      existing.pendingCount += record.approvalStatus === 'Pending' ? 1 : 0;
      existing.approvedCount += record.approvalStatus === 'Approved' ? 1 : 0;
      existing.lateArrivalCount += record.lateMinutes > 0 ? 1 : 0;
      existing.biometricCount += record.source === 'Biometric' ? 1 : 0;
      existing.overtimeMinutes += record.overtimeMinutes;
      existing.overtimeLabel = this.formatDurationLabel(existing.overtimeMinutes);
      summaryMap.set(record.employeeId, existing);
    });

    return Array.from(summaryMap.values())
      .map((summary) => {
        const linkedPaySlip = this.findLinkedPaySlip(summary.employeeId, activeMonth + '-01');
        const payrollState = this.resolvePayrollStatus(
          summary.absenceCount > 0 ? 'Absent' : 'Present',
          summary.pendingCount > 0 ? 'Pending' : 'Approved',
          linkedPaySlip
        );

        return {
          ...summary,
          payrollStatus: payrollState.label,
          payrollTone: payrollState.tone,
          linkedPaySlipId: linkedPaySlip ? linkedPaySlip.id : null,
          linkedPaySlipCycle: linkedPaySlip ? linkedPaySlip.cycleLabel : '',
          linkedPaySlipNetSalary: linkedPaySlip ? linkedPaySlip.netSalary : 0,
        };
      })
      .sort((left, right) => {
        const dayDifference = right.presentDays - left.presentDays;
        return dayDifference !== 0
          ? dayDifference
          : left.employeeName.localeCompare(right.employeeName);
      });
  }

  get featuredRecommendation(): string {
    if (!this.featuredRecord) {
      return 'Select an attendance record to inspect absence state, approval flow, and payroll impact.';
    }

    if (
      this.featuredRecord.source === 'Biometric' &&
      this.featuredRecord.approvalStatus === 'Pending'
    ) {
      return 'This biometric punch was imported for HR review. Verify the exception details before approving it for payroll.';
    }

    if (this.featuredRecord.approvalStatus === 'Pending') {
      return 'This record is still waiting for review. Approve or reject it before payroll closes.';
    }

    if (this.featuredRecord.approvalStatus === 'Rejected') {
      return 'This record is blocked from payroll until the attendance details are corrected and resubmitted.';
    }

    if (this.featuredRecord.payrollStatus === 'Ready for payroll') {
      return 'This record is approved and ready to flow into the current payroll cycle.';
    }

    if (this.featuredRecord.payrollStatus === 'Needs deduction review') {
      return 'This non-working day is approved, but payroll should review the deduction impact before issuing the pay slip.';
    }

    if (this.featuredRecord.overtimeMinutes > 0) {
      return 'This approved record includes overtime and is already visible for payroll review.';
    }

    return 'This attendance entry is aligned and already linked to the current payroll cycle.';
  }

  openCreateModal(employeeId?: number): void {
    this.modalMode = 'create';
    this.activeAttendanceId = null;
    this.submitted = false;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    this.attendanceForm.reset({
      employeeId: employeeId || this.quickClockEmployeeId || '',
      date: this.getTodayString(),
      attendanceStatus: 'Present',
      checkInTime: currentTime,
      checkOutTime: '',
      source: 'manual',
      approvalStatus: 'Pending',
      notes: '',
    });
  }

  openEditModal(record: AttendanceRecordView): void {
    this.modalMode = 'edit';
    this.activeAttendanceId = record.id;
    this.submitted = false;
    this.selectRecord(record);
    this.attendanceForm.reset({
      employeeId: record.employeeId || '',
      date: record.date,
      attendanceStatus: record.attendanceStatus,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      source: record.source.toLowerCase(),
      approvalStatus: record.approvalStatus,
      notes: record.notes,
    });
  }

  selectRecord(record: AttendanceRecordView): void {
    this.featuredRecord = record;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: AttendanceFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: AttendanceSort): void {
    this.activeSort = value || 'latest';
    this.applyFilters();
  }

  setReportMonth(value: string): void {
    this.reportMonth = value || this.getTodayString().slice(0, 7);
  }

  refreshAttendance(): void {
    this.loadAttendanceWorkspace(true);
  }

  trackByRecordId(index: number, record: AttendanceRecordView): number {
    return record.id || index;
  }

  onBiometricImportModeChange(value: AttendanceBiometricImportMode): void {
    this.biometricImportMode = value || 'csv';
    this.updateBiometricPreview();
  }

  onBiometricPayloadChange(value: string): void {
    this.biometricPayload = value || '';
    this.updateBiometricPreview();
  }

  loadBiometricSample(): void {
    const firstEmployee = this.employees[0];
    const secondEmployee = this.employees[1] || firstEmployee;
    const today = this.getTodayString();
    const firstName = firstEmployee ? firstEmployee.fullName : 'Nadia Rahman';
    const secondName = secondEmployee ? secondEmployee.fullName : 'Priya Nair';
    const firstId = firstEmployee ? String(firstEmployee.id) : '1';
    const secondId = secondEmployee ? String(secondEmployee.id) : '2';

    if (this.biometricImportMode === 'json') {
      this.biometricPayload = JSON.stringify(
        {
          providerName: this.biometricProviderName,
          entries: [
            {
              employeeId: Number(firstId),
              employeeName: firstName,
              date: today,
              checkInTime: '08:56',
              checkOutTime: '17:48',
              deviceId: 'GATE-01',
              externalRecordId: 'gate-01-' + today + '-01',
              notes: 'Morning gate export',
            },
            {
              employeeId: Number(secondId),
              employeeName: secondName,
              date: today,
              checkInTime: '09:18',
              checkOutTime: '18:07',
              deviceId: 'GATE-02',
              externalRecordId: 'gate-02-' + today + '-02',
              notes: 'Late arrival flagged by the biometric feed',
            },
          ],
        },
        null,
        2
      );
    } else {
      this.biometricPayload =
        'employeeId,employeeName,date,checkInTime,checkOutTime,deviceId,externalRecordId,notes\n' +
        firstId +
        ',' +
        firstName +
        ',' +
        today +
        ',08:56,17:48,GATE-01,gate-01-' +
        today +
        '-01,Morning gate export\n' +
        secondId +
        ',' +
        secondName +
        ',' +
        today +
        ',09:18,18:07,GATE-02,gate-02-' +
        today +
        '-02,Late arrival flagged by the biometric feed';
    }

    this.updateBiometricPreview();
  }

  async onBiometricFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input && input.files && input.files[0];

    if (!file) {
      return;
    }

    try {
      const payload = await this.readFileText(file);
      this.biometricPayload = payload;

      if (file.name.toLowerCase().endsWith('.json')) {
        this.biometricImportMode = 'json';
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        this.biometricImportMode = 'csv';
      }

      this.updateBiometricPreview();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      input.value = '';
    }
  }

  async syncBiometricEntries(): Promise<void> {
    if (this.biometricParseError || !this.biometricPreviewEntries.length) {
      super.show('Error', 'Stage at least one valid biometric record before syncing.', 'warning');
      return;
    }

    this.biometricSyncing = true;

    try {
      const response = await this.httpClient
        .post<AttendanceBiometricImportResponse>(
          CONFIG.URL_BASE + '/api/attendances/biometric-import',
          {
            providerName: this.biometricProviderName,
            approvalStatus: this.biometricDefaultApprovalStatus,
            overwriteExisting: this.biometricOverwriteExisting,
            entries: this.biometricPreviewEntries,
          },
          {
            headers: this.authentificationService.getAuthHeaders(true),
          }
        )
        .toPromise();

      this.biometricImportResult = {
        providerName: response && response.providerName ? response.providerName : this.biometricProviderName,
        batchId: response && response.batchId ? response.batchId : '',
        importedAt: response && response.importedAt ? response.importedAt : '',
        importedAtLabel: this.formatDateTimeLabel(
          response && response.importedAt ? response.importedAt : '',
          'Just now'
        ),
        importedCount: response && Number.isFinite(response.importedCount) ? response.importedCount : 0,
        updatedCount: response && Number.isFinite(response.updatedCount) ? response.updatedCount : 0,
        skippedCount: response && Number.isFinite(response.skippedCount) ? response.skippedCount : 0,
        errors: response && Array.isArray(response.errors) ? response.errors : [],
      };

      super.show('Confirmation', 'Biometric attendance synced successfully.', 'success');
      this.loadAttendanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.biometricSyncing = false;
    }
  }

  exportMonthlyReport(): void {
    if (!this.monthlyRecords.length) {
      super.show('Error', 'There are no attendance records in the selected report month.', 'warning');
      return;
    }

    const rows = [
      [
        'Employee',
        'Department',
        'Role',
        'Date',
        'Status',
        'Check In',
        'Check Out',
        'Worked Minutes',
        'Late Minutes',
        'Overtime Minutes',
        'Approval',
        'Payroll',
        'Source',
        'Source System',
        'Device',
        'Notes',
      ],
      ...this.monthlyRecords.map((record) => [
        record.employeeName,
        record.departmentName,
        record.roleName,
        record.date,
        record.attendanceStatus,
        record.checkInTime || '',
        record.checkOutTime || '',
        String(record.workedMinutes),
        String(record.lateMinutes),
        String(record.overtimeMinutes),
        record.approvalStatus,
        record.payrollStatus,
        record.source,
        record.sourceSystem,
        record.deviceId,
        record.notes,
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
      .join('\r\n');

    this.downloadCsv('attendance-report-' + this.reportMonth + '.csv', csvContent);
    super.show('Confirmation', 'Monthly attendance report exported.', 'success');
  }

  async clockInSelectedEmployee(): Promise<void> {
    if (!this.selectedQuickClockEmployee || this.selectedQuickClockOpenRecord) {
      return;
    }

    const now = new Date();
    await this.createAttendanceRecord(
      {
        employee: { id: this.selectedQuickClockEmployee.id },
        date: this.getTodayString(),
        checkInTime: now.toTimeString().slice(0, 8),
        checkOutTime: null,
        source: 'self-service',
        notes: 'Clocked in from the attendance workspace.',
        attendanceStatus: 'Present',
        approvalStatus: 'Pending',
        reviewedBy: null,
        reviewedAt: null,
      },
      'Employee clocked in successfully.'
    );
  }

  async clockOutSelectedEmployee(): Promise<void> {
    if (!this.selectedQuickClockOpenRecord) {
      return;
    }

    const now = new Date();
    await this.updateAttendanceRecord(
      this.selectedQuickClockOpenRecord.id,
      {
        employee: { id: this.selectedQuickClockOpenRecord.employeeId },
        date: this.selectedQuickClockOpenRecord.date,
        checkInTime: this.toApiTimeValue(this.selectedQuickClockOpenRecord.checkInTime),
        checkOutTime: now.toTimeString().slice(0, 8),
        source: this.selectedQuickClockOpenRecord.source.toLowerCase(),
        notes:
          this.selectedQuickClockOpenRecord.notes ||
          'Clocked out from the attendance workspace.',
        attendanceStatus: 'Present',
        approvalStatus: 'Pending',
        reviewedBy: null,
        reviewedAt: null,
      },
      'Employee clocked out successfully.'
    );
  }

  async approveRecord(record: AttendanceRecordView): Promise<void> {
    if (!record || record.approvalStatus === 'Approved') {
      return;
    }

    await this.updateAttendanceRecord(
      record.id,
      this.buildRecordPayload(record, 'Approved'),
      'Attendance approved successfully.'
    );
  }

  async rejectRecord(record: AttendanceRecordView): Promise<void> {
    if (!record || record.approvalStatus === 'Rejected') {
      return;
    }

    await this.updateAttendanceRecord(
      record.id,
      this.buildRecordPayload(record, 'Rejected'),
      'Attendance rejected successfully.'
    );
  }

  async saveAttendance(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeAttendanceId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/attendances/' + this.activeAttendanceId,
          payload
        );
        super.show('Confirmation', 'Attendance updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/attendances', payload);
        super.show('Confirmation', 'Attendance created successfully.', 'success');
      }

      this.closeCrudModal();
      this.openCreateModal();
      this.loadAttendanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteRecord(record: AttendanceRecordView): Promise<void> {
    const confirmed = confirm(
      'Delete attendance for "' + record.employeeName + '" on ' + record.dateLabel + '?'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = record.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/attendances/' + record.id);
      super.show('Confirmation', 'Attendance deleted successfully.', 'success');

      if (this.featuredRecord && this.featuredRecord.id === record.id) {
        this.featuredRecord = null;
      }

      this.loadAttendanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  statusRequiresTime(status: string): boolean {
    const normalizedStatus = this.normalizeAttendanceStatus(status);
    return normalizedStatus !== 'Absent' && normalizedStatus !== 'On leave';
  }

  isAbsenceStatus(status: string): boolean {
    const normalizedStatus = this.normalizeAttendanceStatus(status);
    return normalizedStatus === 'Absent' || normalizedStatus === 'On leave';
  }

  private async createAttendanceRecord(payload: any, successMessage: string): Promise<void> {
    this.saving = true;

    try {
      await this.httpService.create(CONFIG.URL_BASE + '/api/attendances', payload);
      super.show('Confirmation', successMessage, 'success');
      this.loadAttendanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  private async updateAttendanceRecord(
    attendanceId: number,
    payload: any,
    successMessage: string
  ): Promise<void> {
    this.saving = true;

    try {
      await this.httpService.update(
        CONFIG.URL_BASE + '/api/attendances/' + attendanceId,
        payload
      );
      super.show('Confirmation', successMessage, 'success');
      this.loadAttendanceWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  private loadAttendanceWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
      records: this.httpService.getAll(CONFIG.URL_BASE + '/api/attendances'),
      paySlips: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/pay-slips')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployees(result.employees);
          this.paySlips = this.normalizePaySlips(result.paySlips);
          this.records = this.normalizeRecords(result.records);

          if (!this.quickClockEmployeeId && this.employees.length) {
            this.quickClockEmployeeId = this.employees[0].id;
          }

          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Attendance refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.records = [];
          this.filteredRecords = [];
          this.featuredRecord = null;
          this.paySlips = [];
          this.loadError = 'Unable to load attendance records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private applyFilters(): void {
    const today = this.getTodayString();
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredRecords = this.records
      .filter((record) => {
        const matchesSearch =
          !searchValue ||
          record.employeeName.toLowerCase().includes(searchValue) ||
          record.departmentName.toLowerCase().includes(searchValue) ||
          record.roleName.toLowerCase().includes(searchValue) ||
          record.attendanceStatus.toLowerCase().includes(searchValue) ||
          record.approvalStatus.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'today'
            ? record.date === today
            : this.activeFilter === 'late'
            ? record.lateMinutes > 0
            : this.activeFilter === 'open'
            ? record.isOpen
            : this.activeFilter === 'absence'
            ? this.isAbsenceStatus(record.attendanceStatus)
            : this.activeFilter === 'pending-approval'
            ? record.approvalStatus === 'Pending'
            : record.payrollStatus === 'Ready for payroll' ||
              record.payrollStatus === 'Linked to pay slip';

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'most-overtime') {
          const overtimeDifference = right.overtimeMinutes - left.overtimeMinutes;
          return overtimeDifference !== 0
            ? overtimeDifference
            : right.date.localeCompare(left.date);
        }

        const dateDifference = right.date.localeCompare(left.date);
        return dateDifference !== 0
          ? dateDifference
          : right.checkInTime.localeCompare(left.checkInTime);
      });

    if (!this.filteredRecords.length) {
      this.featuredRecord = null;
      return;
    }

    if (
      !this.featuredRecord ||
      !this.filteredRecords.some((record) => record.id === this.featuredRecord.id)
    ) {
      this.featuredRecord = this.filteredRecords[0];
    }
  }

  private normalizeEmployees(data: unknown): AttendanceEmployee[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => ({
        id: this.normalizeNumericId(item && item.id) || index + 1,
        fullName: this.normalizeText(item && item.fullName) || 'Unnamed employee',
        departmentName:
          this.normalizeText(item && item.department && item.department.name) ||
          'Unassigned',
        roleName:
          this.normalizeText(item && item.role && item.role.name) ||
          this.normalizeText(item && item.job && item.job.name) ||
          'Role pending',
      }))
      .filter((item) => !!item.fullName);
  }

  private normalizePaySlips(data: unknown): AttendancePaySlip[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => {
        const issueDate = this.normalizeDateString(item && item.issueDate);

        return {
          id: this.normalizeNumericId(item && item.id) || index + 1,
          employeeId: this.normalizeNumericId(item && item.employee && item.employee.id),
          issueDate,
          cycleLabel: this.formatMonthCycleLabel(issueDate),
          netSalary: this.toAmount(item && item.netSalary),
          remarks: this.normalizeText(item && item.remarks),
        };
      })
      .filter((item) => !!item.employeeId)
      .sort((left, right) => right.issueDate.localeCompare(left.issueDate));
  }

  private normalizeRecords(data: unknown): AttendanceRecordView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => {
        const employeeId = this.normalizeNumericId(item && item.employee && item.employee.id);
        const employee = this.employees.find((entry) => entry.id === employeeId);
        const date = this.normalizeDateString(item && item.date);
        const checkInTime = this.normalizeTimeString(item && item.checkInTime);
        const checkOutTime = this.normalizeTimeString(item && item.checkOutTime);
        const attendanceStatus = this.normalizeAttendanceStatus(
          item && item.attendanceStatus,
          checkInTime,
          checkOutTime
        );
        const isOpen = this.statusRequiresTime(attendanceStatus) && !!checkInTime && !checkOutTime;
        const approvalStatus = this.normalizeApprovalStatus(
          item && item.approvalStatus,
          isOpen
        );
        const lateMinutes = this.isAbsenceStatus(attendanceStatus)
          ? 0
          : this.calculateLateMinutes(checkInTime);
        const workedMinutes = this.isAbsenceStatus(attendanceStatus)
          ? 0
          : this.calculateWorkedMinutes(checkInTime, checkOutTime);
        const overtimeMinutes = Math.max(0, workedMinutes - 8 * 60);
        const linkedPaySlip = this.findLinkedPaySlip(employeeId, date);
        const payrollState = this.resolvePayrollStatus(
          attendanceStatus,
          approvalStatus,
          linkedPaySlip
        );
        const operationalState = this.resolveOperationalState(
          attendanceStatus,
          approvalStatus,
          isOpen,
          lateMinutes,
          overtimeMinutes
        );
        const reviewedAt = this.normalizeDateTimeString(item && item.reviewedAt);

        return {
          id: this.normalizeNumericId(item && item.id) || index + 1,
          employeeId,
          employeeName: employee ? employee.fullName : 'Employee',
          departmentName: employee ? employee.departmentName : 'Unassigned',
          roleName: employee ? employee.roleName : 'Role pending',
          date,
          dateLabel: this.formatDateLabel(date, 'Date not set'),
          checkInTime,
          checkOutTime,
          source: this.normalizeSourceLabel(item && item.source),
          sourceSystem: this.normalizeText(item && item.sourceSystem),
          deviceId: this.normalizeText(item && item.deviceId),
          externalRecordId: this.normalizeText(item && item.externalRecordId),
          syncBatchId: this.normalizeText(item && item.syncBatchId),
          importedAt: this.normalizeDateTimeString(item && item.importedAt),
          importedAtLabel: this.formatDateTimeLabel(
            this.normalizeDateTimeString(item && item.importedAt),
            'Not imported'
          ),
          notes: this.normalizeText(item && item.notes),
          attendanceStatus,
          approvalStatus,
          reviewedBy: this.normalizeText(item && item.reviewedBy),
          reviewedAt,
          reviewedAtLabel: this.formatDateTimeLabel(reviewedAt, 'Not reviewed yet'),
          lateMinutes,
          overtimeMinutes,
          workedMinutes,
          workedHoursLabel: this.formatDurationLabel(workedMinutes),
          isOpen,
          statusLabel: operationalState.label,
          statusTone: operationalState.tone,
          payrollStatus: payrollState.label,
          payrollTone: payrollState.tone,
          linkedPaySlipId: linkedPaySlip ? linkedPaySlip.id : null,
          linkedPaySlipCycle: linkedPaySlip ? linkedPaySlip.cycleLabel : '',
          linkedPaySlipNetSalary: linkedPaySlip ? linkedPaySlip.netSalary : 0,
        };
      })
      .sort((left, right) => right.date.localeCompare(left.date));
  }

  private buildPayload(): any | null {
    const employeeId = this.normalizeNumericId(this.attendanceForm.value.employeeId);
    const date = this.normalizeDateString(this.attendanceForm.value.date);
    const attendanceStatus = this.normalizeAttendanceStatus(
      this.attendanceForm.value.attendanceStatus
    );
    const approvalStatus = this.normalizeApprovalStatus(
      this.attendanceForm.value.approvalStatus,
      false
    );
    const requiresTime = this.statusRequiresTime(attendanceStatus);
    const checkInTime = this.normalizeTimeString(this.attendanceForm.value.checkInTime);
    const checkOutTime = this.normalizeTimeString(this.attendanceForm.value.checkOutTime);
    const source = this.normalizeText(this.attendanceForm.value.source) || 'manual';
    const notes = this.normalizeText(this.attendanceForm.value.notes);

    this.attendanceForm.patchValue(
      {
        employeeId: employeeId || '',
        date,
        attendanceStatus,
        checkInTime: requiresTime ? checkInTime : '',
        checkOutTime: requiresTime ? checkOutTime : '',
        source,
        approvalStatus,
        notes,
      },
      { emitEvent: false }
    );

    if (!employeeId || !date || (requiresTime && !checkInTime)) {
      return null;
    }

    if (this.attendanceForm.invalid) {
      return null;
    }

    return {
      employee: { id: employeeId },
      date,
      checkInTime: requiresTime && checkInTime ? this.toApiTimeValue(checkInTime) : null,
      checkOutTime: requiresTime && checkOutTime ? this.toApiTimeValue(checkOutTime) : null,
      source,
      notes,
      attendanceStatus,
      approvalStatus,
      reviewedBy: approvalStatus === 'Pending' ? null : this.currentReviewerName,
      reviewedAt:
        approvalStatus === 'Pending' ? null : this.getCurrentDateTimeString(),
    };
  }

  private buildRecordPayload(
    record: AttendanceRecordView,
    approvalStatus: 'Pending' | 'Approved' | 'Rejected'
  ): any {
    const reviewDateTime =
      approvalStatus === 'Pending' ? null : this.getCurrentDateTimeString();

    return {
      employee: { id: record.employeeId },
      date: record.date,
      checkInTime: record.checkInTime ? this.toApiTimeValue(record.checkInTime) : null,
      checkOutTime: record.checkOutTime ? this.toApiTimeValue(record.checkOutTime) : null,
      source: record.source.toLowerCase(),
      notes: record.notes,
      attendanceStatus: record.attendanceStatus,
      approvalStatus,
      reviewedBy: approvalStatus === 'Pending' ? null : this.currentReviewerName,
      reviewedAt: reviewDateTime,
    };
  }

  private findLinkedPaySlip(
    employeeId: number | null,
    date: string
  ): AttendancePaySlip | null {
    if (!employeeId || !date) {
      return null;
    }

    const cycle = date.slice(0, 7);

    return (
      this.paySlips.find(
        (paySlip) => paySlip.employeeId === employeeId && paySlip.issueDate.slice(0, 7) === cycle
      ) || null
    );
  }

  private resolveOperationalState(
    attendanceStatus: string,
    approvalStatus: string,
    isOpen: boolean,
    lateMinutes: number,
    overtimeMinutes: number
  ): { label: string; tone: AttendanceRecordView['statusTone'] } {
    if (approvalStatus === 'Rejected') {
      return { label: 'Rejected', tone: 'warning' };
    }

    if (approvalStatus === 'Pending') {
      return { label: 'Pending approval', tone: 'medium' };
    }

    if (isOpen) {
      return { label: 'Open shift', tone: 'warning' };
    }

    if (this.isAbsenceStatus(attendanceStatus)) {
      return { label: attendanceStatus, tone: 'medium' };
    }

    if (lateMinutes > 0) {
      return { label: 'Late arrival', tone: 'warning' };
    }

    if (overtimeMinutes > 0) {
      return { label: 'Overtime', tone: 'medium' };
    }

    return { label: 'Approved', tone: 'strong' };
  }

  private resolvePayrollStatus(
    attendanceStatus: string,
    approvalStatus: string,
    linkedPaySlip: AttendancePaySlip | null
  ): { label: string; tone: AttendanceRecordView['payrollTone'] } {
    if (approvalStatus === 'Rejected') {
      return { label: 'Blocked', tone: 'warning' };
    }

    if (approvalStatus === 'Pending') {
      return { label: 'Awaiting approval', tone: 'warning' };
    }

    if (linkedPaySlip) {
      return { label: 'Linked to pay slip', tone: 'strong' };
    }

    if (this.isAbsenceStatus(attendanceStatus)) {
      return { label: 'Needs deduction review', tone: 'medium' };
    }

    return { label: 'Ready for payroll', tone: 'medium' };
  }

  private updateBiometricPreview(): void {
    const payload = this.biometricPayload.trim();

    if (!payload) {
      this.biometricPreviewEntries = [];
      this.biometricParseError = '';
      return;
    }

    try {
      this.biometricPreviewEntries =
        this.biometricImportMode === 'json'
          ? this.parseBiometricJsonPayload(payload)
          : this.parseBiometricCsvPayload(payload);
      this.biometricParseError = this.biometricPreviewEntries.length
        ? ''
        : 'No biometric rows were found in the current payload.';
    } catch (error) {
      this.biometricPreviewEntries = [];
      this.biometricParseError =
        error instanceof Error
          ? error.message
          : 'Unable to parse the biometric payload.';
    }
  }

  private parseBiometricJsonPayload(payload: string): AttendanceBiometricImportEntry[] {
    const parsedPayload = JSON.parse(payload);
    const rawEntries = Array.isArray(parsedPayload)
      ? parsedPayload
      : Array.isArray(parsedPayload && parsedPayload.entries)
      ? parsedPayload.entries
      : null;

    if (!rawEntries) {
      throw new Error('JSON biometric payload must be an array or an object with an entries array.');
    }

    return rawEntries
      .map((entry) => this.normalizeBiometricImportEntry(entry))
      .filter((entry) => this.hasBiometricEntryData(entry));
  }

  private parseBiometricCsvPayload(payload: string): AttendanceBiometricImportEntry[] {
    const rows = payload
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => !!line);

    if (rows.length < 2) {
      throw new Error('CSV biometric payload must include a header row and at least one record.');
    }

    const headerValues = this.parseCsvRow(rows[0]).map((header) =>
      header.toLowerCase().replace(/[\s_-]+/g, '')
    );

    return rows
      .slice(1)
      .map((row) => {
        const columnValues = this.parseCsvRow(row);
        const entry: Record<string, string> = {};

        headerValues.forEach((header, index) => {
          entry[header] = columnValues[index] || '';
        });

        return this.normalizeBiometricImportEntry({
          employeeId: entry.employeeid,
          employeeName: entry.employeename,
          date: entry.date,
          checkInTime: entry.checkintime,
          checkOutTime: entry.checkouttime,
          attendanceStatus: entry.attendancestatus,
          approvalStatus: entry.approvalstatus,
          deviceId: entry.deviceid,
          externalRecordId: entry.externalrecordid,
          notes: entry.notes,
        });
      })
      .filter((entry) => this.hasBiometricEntryData(entry));
  }

  private normalizeBiometricImportEntry(value: unknown): AttendanceBiometricImportEntry {
    const entry = (value || {}) as Record<string, unknown>;

    return {
      employeeId: this.normalizeNumericId(entry.employeeId),
      employeeName: this.normalizeText(entry.employeeName),
      date: this.normalizeDateString(entry.date),
      checkInTime: this.normalizeTimeString(entry.checkInTime),
      checkOutTime: this.normalizeTimeString(entry.checkOutTime),
      attendanceStatus: this.normalizeAttendanceStatus(
        entry.attendanceStatus,
        this.normalizeTimeString(entry.checkInTime),
        this.normalizeTimeString(entry.checkOutTime)
      ),
      approvalStatus: this.normalizeApprovalStatus(entry.approvalStatus, false),
      deviceId: this.normalizeText(entry.deviceId),
      externalRecordId: this.normalizeText(entry.externalRecordId),
      notes: this.normalizeText(entry.notes),
    };
  }

  private hasBiometricEntryData(entry: AttendanceBiometricImportEntry): boolean {
    return !!(
      entry.employeeId ||
      entry.employeeName ||
      entry.date ||
      entry.checkInTime ||
      entry.checkOutTime ||
      entry.externalRecordId ||
      entry.notes
    );
  }

  private parseCsvRow(row: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let index = 0; index < row.length; index++) {
      const character = row[index];

      if (character === '"') {
        if (insideQuotes && row[index + 1] === '"') {
          currentValue += '"';
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }

        continue;
      }

      if (character === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }

      currentValue += character;
    }

    values.push(currentValue.trim());
    return values;
  }

  private async readFileText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };

      reader.onerror = () => {
        reject(new Error('Unable to read the selected biometric export.'));
      };

      reader.readAsText(file);
    });
  }

  private escapeCsvValue(value: string): string {
    const normalizedValue = value == null ? '' : String(value);

    return /[",\n]/.test(normalizedValue)
      ? '"' + normalizedValue.replace(/"/g, '""') + '"'
      : normalizedValue;
  }

  private downloadCsv(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(objectUrl);
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('attendanceCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeDateString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeDateTimeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeTimeString(value: unknown): string {
    const normalizedValue = this.normalizeText(value);
    return normalizedValue.length >= 5 ? normalizedValue.slice(0, 5) : normalizedValue;
  }

  private normalizeSourceLabel(value: unknown): string {
    const normalizedValue = this.normalizeText(value).toLowerCase();

    if (normalizedValue === 'self-service') {
      return 'Self-service';
    }

    if (normalizedValue === 'biometric') {
      return 'Biometric';
    }

    return 'Manual';
  }

  private normalizeAttendanceStatus(
    value: unknown,
    checkInTime = '',
    checkOutTime = ''
  ): string {
    const normalizedValue = this.normalizeText(value).toLowerCase();

    if (normalizedValue === 'remote') {
      return 'Remote';
    }

    if (normalizedValue === 'half day' || normalizedValue === 'half-day') {
      return 'Half day';
    }

    if (normalizedValue === 'on leave' || normalizedValue === 'leave') {
      return 'On leave';
    }

    if (normalizedValue === 'absent') {
      return 'Absent';
    }

    if (normalizedValue === 'present') {
      return 'Present';
    }

    return checkInTime || checkOutTime ? 'Present' : 'Absent';
  }

  private normalizeApprovalStatus(value: unknown, isOpen: boolean): string {
    const normalizedValue = this.normalizeText(value).toLowerCase();

    if (normalizedValue === 'approved') {
      return 'Approved';
    }

    if (normalizedValue === 'rejected') {
      return 'Rejected';
    }

    if (normalizedValue === 'pending') {
      return 'Pending';
    }

    return isOpen ? 'Pending' : 'Approved';
  }

  private toApiTimeValue(value: string): string {
    return value.length === 5 ? value + ':00' : value;
  }

  private normalizeNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
  }

  private toAmount(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private parseTimeToMinutes(value: string): number {
    if (!value) {
      return 0;
    }

    const [hoursValue, minutesValue] = value.split(':');
    const hours = Number(hoursValue);
    const minutes = Number(minutesValue);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return 0;
    }

    return hours * 60 + minutes;
  }

  private calculateLateMinutes(checkInTime: string): number {
    if (!checkInTime) {
      return 0;
    }

    return Math.max(0, this.parseTimeToMinutes(checkInTime) - 9 * 60);
  }

  private calculateWorkedMinutes(checkInTime: string, checkOutTime: string): number {
    if (!checkInTime || !checkOutTime) {
      return 0;
    }

    return Math.max(
      0,
      this.parseTimeToMinutes(checkOutTime) - this.parseTimeToMinutes(checkInTime)
    );
  }

  private formatDurationLabel(totalMinutes: number): string {
    const hours = Math.floor(Math.max(totalMinutes, 0) / 60);
    const minutes = Math.max(totalMinutes, 0) % 60;
    return hours + 'h ' + String(minutes).padStart(2, '0') + 'm';
  }

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getCurrentDateTimeString(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;
  }

  private formatDateLabel(value: string, fallback: string): string {
    if (!value) {
      return fallback;
    }

    const parsedDate = new Date(value.length === 10 ? value + 'T00:00:00' : value);

    if (Number.isNaN(parsedDate.getTime())) {
      return fallback;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatDateTimeLabel(value: string, fallback: string): string {
    if (!value) {
      return fallback;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return fallback;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsedDate);
  }

  private formatMonthCycleLabel(value: string): string {
    if (!value) {
      return 'Payroll cycle pending';
    }

    const parsedDate = new Date(value.length === 10 ? value + 'T00:00:00' : value);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Payroll cycle pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the attendance request right now.';
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