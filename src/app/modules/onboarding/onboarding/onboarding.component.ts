import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

type ProgressTone = 'strong' | 'medium' | 'warning' | 'critical';
type StatusFilter = 'all' | 'open' | 'completed';

interface EmployeeOption {
  id: number;
  name: string;
  joiningDate: string;
  joiningDateLabel: string;
}

interface ChecklistView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  taskName: string;
  taskDescription: string;
  taskCategory: string;
  taskCategoryLabel: string;
  requiredDocumentCategory: string;
  requiredDocumentLabel: string;
  dueDate: string;
  dueDateLabel: string;
  completed: boolean;
  completedAt: string;
  completedAtLabel: string;
  assignedAt: string;
  assignedAtLabel: string;
  assignedBy: string;
  taskOrder: number;
  notes: string;
  overdue: boolean;
  tone: ProgressTone;
}

interface OnboardingDocumentView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  documentName: string;
  documentCategory: string;
  documentCategoryLabel: string;
  originalFileName: string;
  accessLevel: string;
  accessLabel: string;
  uploadedAt: string;
  uploadedAtLabel: string;
  versionNumber: number;
  activeVersion: boolean;
  notes: string;
}

interface ProgressCard {
  employeeId: number;
  employeeName: string;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  completionRate: number;
  documentCount: number;
  offerLetterUploaded: boolean;
  nextDueLabel: string;
  tone: ProgressTone;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class OnboardingComponent extends URLLoader implements OnInit {
  loading = false;
  checklistSaving = false;
  documentSaving = false;
  checklistSubmitted = false;
  documentSubmitted = false;
  loadError = '';

  selectedEmployee = 'all';
  selectedStatus: StatusFilter = 'all';
  selectedDocumentCategory = 'all';
  searchTerm = '';

  selectedFile: File = null;
  selectedFileName = '';

  employees: EmployeeOption[] = [];
  checklists: ChecklistView[] = [];
  documents: OnboardingDocumentView[] = [];

  readonly checklistCategories = [
    'PREBOARDING',
    'DOCUMENTS',
    'COMPLIANCE',
    'SETUP',
    'FIRST_WEEK',
    'GENERAL',
  ];
  readonly documentCategories = [
    'OFFER_LETTER',
    'CONTRACT',
    'ID',
    'CERTIFICATE',
    'OTHER',
  ];
  readonly accessOptions = ['ADMIN_ONLY', 'EMPLOYEE_AND_ADMIN'];
  readonly checklistForm: FormGroup;
  readonly documentForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService
  ) {
    super();
    this.checklistForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      taskName: ['', [Validators.required, Validators.maxLength(120)]],
      taskDescription: ['', [Validators.maxLength(1200)]],
      taskCategory: ['GENERAL', [Validators.required]],
      requiredDocumentCategory: [''],
      dueDate: [''],
      notes: ['', [Validators.maxLength(1500)]],
    });
    this.documentForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      documentName: ['Offer Letter', [Validators.required, Validators.maxLength(120)]],
      documentCategory: ['OFFER_LETTER', [Validators.required]],
      accessLevel: ['ADMIN_ONLY', [Validators.required]],
      notes: ['', [Validators.maxLength(1500)]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get canManageDocuments(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR']);
  }

  get canManageChecklists(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR', 'MANAGER']);
  }

  get filteredChecklists(): ChecklistView[] {
    const normalizedSearch = this.normalizeText(this.searchTerm).toLowerCase();

    return this.checklists.filter((item) => {
      const matchesEmployee =
        this.selectedEmployee === 'all' || String(item.employeeId) === this.selectedEmployee;
      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'completed' && item.completed) ||
        (this.selectedStatus === 'open' && !item.completed);
      const matchesSearch =
        !normalizedSearch ||
        item.taskName.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.employeeName.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.taskCategoryLabel.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.requiredDocumentLabel.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.notes.toLowerCase().indexOf(normalizedSearch) !== -1;

      return matchesEmployee && matchesStatus && matchesSearch;
    });
  }

  get filteredDocuments(): OnboardingDocumentView[] {
    return this.documents.filter((item) => {
      const matchesEmployee =
        this.selectedEmployee === 'all' || String(item.employeeId) === this.selectedEmployee;
      const matchesCategory =
        this.selectedDocumentCategory === 'all' || item.documentCategory === this.selectedDocumentCategory;

      return matchesEmployee && matchesCategory;
    });
  }

  get progressCards(): ProgressCard[] {
    const employeeIds: number[] = [];

    this.checklists.forEach((item) => {
      if (item.employeeId !== null && employeeIds.indexOf(item.employeeId) === -1) {
        employeeIds.push(item.employeeId);
      }
    });

    this.documents.forEach((item) => {
      if (item.employeeId !== null && employeeIds.indexOf(item.employeeId) === -1) {
        employeeIds.push(item.employeeId);
      }
    });

    if (this.selectedEmployee !== 'all') {
      const selectedEmployeeId = this.toNumericId(this.selectedEmployee);
      employeeIds.length = 0;
      if (selectedEmployeeId !== null) {
        employeeIds.push(selectedEmployeeId);
      }
    }

    return employeeIds
      .map((employeeId) => this.buildProgressCard(employeeId))
      .filter((item) => item !== null)
      .sort((left, right) => {
        if (left.openTasks !== right.openTasks) {
          return right.openTasks - left.openTasks;
        }

        if (left.completionRate !== right.completionRate) {
          return left.completionRate - right.completionRate;
        }

        return left.employeeName.localeCompare(right.employeeName);
      }) as ProgressCard[];
  }

  get totalTrackedEmployees(): number {
    return this.progressCards.length;
  }

  get totalAssignedTasks(): number {
    return this.checklists.length;
  }

  get totalCompletedTasks(): number {
    return this.checklists.filter((item) => item.completed).length;
  }

  get totalUploadedDocuments(): number {
    return this.documents.length;
  }

  get overallCompletionRate(): number {
    if (!this.checklists.length) {
      return 0;
    }

    return Math.round((this.totalCompletedTasks / this.checklists.length) * 100);
  }

  get checklistSaveLabel(): string {
    return this.checklistSaving ? 'Saving...' : 'Add onboarding task';
  }

  get documentSaveLabel(): string {
    return this.documentSaving ? 'Uploading...' : 'Upload onboarding document';
  }

  onEmployeeFilterChange(value: string): void {
    this.selectedEmployee = value || 'all';

    if (this.selectedEmployee !== 'all') {
      if (!this.normalizeText(this.checklistForm.value.employeeId)) {
        this.checklistForm.patchValue({ employeeId: this.selectedEmployee });
      }

      if (!this.normalizeText(this.documentForm.value.employeeId)) {
        this.documentForm.patchValue({ employeeId: this.selectedEmployee });
      }
    }
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.selectedStatus = value || 'all';
  }

  onDocumentCategoryFilterChange(value: string): void {
    this.selectedDocumentCategory = value || 'all';
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input && input.files ? input.files : null;
    this.selectedFile = files && files.length ? files[0] : null;
    this.selectedFileName = this.selectedFile ? this.selectedFile.name : '';
  }

  trackByEmployeeId(index: number, item: EmployeeOption): number {
    return item.id || index;
  }

  trackByChecklistId(index: number, item: ChecklistView): number {
    return item.id || index;
  }

  trackByDocumentId(index: number, item: OnboardingDocumentView): number {
    return item.id || index;
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  async assignStarterChecklist(): Promise<void> {
    const employeeId = this.resolveActionEmployeeId();

    if (employeeId === null) {
      super.show('Missing employee', 'Select an employee before assigning the starter checklist.', 'warning');
      return;
    }

    this.checklistSaving = true;

    try {
      await this.httpService.postWithResponse(
        CONFIG.URL_BASE + '/api/onboarding-checklists/assign-starter/' + employeeId,
        {}
      );
      super.show('Confirmation', 'Starter onboarding checklist assigned successfully.', 'success');
      this.resetChecklistForm(employeeId);
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.checklistSaving = false;
    }
  }

  async saveChecklist(): Promise<void> {
    this.checklistSubmitted = true;

    if (this.checklistForm.invalid) {
      this.checklistForm.markAllAsTouched();
      return;
    }

    this.checklistSaving = true;

    try {
      await this.httpService.postWithResponse(
        CONFIG.URL_BASE + '/api/onboarding-checklists',
        this.buildChecklistPayload()
      );
      super.show('Confirmation', 'Onboarding task assigned successfully.', 'success');
      this.resetChecklistForm(this.resolveActionEmployeeId());
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.checklistSaving = false;
    }
  }

  async toggleChecklistCompletion(item: ChecklistView): Promise<void> {
    try {
      await this.httpService.putWithResponse(
        CONFIG.URL_BASE + '/api/onboarding-checklists/' + item.id,
        this.buildChecklistUpdatePayload(item, !item.completed)
      );
      super.show(
        'Confirmation',
        !item.completed ? 'Onboarding task marked complete.' : 'Onboarding task reopened.',
        'success'
      );
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    }
  }

  async uploadDocument(): Promise<void> {
    this.documentSubmitted = true;

    if (this.documentForm.invalid || !this.selectedFile) {
      this.documentForm.markAllAsTouched();
      return;
    }

    this.documentSaving = true;

    try {
      await this.httpService.postFormDataWithResponse(
        CONFIG.URL_BASE + '/api/documents/upload',
        this.buildDocumentFormData()
      );
      super.show('Confirmation', 'Onboarding document uploaded successfully.', 'success');
      this.resetDocumentForm(this.resolveDocumentEmployeeId());
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.documentSaving = false;
    }
  }

  async downloadDocument(item: OnboardingDocumentView): Promise<void> {
    try {
      const blob = await this.httpService.getBlob(
        CONFIG.URL_BASE + '/api/documents/' + item.id + '/download'
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = item.originalFileName || item.documentName;
      link.click();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    }
  }

  toDisplayLabel(value: string): string {
    return this.normalizeText(value)
      .toLowerCase()
      .split('_')
      .map((item) => (item ? item.charAt(0).toUpperCase() + item.slice(1) : item))
      .join(' ');
  }

  private loadWorkspace(showRefreshNotice = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
      checklists: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/onboarding-checklists')
        .pipe(catchError(() => of([]))),
      documents: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/documents')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result: any) => {
          const employees = this.normalizeEmployees(result && result.employees);

          this.employees = employees;
          this.checklists = this.normalizeChecklists(result && result.checklists, employees);
          this.documents = this.normalizeDocuments(result && result.documents, employees);

          if (showRefreshNotice) {
            super.show('Workspace refreshed', 'Onboarding workspace refreshed successfully.', 'success');
          }
        },
        error: (error: unknown) => {
          this.loadError = this.getErrorMessage(error);
        },
      });
  }

  private buildChecklistPayload(): any {
    const employeeId = this.resolveActionEmployeeId();

    return {
      employee: employeeId !== null ? { id: employeeId } : null,
      taskName: this.normalizeText(this.checklistForm.value.taskName),
      taskDescription: this.normalizeText(this.checklistForm.value.taskDescription),
      taskCategory: this.normalizeText(this.checklistForm.value.taskCategory),
      requiredDocumentCategory: this.normalizeText(this.checklistForm.value.requiredDocumentCategory),
      dueDate: this.normalizeDateValue(this.checklistForm.value.dueDate),
      notes: this.normalizeText(this.checklistForm.value.notes),
      completed: false,
      taskOrder: this.resolveNextTaskOrder(employeeId),
    };
  }

  private buildChecklistUpdatePayload(item: ChecklistView, completed: boolean): any {
    return {
      employee: item.employeeId !== null ? { id: item.employeeId } : null,
      taskName: item.taskName,
      taskDescription: item.taskDescription,
      taskCategory: item.taskCategory,
      requiredDocumentCategory: item.requiredDocumentCategory,
      dueDate: this.normalizeDateValue(item.dueDate),
      notes: item.notes,
      completed,
      taskOrder: item.taskOrder,
    };
  }

  private buildDocumentFormData(): FormData {
    const formData = new FormData();
    const employeeId = this.resolveDocumentEmployeeId();

    if (employeeId !== null) {
      formData.append('employeeId', String(employeeId));
    }

    formData.append('documentName', this.normalizeText(this.documentForm.value.documentName));
    formData.append('documentCategory', this.normalizeText(this.documentForm.value.documentCategory));
    formData.append('accessLevel', this.normalizeText(this.documentForm.value.accessLevel));
    formData.append('notes', this.normalizeText(this.documentForm.value.notes));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    return formData;
  }

  private normalizeEmployees(data: unknown): EmployeeOption[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => {
        const id = this.toNumericId(record && record.id);
        const fullName =
          this.normalizeText(record && record.fullName) ||
          [this.normalizeText(record && record.firstName), this.normalizeText(record && record.lastName)]
            .filter((item) => item)
            .join(' ');
        const joiningDate = this.normalizeDateValue(record && record.joiningDate);

        return {
          id,
          name: fullName || (id !== null ? 'Employee #' + id : 'Employee pending'),
          joiningDate,
          joiningDateLabel: joiningDate ? this.formatDate(joiningDate) : 'Joining date pending',
        };
      })
      .filter((item) => item.id !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private normalizeChecklists(
    data: unknown,
    employees: EmployeeOption[]
  ): ChecklistView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const employeeId = this.toNumericId(record && record.employee && record.employee.id);
        const employeeName =
          this.normalizeText(record && record.employee && record.employee.fullName) ||
          this.lookupEmployeeName(employeeId, employees) ||
          'Employee pending';
        const taskName = this.normalizeText(record && record.taskName) || 'Onboarding task';
        const taskDescription = this.normalizeText(record && record.taskDescription);
        const taskCategory = this.normalizeChecklistCategory(record && record.taskCategory);
        const requiredDocumentCategory = this.normalizeDocumentCategory(
          record && record.requiredDocumentCategory
        );
        const dueDate = this.normalizeDateValue(record && record.dueDate);
        const completed = record && record.completed === true;
        const dueDateObject = dueDate ? new Date(dueDate + 'T00:00:00') : null;
        const overdue = !!dueDateObject && !completed && dueDateObject.getTime() < today.getTime();

        return {
          id,
          employeeId,
          employeeName,
          taskName,
          taskDescription,
          taskCategory,
          taskCategoryLabel: this.toDisplayLabel(taskCategory),
          requiredDocumentCategory,
          requiredDocumentLabel: requiredDocumentCategory
            ? this.toDisplayLabel(requiredDocumentCategory)
            : 'No document required',
          dueDate,
          dueDateLabel: dueDate ? this.formatDate(dueDate) : 'No due date',
          completed,
          completedAt: this.normalizeText(record && record.completedAt),
          completedAtLabel: completed
            ? this.formatDateTime(record && record.completedAt)
            : 'Pending completion',
          assignedAt: this.normalizeText(record && record.assignedAt),
          assignedAtLabel: this.formatDateTime(record && record.assignedAt),
          assignedBy: this.normalizeText(record && record.assignedBy) || 'System',
          taskOrder: Math.max(0, Math.round(this.toAmount(record && record.taskOrder))),
          notes: this.normalizeText(record && record.notes),
          overdue,
          tone: this.resolveTaskTone(completed, overdue, requiredDocumentCategory),
        };
      })
      .sort((left, right) => {
        if (left.completed !== right.completed) {
          return left.completed ? 1 : -1;
        }

        if (left.employeeName !== right.employeeName) {
          return left.employeeName.localeCompare(right.employeeName);
        }

        if (left.taskOrder !== right.taskOrder) {
          return left.taskOrder - right.taskOrder;
        }

        return left.taskName.localeCompare(right.taskName);
      });
  }

  private normalizeDocuments(
    data: unknown,
    employees: EmployeeOption[]
  ): OnboardingDocumentView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const employeeId = this.toNumericId(record && record.employee && record.employee.id);
        const employeeName =
          this.normalizeText(record && record.employee && record.employee.fullName) ||
          this.lookupEmployeeName(employeeId, employees) ||
          'Employee pending';
        const documentCategory = this.normalizeDocumentCategory(record && record.documentCategory);
        const uploadedAt = this.normalizeText(record && record.uploadedAt);

        return {
          id,
          employeeId,
          employeeName,
          documentName: this.normalizeText(record && record.documentName) || 'Employee document',
          documentCategory,
          documentCategoryLabel: this.toDisplayLabel(documentCategory),
          originalFileName:
            this.normalizeText(record && record.originalFileName) ||
            this.normalizeText(record && record.storedFileName) ||
            'Document',
          accessLevel: this.normalizeAccessLevel(record && record.accessLevel),
          accessLabel:
            this.normalizeAccessLevel(record && record.accessLevel) === 'EMPLOYEE_AND_ADMIN'
              ? 'Employee + Admin'
              : 'Admin only',
          uploadedAt,
          uploadedAtLabel: this.formatDateTime(uploadedAt),
          versionNumber: Math.max(1, Math.round(this.toAmount(record && record.versionNumber))),
          activeVersion: record && record.activeVersion !== false,
          notes: this.normalizeText(record && record.notes),
        };
      })
      .sort((left, right) => {
        if (left.uploadedAt !== right.uploadedAt) {
          return right.uploadedAt.localeCompare(left.uploadedAt);
        }

        return right.versionNumber - left.versionNumber;
      });
  }

  private buildProgressCard(employeeId: number): ProgressCard | null {
    const employee = this.employees.find((item) => item.id === employeeId);
    const employeeName = employee ? employee.name : 'Employee #' + employeeId;
    const employeeTasks = this.checklists.filter((item) => item.employeeId === employeeId);
    const employeeDocuments = this.documents.filter((item) => item.employeeId === employeeId);

    if (!employeeTasks.length && !employeeDocuments.length) {
      return null;
    }

    const completedTasks = employeeTasks.filter((item) => item.completed).length;
    const openTasks = employeeTasks.length - completedTasks;
    const completionRate = employeeTasks.length
      ? Math.round((completedTasks / employeeTasks.length) * 100)
      : 0;
    const openDueDates = employeeTasks
      .filter((item) => !item.completed && item.dueDate)
      .map((item) => item.dueDate)
      .sort();
    const nextDueLabel = openDueDates.length
      ? this.formatDate(openDueDates[0])
      : employeeTasks.length
      ? 'All tasks complete'
      : 'Checklist not assigned';

    return {
      employeeId,
      employeeName,
      totalTasks: employeeTasks.length,
      completedTasks,
      openTasks,
      completionRate,
      documentCount: employeeDocuments.length,
      offerLetterUploaded: employeeDocuments.some((item) => item.documentCategory === 'OFFER_LETTER'),
      nextDueLabel,
      tone: this.resolveProgressTone(completionRate, openTasks),
    };
  }

  private resolveTaskTone(
    completed: boolean,
    overdue: boolean,
    requiredDocumentCategory: string
  ): ProgressTone {
    if (completed) {
      return 'strong';
    }

    if (overdue) {
      return 'critical';
    }

    if (requiredDocumentCategory) {
      return 'warning';
    }

    return 'medium';
  }

  private resolveProgressTone(completionRate: number, openTasks: number): ProgressTone {
    if (openTasks === 0 && completionRate === 100) {
      return 'strong';
    }

    if (completionRate >= 60) {
      return 'medium';
    }

    if (completionRate > 0) {
      return 'warning';
    }

    return 'critical';
  }

  private resolveActionEmployeeId(): number | null {
    const formEmployeeId = this.toNumericId(this.checklistForm.value.employeeId);

    if (formEmployeeId !== null) {
      return formEmployeeId;
    }

    return this.selectedEmployee !== 'all' ? this.toNumericId(this.selectedEmployee) : null;
  }

  private resolveDocumentEmployeeId(): number | null {
    const formEmployeeId = this.toNumericId(this.documentForm.value.employeeId);

    if (formEmployeeId !== null) {
      return formEmployeeId;
    }

    return this.selectedEmployee !== 'all' ? this.toNumericId(this.selectedEmployee) : null;
  }

  private resolveNextTaskOrder(employeeId: number | null): number {
    if (employeeId === null) {
      return 1;
    }

    const employeeTasks = this.checklists.filter((item) => item.employeeId === employeeId);
    return employeeTasks.length + 1;
  }

  private resetChecklistForm(employeeId: number | null): void {
    this.checklistSubmitted = false;
    this.checklistForm.reset({
      employeeId: employeeId !== null ? String(employeeId) : '',
      taskName: '',
      taskDescription: '',
      taskCategory: 'GENERAL',
      requiredDocumentCategory: '',
      dueDate: '',
      notes: '',
    });
  }

  private resetDocumentForm(employeeId: number | null): void {
    this.documentSubmitted = false;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.documentForm.reset({
      employeeId: employeeId !== null ? String(employeeId) : '',
      documentName: 'Offer Letter',
      documentCategory: 'OFFER_LETTER',
      accessLevel: 'ADMIN_ONLY',
      notes: '',
    });
  }

  private lookupEmployeeName(
    employeeId: number | null,
    employees: EmployeeOption[] = this.employees
  ): string {
    const employee = employees.find((item) => item.id === employeeId);
    return employee ? employee.name : '';
  }

  private normalizeChecklistCategory(value: unknown): string {
    const normalizedValue = this.normalizeText(value).toUpperCase();
    return this.checklistCategories.indexOf(normalizedValue) !== -1 ? normalizedValue : 'GENERAL';
  }

  private normalizeDocumentCategory(value: unknown): string {
    const normalizedValue = this.normalizeText(value).toUpperCase();

    if (normalizedValue.indexOf('OFFER') !== -1) {
      return 'OFFER_LETTER';
    }

    if (normalizedValue.indexOf('CONTRACT') === 0) {
      return 'CONTRACT';
    }

    if (normalizedValue === 'ID' || normalizedValue === 'IDS' || normalizedValue.indexOf('IDENT') === 0) {
      return 'ID';
    }

    if (normalizedValue.indexOf('CERT') === 0) {
      return 'CERTIFICATE';
    }

    return normalizedValue || 'OTHER';
  }

  private normalizeAccessLevel(value: unknown): string {
    const normalizedValue = this.normalizeText(value).toUpperCase();
    return normalizedValue.indexOf('EMPLOYEE') !== -1 ? 'EMPLOYEE_AND_ADMIN' : 'ADMIN_ONLY';
  }

  private normalizeDateValue(value: unknown): string {
    const normalizedValue = this.normalizeText(value);
    return normalizedValue ? normalizedValue : '';
  }

  private formatDate(value: string): string {
    const normalizedValue = this.normalizeText(value);

    if (!normalizedValue) {
      return 'Pending';
    }

    const date = new Date(normalizedValue + 'T00:00:00');

    if (Number.isNaN(date.getTime())) {
      return normalizedValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private formatDateTime(value: unknown): string {
    const normalizedValue = this.normalizeText(value);

    if (!normalizedValue) {
      return 'Pending';
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return normalizedValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  private toNumericId(value: unknown): number | null {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private toAmount(value: unknown): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }

      if (typeof error.message === 'string' && error.message) {
        return error.message;
      }
    }

    return 'Something went wrong while updating onboarding.';
  }
}
