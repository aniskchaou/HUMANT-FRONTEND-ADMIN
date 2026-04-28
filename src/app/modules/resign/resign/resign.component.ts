import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface ResignationReference {
  id: number;
  name: string;
}

interface WorkflowEmployeeContext extends ResignationReference {
  departmentId: number | null;
  departmentName: string;
}

interface ResignationQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface ResignationView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  departmentId: number | null;
  departmentName: string;
  resignationDate: string;
  resignationDateLabel: string;
  resignationReason: string;
  summary: string;
  scheduled: boolean;
  recent: boolean;
  documented: boolean;
  qualityLabel: ResignationQuality['label'];
  qualityTone: ResignationQuality['tone'];
  qualityScore: number;
}

interface ExitRequestView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  requestDate: string;
  requestDateLabel: string;
  lastWorkingDay: string;
  lastWorkingDayLabel: string;
  status: string;
  statusLabel: string;
  reason: string;
  submittedAt: string;
  summary: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
}

interface ExitInterviewView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  interviewDate: string;
  interviewDateLabel: string;
  interviewerName: string;
  feedback: string;
  suggestions: string;
  summary: string;
}

interface ClearanceView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  clearanceType: string;
  clearanceDate: string;
  clearanceDateLabel: string;
  isCleared: boolean;
  remarks: string;
  summary: string;
  tone: 'strong' | 'warning';
}

interface FinalSettlementView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  settlementDate: string;
  settlementDateLabel: string;
  totalAmount: number;
  remarks: string;
  summary: string;
}

type ResignationFilter = 'all' | 'scheduled' | 'recent' | 'needs-context';
type ResignationSort = 'latest-date' | 'employee-asc' | 'department-asc';
type ResignationEditorMode = 'create' | 'edit';
type WorkflowEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-resign',
  templateUrl: './resign.component.html',
  styleUrls: ['./resign.component.css'],
})
export class ResignComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  savingExitRequest = false;
  savingExitInterview = false;
  savingClearance = false;
  savingFinalSettlement = false;
  submitted = false;
  exitRequestSubmitted = false;
  exitInterviewSubmitted = false;
  clearanceSubmitted = false;
  finalSettlementSubmitted = false;
  deletingId: number = null;
  loadError = '';

  activeFilter: ResignationFilter = 'all';
  activeSort: ResignationSort = 'latest-date';
  searchTerm = '';

  modalMode: ResignationEditorMode = 'create';
  activeResignationId: number = null;
  exitRequestEditorMode: WorkflowEditorMode = 'create';
  exitInterviewEditorMode: WorkflowEditorMode = 'create';
  clearanceEditorMode: WorkflowEditorMode = 'create';
  finalSettlementEditorMode: WorkflowEditorMode = 'create';

  activeExitRequestId: number = null;
  activeExitInterviewId: number = null;
  activeClearanceId: number = null;
  activeFinalSettlementId: number = null;

  resignations: ResignationView[] = [];
  filteredResignations: ResignationView[] = [];
  featuredResignation: ResignationView = null;

  employees: ResignationReference[] = [];
  departments: ResignationReference[] = [];
  currentEmployee: WorkflowEmployeeContext = null;
  exitRequests: ExitRequestView[] = [];
  exitInterviews: ExitInterviewView[] = [];
  clearances: ClearanceView[] = [];
  finalSettlements: FinalSettlementView[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly exitRequestStatusOptions = ['PENDING', 'APPROVED', 'REJECTED'];
  readonly clearanceTypeOptions = [
    'Knowledge transfer',
    'IT assets',
    'Security',
    'Finance',
    'Administration',
  ];
  readonly resignationForm: FormGroup;
  readonly exitRequestForm: FormGroup;
  readonly exitInterviewForm: FormGroup;
  readonly clearanceForm: FormGroup;
  readonly finalSettlementForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService
  ) {
    super();
    this.resignationForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      resignationDate: ['', [Validators.required]],
      resignationReason: ['', [Validators.required, Validators.maxLength(400)]],
    });
    this.exitRequestForm = this.formBuilder.group({
      requestDate: ['', [Validators.required]],
      lastWorkingDay: ['', [Validators.required]],
      status: ['PENDING', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(400)]],
    });
    this.exitInterviewForm = this.formBuilder.group({
      interviewDate: ['', [Validators.required]],
      interviewerName: ['', [Validators.required, Validators.maxLength(120)]],
      feedback: ['', [Validators.required, Validators.maxLength(500)]],
      suggestions: ['', [Validators.maxLength(500)]],
    });
    this.clearanceForm = this.formBuilder.group({
      clearanceType: [this.clearanceTypeOptions[0], [Validators.required]],
      clearanceDate: ['', [Validators.required]],
      isCleared: [false],
      remarks: ['', [Validators.maxLength(400)]],
    });
    this.finalSettlementForm = this.formBuilder.group({
      settlementDate: ['', [Validators.required]],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      remarks: ['', [Validators.maxLength(400)]],
    });
  }

  ngOnInit(): void {
    this.loadResignationWorkspace();
    super.loadScripts();
  }

  get canManageExitWorkflow(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR', 'MANAGER']);
  }

  get canManageFinalSettlement(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR']);
  }

  get isEmployeeWorkspace(): boolean {
    return this.authentificationService.hasRole('EMPLOYEE') && !this.canManageExitWorkflow;
  }

  get canEditExitRequest(): boolean {
    return !!this.workflowEmployeeId && (this.canManageExitWorkflow || (this.isEmployeeWorkspace && this.hasWorkflowResignation));
  }

  get canDeleteResignation(): boolean {
    return this.canManageExitWorkflow;
  }

  get totalResignationsCount(): number {
    return this.resignations.length;
  }

  get scheduledResignationsCount(): number {
    return this.resignations.filter((item) => item.scheduled).length;
  }

  get recentResignationsCount(): number {
    return this.resignations.filter((item) => item.recent).length;
  }

  get documentedResignationsCount(): number {
    return this.resignations.filter((item) => item.documented).length;
  }

  get pendingApprovalCount(): number {
    return this.exitRequests.filter((item) => item.status === 'PENDING').length;
  }

  get scheduledInterviewsCount(): number {
    return this.exitInterviews.filter((item) => this.isFutureOrToday(item.interviewDate)).length;
  }

  get completedClearanceCount(): number {
    return this.clearances.filter((item) => item.isCleared).length;
  }

  get settlementIssuedCount(): number {
    return this.finalSettlements.length;
  }

  get workflowEmployeeId(): number | null {
    if (this.featuredResignation && this.featuredResignation.employeeId !== null) {
      return this.featuredResignation.employeeId;
    }

    return this.currentEmployee ? this.currentEmployee.id : null;
  }

  get workflowEmployeeName(): string {
    if (this.featuredResignation && this.featuredResignation.employeeName) {
      return this.featuredResignation.employeeName;
    }

    return this.currentEmployee ? this.currentEmployee.name : 'Employee pending';
  }

  get workflowDepartmentName(): string {
    if (this.featuredResignation && this.featuredResignation.departmentName) {
      return this.featuredResignation.departmentName;
    }

    return this.currentEmployee ? this.currentEmployee.departmentName : 'Department pending';
  }

  get employeeExitRequests(): ExitRequestView[] {
    return this.exitRequests.filter((item) => item.employeeId === this.workflowEmployeeId);
  }

  get employeeExitInterviews(): ExitInterviewView[] {
    return this.exitInterviews.filter((item) => item.employeeId === this.workflowEmployeeId);
  }

  get employeeClearances(): ClearanceView[] {
    return this.clearances.filter((item) => item.employeeId === this.workflowEmployeeId);
  }

  get employeeFinalSettlements(): FinalSettlementView[] {
    return this.finalSettlements.filter((item) => item.employeeId === this.workflowEmployeeId);
  }

  get latestExitRequest(): ExitRequestView | null {
    return this.employeeExitRequests.length ? this.employeeExitRequests[0] : null;
  }

  get latestExitInterview(): ExitInterviewView | null {
    return this.employeeExitInterviews.length ? this.employeeExitInterviews[0] : null;
  }

  get latestFinalSettlement(): FinalSettlementView | null {
    return this.employeeFinalSettlements.length ? this.employeeFinalSettlements[0] : null;
  }

  get hasWorkflowResignation(): boolean {
    return !!this.findLatestResignationForEmployee(this.workflowEmployeeId);
  }

  get clearanceProgressLabel(): string {
    const total = this.employeeClearances.length;
    if (!total) {
      return 'No clearance steps logged';
    }

    const completed = this.employeeClearances.filter((item) => item.isCleared).length;
    return completed + ' of ' + total + ' cleared';
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredResignations.length);
    const totalCount = this.formatCount(this.resignations.length);

    return this.filteredResignations.length === this.resignations.length
      ? filteredCount + ' resignations'
      : filteredCount + ' of ' + totalCount + ' resignations';
  }

  get modalTitle(): string {
    return this.modalMode === 'create'
      ? this.isEmployeeWorkspace
        ? 'Submit resignation'
        : 'Create resignation'
      : 'Edit resignation';
  }

  get modalSubtitle(): string {
    if (this.modalMode === 'create') {
      return this.isEmployeeWorkspace
        ? 'Submit your resignation and start the exit approval workflow from one action.'
        : 'Capture the employee, department, date, and reason behind a resignation.';
    }

    return 'Refine the resignation timeline and keep offboarding context clear.';
  }

  get draftEmployeeName(): string {
    return (
      this.lookupOptionName(this.employees, this.resignationForm.value.employeeId) ||
      (this.isEmployeeWorkspace && this.currentEmployee ? this.currentEmployee.name : '')
    );
  }

  get draftDepartmentName(): string {
    return (
      this.lookupOptionName(this.departments, this.resignationForm.value.departmentId) ||
      (this.isEmployeeWorkspace && this.currentEmployee ? this.currentEmployee.departmentName : '')
    );
  }

  get draftQuality(): ResignationQuality {
    return this.evaluateQuality(
      this.draftEmployeeName,
      this.draftDepartmentName,
      this.normalizeText(this.resignationForm.value.resignationDate),
      this.normalizeText(this.resignationForm.value.resignationReason)
    );
  }

  get featuredRecommendation(): string {
    if (!this.workflowEmployeeId) {
      return 'Select a resignation record to inspect timing, department impact, approval status, and settlement readiness.';
    }

    const workflowResignation = this.findLatestResignationForEmployee(this.workflowEmployeeId);
    if (!workflowResignation) {
      return this.isEmployeeWorkspace
        ? 'Submit your resignation to start the exit approval workflow.'
        : 'Create a resignation record before scheduling the rest of the exit process.';
    }

    if (!workflowResignation.documented) {
      return 'Expand the resignation reason so offboarding and department planning stay aligned.';
    }

    if (!this.latestExitRequest) {
      return 'Create an exit approval request so the resignation can move into review.';
    }

    if (this.latestExitRequest.status === 'PENDING') {
      return this.canManageExitWorkflow
        ? 'Review the pending exit request and decide whether to approve or reject the proposed last working day.'
        : 'Your resignation is awaiting approval. Keep an eye on the workflow status before planning handover.';
    }

    if (this.latestExitRequest.status === 'REJECTED') {
      return 'The exit request was rejected. Update the request details or clarify the resignation plan before continuing.';
    }

    if (!this.latestExitInterview) {
      return 'Schedule the exit interview so feedback and retention signals are documented before departure.';
    }

    if (this.employeeClearances.some((item) => !item.isCleared) || !this.employeeClearances.length) {
      return 'Complete the outstanding clearance steps so final settlement is not blocked by unresolved handoff items.';
    }

    if (!this.latestFinalSettlement) {
      return 'Prepare the final settlement so payroll closure is aligned with the completed exit workflow.';
    }

    return 'The exit workflow is documented end to end and ready for final archive review.';
  }

  get featuredNextAction(): string {
    if (!this.workflowEmployeeId) {
      return 'Create a resignation or choose one from the list to review the full exit workflow here.';
    }

    const workflowResignation = this.findLatestResignationForEmployee(this.workflowEmployeeId);
    if (!workflowResignation) {
      return this.isEmployeeWorkspace
        ? 'Next action: submit your resignation to begin approval, clearance, and settlement tracking.'
        : 'Next action: create a resignation to unlock approval, interview, clearance, and settlement steps.';
    }

    if (!this.latestExitRequest) {
      return 'Next action: open the approval section and record the exit request tied to this resignation.';
    }

    if (this.latestExitRequest.status === 'PENDING') {
      return this.canManageExitWorkflow
        ? 'Next action: set the approval decision and confirm the employee\'s last working day.'
        : 'Next action: wait for the approval decision and keep your planned last working day visible to HR.';
    }

    if (workflowResignation.scheduled) {
      return 'Next action: confirm transfer of responsibilities before the exit date arrives.';
    }

    if (!this.latestExitInterview) {
      return 'Next action: schedule or complete the exit interview so feedback is captured before departure.';
    }

    if (this.employeeClearances.some((item) => !item.isCleared) || !this.employeeClearances.length) {
      return 'Next action: close the remaining clearance items across security, finance, and handoff owners.';
    }

    if (!this.latestFinalSettlement) {
      return 'Next action: create the final settlement entry so the exit can be closed financially.';
    }

    return 'Next action: keep department records and replacement planning in sync with this completed exit.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: ResignationView): void {
    this.modalMode = 'edit';
    this.activeResignationId = item.id;
    this.submitted = false;
    this.featuredResignation = item;
    this.resignationForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      departmentId: item.departmentId !== null ? String(item.departmentId) : '',
      resignationDate: item.resignationDate,
      resignationReason: item.resignationReason,
    });
  }

  selectResignation(item: ResignationView): void {
    this.featuredResignation = item;
  }

  openDetailsModal(item: ResignationView): void {
    this.selectResignation(item);

    window.requestAnimationFrame(() => {
      this.showModal('resignationDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: ResignationFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: ResignationSort): void {
    this.activeSort = value || 'latest-date';
    this.applyFilters();
  }

  refreshResignations(): void {
    this.loadResignationWorkspace(true);
  }

  trackByResignationId(index: number, item: ResignationView): number {
    return item.id || index;
  }

  trackByWorkflowId(index: number, item: { id: number }): number {
    return item.id || index;
  }

  async saveResignation(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.resignationForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      let workflowWarning = '';

      if (this.modalMode === 'edit' && this.activeResignationId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/resignation/update/' + this.activeResignationId,
          payload
        );
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/resignation/create', payload);
      }

      if (this.isEmployeeWorkspace) {
        try {
          await this.syncExitRequestFromResignation(payload);
        } catch (error) {
          workflowWarning = 'The resignation was saved, but the linked exit approval request could not be synced automatically.';
        }
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadResignationWorkspace();

      if (workflowWarning) {
        super.show('Warning', workflowWarning, 'warning');
      } else {
        super.show(
          'Confirmation',
          this.modalMode === 'edit' ? 'Resignation updated successfully.' : 'Resignation saved successfully.',
          'success'
        );
      }
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteResignation(item: ResignationView): Promise<void> {
    const confirmed = confirm(
      'Delete the resignation record for "' + item.employeeName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/resignation/delete/' + item.id);
      super.show('Confirmation', 'Resignation deleted successfully.', 'success');

      if (this.featuredResignation && this.featuredResignation.id === item.id) {
        this.featuredResignation = null;
      }

      this.loadResignationWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  startExitRequestCreate(): void {
    this.exitRequestEditorMode = 'create';
    this.activeExitRequestId = null;
    this.exitRequestSubmitted = false;

    const workflowResignation = this.findLatestResignationForEmployee(this.workflowEmployeeId);
    const defaultDate = (workflowResignation && workflowResignation.resignationDate) || this.createToday();

    this.exitRequestForm.reset({
      requestDate: defaultDate,
      lastWorkingDay: defaultDate,
      status: this.latestExitRequest ? this.latestExitRequest.status : 'PENDING',
      reason: (workflowResignation && workflowResignation.resignationReason) || '',
    });
  }

  editExitRequest(item: ExitRequestView): void {
    this.exitRequestEditorMode = 'edit';
    this.activeExitRequestId = item.id;
    this.exitRequestSubmitted = false;
    this.exitRequestForm.reset({
      requestDate: item.requestDate,
      lastWorkingDay: item.lastWorkingDay,
      status: item.status,
      reason: item.reason,
    });
  }

  async saveExitRequest(): Promise<void> {
    this.exitRequestSubmitted = true;
    const payload = this.buildExitRequestPayload();

    if (!payload) {
      this.exitRequestForm.markAllAsTouched();
      return;
    }

    this.savingExitRequest = true;

    try {
      if (this.exitRequestEditorMode === 'edit' && this.activeExitRequestId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/exit-requests/' + this.activeExitRequestId,
          payload
        );
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/exit-requests', payload);
      }

      this.startExitRequestCreate();
      this.loadResignationWorkspace();
      super.show(
        'Confirmation',
        this.exitRequestEditorMode === 'edit' ? 'Exit request updated successfully.' : 'Exit request created successfully.',
        'success'
      );
    } catch (error) {
      super.show('Error', this.getErrorMessage(error, 'Unable to save the exit request right now.'), 'warning');
    } finally {
      this.savingExitRequest = false;
    }
  }

  startExitInterviewCreate(): void {
    this.exitInterviewEditorMode = 'create';
    this.activeExitInterviewId = null;
    this.exitInterviewSubmitted = false;
    this.exitInterviewForm.reset({
      interviewDate: this.createToday(),
      interviewerName: this.authentificationService.getDisplayName(),
      feedback: '',
      suggestions: '',
    });
  }

  editExitInterview(item: ExitInterviewView): void {
    this.exitInterviewEditorMode = 'edit';
    this.activeExitInterviewId = item.id;
    this.exitInterviewSubmitted = false;
    this.exitInterviewForm.reset({
      interviewDate: item.interviewDate,
      interviewerName: item.interviewerName,
      feedback: item.feedback,
      suggestions: item.suggestions,
    });
  }

  async saveExitInterview(): Promise<void> {
    this.exitInterviewSubmitted = true;
    const payload = this.buildExitInterviewPayload();

    if (!payload) {
      this.exitInterviewForm.markAllAsTouched();
      return;
    }

    this.savingExitInterview = true;

    try {
      if (this.exitInterviewEditorMode === 'edit' && this.activeExitInterviewId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/exit-interviews/' + this.activeExitInterviewId,
          payload
        );
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/exit-interviews', payload);
      }

      this.startExitInterviewCreate();
      this.loadResignationWorkspace();
      super.show(
        'Confirmation',
        this.exitInterviewEditorMode === 'edit'
          ? 'Exit interview updated successfully.'
          : 'Exit interview scheduled successfully.',
        'success'
      );
    } catch (error) {
      super.show('Error', this.getErrorMessage(error, 'Unable to save the exit interview right now.'), 'warning');
    } finally {
      this.savingExitInterview = false;
    }
  }

  startClearanceCreate(): void {
    this.clearanceEditorMode = 'create';
    this.activeClearanceId = null;
    this.clearanceSubmitted = false;
    this.clearanceForm.reset({
      clearanceType: this.clearanceTypeOptions[0],
      clearanceDate: this.createToday(),
      isCleared: false,
      remarks: '',
    });
  }

  editClearance(item: ClearanceView): void {
    this.clearanceEditorMode = 'edit';
    this.activeClearanceId = item.id;
    this.clearanceSubmitted = false;
    this.clearanceForm.reset({
      clearanceType: item.clearanceType,
      clearanceDate: item.clearanceDate,
      isCleared: item.isCleared,
      remarks: item.remarks,
    });
  }

  async saveClearance(): Promise<void> {
    this.clearanceSubmitted = true;
    const payload = this.buildClearancePayload();

    if (!payload) {
      this.clearanceForm.markAllAsTouched();
      return;
    }

    this.savingClearance = true;

    try {
      if (this.clearanceEditorMode === 'edit' && this.activeClearanceId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/clearances/' + this.activeClearanceId,
          payload
        );
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/clearances', payload);
      }

      this.startClearanceCreate();
      this.loadResignationWorkspace();
      super.show(
        'Confirmation',
        this.clearanceEditorMode === 'edit' ? 'Clearance item updated successfully.' : 'Clearance item saved successfully.',
        'success'
      );
    } catch (error) {
      super.show('Error', this.getErrorMessage(error, 'Unable to save the clearance record right now.'), 'warning');
    } finally {
      this.savingClearance = false;
    }
  }

  startFinalSettlementCreate(): void {
    this.finalSettlementEditorMode = 'create';
    this.activeFinalSettlementId = null;
    this.finalSettlementSubmitted = false;
    this.finalSettlementForm.reset({
      settlementDate: this.createToday(),
      totalAmount: '',
      remarks: '',
    });
  }

  editFinalSettlement(item: FinalSettlementView): void {
    this.finalSettlementEditorMode = 'edit';
    this.activeFinalSettlementId = item.id;
    this.finalSettlementSubmitted = false;
    this.finalSettlementForm.reset({
      settlementDate: item.settlementDate,
      totalAmount: item.totalAmount,
      remarks: item.remarks,
    });
  }

  async saveFinalSettlement(): Promise<void> {
    this.finalSettlementSubmitted = true;
    const payload = this.buildFinalSettlementPayload();

    if (!payload) {
      this.finalSettlementForm.markAllAsTouched();
      return;
    }

    this.savingFinalSettlement = true;

    try {
      if (this.finalSettlementEditorMode === 'edit' && this.activeFinalSettlementId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/final-settlements/' + this.activeFinalSettlementId,
          payload
        );
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/final-settlements', payload);
      }

      this.startFinalSettlementCreate();
      this.loadResignationWorkspace();
      super.show(
        'Confirmation',
        this.finalSettlementEditorMode === 'edit'
          ? 'Final settlement updated successfully.'
          : 'Final settlement recorded successfully.',
        'success'
      );
    } catch (error) {
      super.show('Error', this.getErrorMessage(error, 'Unable to save the final settlement right now.'), 'warning');
    } finally {
      this.savingFinalSettlement = false;
    }
  }

  private loadResignationWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      resignations: this.httpService.getAll(CONFIG.URL_BASE + '/resignation/all'),
      employees: this.canManageExitWorkflow
        ? this.httpService.getAll(CONFIG.URL_BASE + '/employee/all').pipe(catchError(() => of([])))
        : of([]),
      departments: this.canManageExitWorkflow
        ? this.httpService.getAll(CONFIG.URL_BASE + '/departement/all').pipe(catchError(() => of([])))
        : of([]),
      currentEmployee: this.isEmployeeWorkspace
        ? this.httpService.get(CONFIG.URL_BASE + '/employee/me').pipe(catchError(() => of(null)))
        : of(null),
      exitRequests: this.httpService.getAll(CONFIG.URL_BASE + '/api/exit-requests').pipe(catchError(() => of([]))),
      exitInterviews: this.httpService.getAll(CONFIG.URL_BASE + '/api/exit-interviews').pipe(catchError(() => of([]))),
      clearances: this.httpService.getAll(CONFIG.URL_BASE + '/api/clearances').pipe(catchError(() => of([]))),
      finalSettlements: this.httpService.getAll(CONFIG.URL_BASE + '/api/final-settlements').pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.currentEmployee = this.normalizeEmployeeContext(result.currentEmployee);
          this.employees = this.canManageExitWorkflow
            ? this.normalizeReferenceOptions(result.employees, 'employee')
            : this.currentEmployee
            ? [{ id: this.currentEmployee.id, name: this.currentEmployee.name }]
            : [];
          this.departments = this.canManageExitWorkflow
            ? this.normalizeReferenceOptions(result.departments, 'department')
            : this.currentEmployee && this.currentEmployee.departmentId !== null
            ? [{ id: this.currentEmployee.departmentId, name: this.currentEmployee.departmentName }]
            : [];
          this.resignations = this.normalizeResignations(result.resignations);
          this.exitRequests = this.normalizeExitRequests(result.exitRequests);
          this.exitInterviews = this.normalizeExitInterviews(result.exitInterviews);
          this.clearances = this.normalizeClearances(result.clearances);
          this.finalSettlements = this.normalizeFinalSettlements(result.finalSettlements);
          this.applyFilters();
          this.resetEditor();
          this.startExitRequestCreate();
          this.startExitInterviewCreate();
          this.startClearanceCreate();
          this.startFinalSettlementCreate();

          if (this.isEmployeeWorkspace && !this.currentEmployee) {
            this.loadError = 'Your employee profile could not be resolved for resignation self-service.';
          }

          if (showNotification) {
            super.show('Confirmation', 'Resignations and exit workflow records refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.resignations = [];
          this.filteredResignations = [];
          this.featuredResignation = null;
          this.exitRequests = [];
          this.exitInterviews = [];
          this.clearances = [];
          this.finalSettlements = [];
          this.loadError = 'Unable to load resignation records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeResignationId = null;
    this.submitted = false;
    this.saving = false;
    this.resignationForm.reset({
      employeeId:
        this.isEmployeeWorkspace && this.currentEmployee ? String(this.currentEmployee.id) : '',
      departmentId:
        this.isEmployeeWorkspace && this.currentEmployee && this.currentEmployee.departmentId !== null
          ? String(this.currentEmployee.departmentId)
          : '',
      resignationDate: this.createToday(),
      resignationReason: '',
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredResignations = this.resignations
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employeeName.toLowerCase().includes(searchValue) ||
          item.departmentName.toLowerCase().includes(searchValue) ||
          item.resignationReason.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'scheduled'
            ? item.scheduled
            : this.activeFilter === 'recent'
            ? item.recent
            : !item.documented;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'employee-asc') {
          return left.employeeName.localeCompare(right.employeeName);
        }

        if (this.activeSort === 'department-asc') {
          return left.departmentName.localeCompare(right.departmentName);
        }

        return right.resignationDate.localeCompare(left.resignationDate);
      });

    if (!this.filteredResignations.length) {
      this.featuredResignation = null;
      return;
    }

    if (
      !this.featuredResignation ||
      !this.filteredResignations.some((item) => item.id === this.featuredResignation.id)
    ) {
      this.featuredResignation = this.filteredResignations[0];
    }
  }

  private normalizeReferenceOptions(
    data: unknown,
    type: 'employee' | 'department'
  ): ResignationReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => ({
        id: Number(record && record.id),
        name:
          type === 'employee'
            ? this.normalizeText(record && record.fullName) ||
              [
                this.normalizeText(record && record.firstName),
                this.normalizeText(record && record.lastName),
              ]
                .filter((value) => value.length > 0)
                .join(' ')
            : this.normalizeText(record && record.name),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.length > 0);
  }

  private normalizeResignations(data: unknown): ResignationView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((record, index) => this.toResignationView(record, index));
  }

  private normalizeExitRequests(data: unknown): ExitRequestView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => this.toExitRequestView(record, index))
      .sort((left, right) => right.requestDate.localeCompare(left.requestDate) || right.id - left.id);
  }

  private normalizeExitInterviews(data: unknown): ExitInterviewView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => this.toExitInterviewView(record, index))
      .sort((left, right) => right.interviewDate.localeCompare(left.interviewDate) || right.id - left.id);
  }

  private normalizeClearances(data: unknown): ClearanceView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => this.toClearanceView(record, index))
      .sort((left, right) => right.clearanceDate.localeCompare(left.clearanceDate) || right.id - left.id);
  }

  private normalizeFinalSettlements(data: unknown): FinalSettlementView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => this.toFinalSettlementView(record, index))
      .sort((left, right) => right.settlementDate.localeCompare(left.settlementDate) || right.id - left.id);
  }

  private normalizeEmployeeContext(record: unknown): WorkflowEmployeeContext | null {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const id = this.toNumericId((record as any).id);
    const department = (record as any).department || (record as any).departement || null;
    const departmentId = this.toNumericId(department && department.id);
    const departmentName = this.normalizeText(department && department.name) || 'Department pending';
    const name =
      this.normalizeText((record as any).fullName) ||
      [
        this.normalizeText((record as any).firstName),
        this.normalizeText((record as any).lastName),
      ]
        .filter((value) => value.length > 0)
        .join(' ');

    if (id === null || !name) {
      return null;
    }

    return {
      id,
      name,
      departmentId,
      departmentName,
    };
  }

  private toResignationView(record: any, index: number): ResignationView {
    const employeeId = this.toNumericId(record && record.employeeName && record.employeeName.id);
    const departmentId = this.toNumericId(record && record.departement && record.departement.id);
    const employeeName =
      this.normalizeText(record && record.employeeName && record.employeeName.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const departmentName =
      this.normalizeText(record && record.departement && record.departement.name) ||
      this.lookupOptionName(this.departments, departmentId) ||
      'Department pending';
    const resignationDate = this.normalizeText(record && record.resignationDate);
    const resignationReason = this.normalizeText(record && record.resignationReason);
    const quality = this.evaluateQuality(employeeName, departmentName, resignationDate, resignationReason);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      departmentId,
      departmentName,
      resignationDate,
      resignationDateLabel: this.formatDateLabel(resignationDate),
      resignationReason,
      summary: this.buildSummary(employeeName, departmentName, resignationReason),
      scheduled: this.isFutureOrToday(resignationDate),
      recent: this.isRecent(resignationDate, 60),
      documented: resignationReason.length >= 15,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
    };
  }

  private toExitRequestView(record: any, index: number): ExitRequestView {
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      (this.currentEmployee && this.currentEmployee.id === employeeId ? this.currentEmployee.name : 'Employee pending');
    const requestDate = this.normalizeText(record && record.requestDate);
    const lastWorkingDay = this.normalizeText(record && record.lastWorkingDay);
    const status = this.normalizeText(record && record.status).toUpperCase() || 'PENDING';
    const reason = this.normalizeText(record && record.reason);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      requestDate,
      requestDateLabel: this.formatDateLabel(requestDate),
      lastWorkingDay,
      lastWorkingDayLabel: this.formatDateLabel(lastWorkingDay),
      status,
      statusLabel: this.toTitleCase(status.toLowerCase()),
      reason,
      submittedAt: this.normalizeText(record && record.submittedAt),
      summary: this.buildExitRequestSummary(employeeName, status, lastWorkingDay, reason),
      tone:
        status === 'APPROVED'
          ? 'strong'
          : status === 'REJECTED'
          ? 'critical'
          : status === 'PENDING'
          ? 'warning'
          : 'medium',
    };
  }

  private toExitInterviewView(record: any, index: number): ExitInterviewView {
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const interviewDate = this.normalizeText(record && record.interviewDate);
    const interviewerName = this.normalizeText(record && record.interviewerName);
    const feedback = this.normalizeText(record && record.feedback);
    const suggestions = this.normalizeText(record && record.suggestions);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      interviewDate,
      interviewDateLabel: this.formatDateLabel(interviewDate),
      interviewerName,
      feedback,
      suggestions,
      summary: this.buildExitInterviewSummary(interviewerName, feedback, suggestions),
    };
  }

  private toClearanceView(record: any, index: number): ClearanceView {
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const clearanceType = this.normalizeText(record && record.clearanceType) || 'Clearance';
    const clearanceDate = this.normalizeText(record && record.clearanceDate);
    const remarks = this.normalizeText(record && record.remarks);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      clearanceType,
      clearanceDate,
      clearanceDateLabel: this.formatDateLabel(clearanceDate),
      isCleared: !!(record && record.cleared !== undefined ? record.cleared : record && record.isCleared),
      remarks,
      summary: this.buildClearanceSummary(clearanceType, remarks),
      tone: !!(record && record.cleared !== undefined ? record.cleared : record && record.isCleared)
        ? 'strong'
        : 'warning',
    };
  }

  private toFinalSettlementView(record: any, index: number): FinalSettlementView {
    const employeeId = this.toNumericId(record && record.employee && record.employee.id);
    const employeeName =
      this.normalizeText(record && record.employee && record.employee.fullName) ||
      this.lookupOptionName(this.employees, employeeId) ||
      'Employee pending';
    const settlementDate = this.normalizeText(record && record.settlementDate);
    const totalAmount = this.toAmount(record && record.totalAmount) || 0;
    const remarks = this.normalizeText(record && record.remarks);
    const numericId = Number(record && record.id);

    return {
      id: Number.isFinite(numericId) ? numericId : index + 1,
      employeeId,
      employeeName,
      settlementDate,
      settlementDateLabel: this.formatDateLabel(settlementDate),
      totalAmount,
      remarks,
      summary: this.buildSettlementSummary(totalAmount, remarks),
    };
  }

  private buildSummary(
    employeeName: string,
    departmentName: string,
    resignationReason: string
  ): string {
    return (
      employeeName +
      ' is exiting ' +
      departmentName +
      ' with the recorded reason: ' +
      (resignationReason || 'reason pending') +
      '.'
    );
  }

  private buildExitRequestSummary(
    employeeName: string,
    status: string,
    lastWorkingDay: string,
    reason: string
  ): string {
    return (
      employeeName +
      ' has an exit request currently marked ' +
      status.toLowerCase() +
      ' with a proposed last working day of ' +
      this.formatDateLabel(lastWorkingDay) +
      '. ' +
      (reason || 'No additional exit request context has been recorded yet.')
    );
  }

  private buildExitInterviewSummary(
    interviewerName: string,
    feedback: string,
    suggestions: string
  ): string {
    return [
      interviewerName ? 'Interviewer: ' + interviewerName + '.' : '',
      feedback || 'Feedback pending.',
      suggestions ? 'Suggestions: ' + suggestions : '',
    ]
      .filter((value) => value.length > 0)
      .join(' ');
  }

  private buildClearanceSummary(clearanceType: string, remarks: string): string {
    return clearanceType + (remarks ? ' - ' + remarks : ' clearance step is being tracked.');
  }

  private buildSettlementSummary(totalAmount: number, remarks: string): string {
    return (
      'Final settlement amount ' +
      new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(totalAmount) +
      (remarks ? ' with note: ' + remarks : '.')
    );
  }

  private evaluateQuality(
    employeeName: string,
    departmentName: string,
    resignationDate: string,
    resignationReason: string
  ): ResignationQuality {
    if (
      employeeName.length > 0 &&
      departmentName.length > 0 &&
      resignationDate.length > 0 &&
      resignationReason.length >= 15
    ) {
      return {
        label: 'Documented',
        tone: 'strong',
        score: 100,
      };
    }

    if (employeeName.length > 0 && departmentName.length > 0 && resignationDate.length > 0) {
      return {
        label: 'Needs context',
        tone: 'warning',
        score: 70,
      };
    }

    if (employeeName.length > 0 && departmentName.length > 0) {
      return {
        label: 'Draft',
        tone: 'medium',
        score: 46,
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 18,
    };
  }

  private buildPayload(): {
    employeeName: { id: number };
    departement: { id: number };
    resignationDate: string;
    resignationReason: string;
  } | null {
    const employeeId = this.isEmployeeWorkspace && this.currentEmployee
      ? this.currentEmployee.id
      : this.toNumericId(this.resignationForm.value.employeeId);
    const departmentId = this.isEmployeeWorkspace && this.currentEmployee
      ? this.currentEmployee.departmentId
      : this.toNumericId(this.resignationForm.value.departmentId);
    const resignationDate = this.normalizeText(this.resignationForm.value.resignationDate);
    const resignationReason = this.normalizeText(this.resignationForm.value.resignationReason);

    if (employeeId === null) {
      this.resignationForm.get('employeeId').setErrors({ required: true });
    }

    if (departmentId === null) {
      this.resignationForm.get('departmentId').setErrors({ required: true });
    }

    if (!resignationDate) {
      this.resignationForm.get('resignationDate').setErrors({ required: true });
    }

    if (!resignationReason) {
      this.resignationForm.get('resignationReason').setErrors({ required: true });
    }

    if (
      this.resignationForm.invalid ||
      employeeId === null ||
      departmentId === null ||
      !resignationDate ||
      !resignationReason
    ) {
      return null;
    }

    return {
      employeeName: { id: employeeId },
      departement: { id: departmentId },
      resignationDate,
      resignationReason,
    };
  }

  private buildExitRequestPayload(): {
    employee: { id: number };
    requestDate: string;
    lastWorkingDay: string;
    status: string;
    reason: string;
  } | null {
    const employeeId = this.workflowEmployeeId;
    const requestDate = this.normalizeText(this.exitRequestForm.value.requestDate);
    const lastWorkingDay = this.normalizeText(this.exitRequestForm.value.lastWorkingDay);
    const reason = this.normalizeText(this.exitRequestForm.value.reason);
    const selectedStatus = this.normalizeText(this.exitRequestForm.value.status).toUpperCase() || 'PENDING';
    const existingStatus = this.activeExitRequestId !== null
      ? this.exitRequests.find((item) => item.id === this.activeExitRequestId)?.status || 'PENDING'
      : 'PENDING';
    const status = this.canManageExitWorkflow ? selectedStatus : existingStatus;

    if (employeeId === null) {
      return null;
    }

    if (!requestDate) {
      this.exitRequestForm.get('requestDate').setErrors({ required: true });
    }

    if (!lastWorkingDay) {
      this.exitRequestForm.get('lastWorkingDay').setErrors({ required: true });
    }

    if (!reason) {
      this.exitRequestForm.get('reason').setErrors({ required: true });
    }

    if (this.exitRequestForm.invalid || !requestDate || !lastWorkingDay || !reason) {
      return null;
    }

    return {
      employee: { id: employeeId },
      requestDate,
      lastWorkingDay,
      status,
      reason,
    };
  }

  private buildExitInterviewPayload(): {
    employee: { id: number };
    interviewDate: string;
    interviewerName: string;
    feedback: string;
    suggestions: string;
  } | null {
    const employeeId = this.workflowEmployeeId;
    const interviewDate = this.normalizeText(this.exitInterviewForm.value.interviewDate);
    const interviewerName = this.normalizeText(this.exitInterviewForm.value.interviewerName);
    const feedback = this.normalizeText(this.exitInterviewForm.value.feedback);
    const suggestions = this.normalizeText(this.exitInterviewForm.value.suggestions);

    if (employeeId === null) {
      return null;
    }

    if (this.exitInterviewForm.invalid || !interviewDate || !interviewerName || !feedback) {
      return null;
    }

    return {
      employee: { id: employeeId },
      interviewDate,
      interviewerName,
      feedback,
      suggestions,
    };
  }

  private buildClearancePayload(): {
    employee: { id: number };
    clearanceType: string;
    clearanceDate: string;
    cleared: boolean;
    remarks: string;
  } | null {
    const employeeId = this.workflowEmployeeId;
    const clearanceType = this.normalizeText(this.clearanceForm.value.clearanceType);
    const clearanceDate = this.normalizeText(this.clearanceForm.value.clearanceDate);
    const cleared = !!this.clearanceForm.value.isCleared;
    const remarks = this.normalizeText(this.clearanceForm.value.remarks);

    if (employeeId === null) {
      return null;
    }

    if (this.clearanceForm.invalid || !clearanceType || !clearanceDate) {
      return null;
    }

    return {
      employee: { id: employeeId },
      clearanceType,
      clearanceDate,
      cleared,
      remarks,
    };
  }

  private buildFinalSettlementPayload(): {
    employee: { id: number };
    settlementDate: string;
    totalAmount: number;
    remarks: string;
  } | null {
    const employeeId = this.workflowEmployeeId;
    const settlementDate = this.normalizeText(this.finalSettlementForm.value.settlementDate);
    const totalAmount = this.toAmount(this.finalSettlementForm.value.totalAmount);
    const remarks = this.normalizeText(this.finalSettlementForm.value.remarks);

    if (employeeId === null) {
      return null;
    }

    if (this.finalSettlementForm.invalid || !settlementDate || totalAmount === null) {
      return null;
    }

    return {
      employee: { id: employeeId },
      settlementDate,
      totalAmount,
      remarks,
    };
  }

  private async syncExitRequestFromResignation(payload: {
    employeeName: { id: number };
    resignationDate: string;
    resignationReason: string;
  }): Promise<void> {
    const employeeId = payload.employeeName.id;
    const existingRequest = this.exitRequests.find((item) => item.employeeId === employeeId) || null;
    const requestPayload = {
      employee: { id: employeeId },
      requestDate: payload.resignationDate,
      lastWorkingDay: payload.resignationDate,
      status: existingRequest ? existingRequest.status : 'PENDING',
      reason: payload.resignationReason,
    };

    if (existingRequest) {
      await this.httpService.update(
        CONFIG.URL_BASE + '/api/exit-requests/' + existingRequest.id,
        requestPayload
      );
      return;
    }

    await this.httpService.create(CONFIG.URL_BASE + '/api/exit-requests', requestPayload);
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('resignationCrudModalClose');

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

  private lookupOptionName(options: ResignationReference[], value: unknown): string {
    const id = this.toNumericId(value);

    if (id === null) {
      return '';
    }

    const match = options.find((item) => item.id === id);
    return match ? match.name : '';
  }

  private findLatestResignationForEmployee(employeeId: number | null): ResignationView | null {
    if (employeeId === null) {
      return null;
    }

    const matches = this.resignations
      .filter((item) => item.employeeId === employeeId)
      .sort((left, right) => right.resignationDate.localeCompare(left.resignationDate) || right.id - left.id);

    return matches.length ? matches[0] : null;
  }

  private createToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isFutureOrToday(value: string): boolean {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsedDate.getTime() >= today.getTime();
  }

  private isRecent(value: string, days: number): boolean {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return false;
    }

    const difference = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    return difference >= 0 && difference <= days;
  }

  private formatDateLabel(value: string): string {
    const parsedDate = this.toDate(value);

    if (!parsedDate) {
      return 'Date pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private toDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value + 'T00:00:00');
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toTitleCase(value: string): string {
    return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private toNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private toAmount(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private getErrorMessage(error: unknown, fallback = 'Unable to complete the resignation request right now.'): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return fallback;
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
