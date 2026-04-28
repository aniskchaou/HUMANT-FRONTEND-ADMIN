import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface EmployeeQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface EmployeeReference {
  id: number;
  name: string;
}

interface SalaryReference {
  id: number;
  salaryName: string;
  totalSalary: string;
}

interface EmployeeDocumentRecord {
  id: number;
  employeeId: number | null;
  documentName: string;
  documentType: string;
  filePath: string;
  uploadedAt: string;
  uploadedAtLabel: string;
}

interface EmployeeCompensationRecord {
  id: number;
  employeeId: number | null;
  effectiveDate: string;
  effectiveDateLabel: string;
  salary: string;
  bonus: string;
  notes: string;
}

interface EmployeeTransferRecord {
  id: number;
  employeeId: number | null;
  fromDepartment: string;
  toDepartment: string;
  designation: string;
  noticeDate: string;
  noticeDateLabel: string;
  transferDate: string;
  transferDateLabel: string;
  description: string;
}

interface EmployeeTimelineItem {
  stamp: string;
  title: string;
  description: string;
}

type EmployeeDocumentField = 'identityProof' | 'resume' | 'contractAgreement';

interface EmployeeTrackedDocument {
  key: string;
  label: string;
  documentType: string;
  documentName: string;
  filePath: string;
  uploadedAtLabel: string;
  source: 'core' | 'record';
  documentId: number | null;
  isMissing: boolean;
}

interface EmployeeDetailItem {
  label: string;
  value: string;
  isMissing: boolean;
}

interface EmployeeDocumentUploadAction {
  key: EmployeeDocumentField;
  label: string;
  description: string;
  documentType: string;
  accept: string;
}

interface EmployeeView {
  id: number;
  fullName: string;
  phone: string;
  birthDay: string;
  birthDayLabel: string;
  gender: string;
  presentAddress: string;
  permanentAddress: string;
  photo: string;
  photoUrl: string;
  note: string;
  excerpt: string;
  departmentId: number | null;
  departmentName: string;
  roleId: number | null;
  roleName: string;
  jobId: number | null;
  jobName: string;
  managerId: number | null;
  managerName: string;
  salaryId: number | null;
  salaryName: string;
  salaryTotal: string;
  contractTypeId: number | null;
  contractTypeName: string;
  joiningDate: string;
  joiningDateLabel: string;
  emergencyContactNumber: string;
  contactNumber: string;
  contactNote: string;
  identityProof: string;
  resume: string;
  offerLetter: string;
  joiningLetter: string;
  contractAgreement: string;
  maritalStatus: string;
  numberOfChildren: number | null;
  assignmentReady: boolean;
  contactReady: boolean;
  profileReady: boolean;
  profileLabel: EmployeeQuality['label'];
  profileTone: EmployeeQuality['tone'];
  profileScore: number;
  roleSummary: string;
  documentCount: number;
  directReportCount: number;
  compensationHistoryCount: number;
  latestCompensationLabel: string;
  transferHistoryCount: number;
}

type EmployeeFilter = 'all' | 'ready' | 'missing-contact' | 'missing-assignment';
type EmployeeSort = 'quality' | 'name-asc' | 'latest-join';
type EmployeeEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  uploadingDocumentField: EmployeeDocumentField | '' = '';
  loadError = '';

  activeFilter: EmployeeFilter = 'all';
  activeSort: EmployeeSort = 'quality';
  searchTerm = '';

  modalMode: EmployeeEditorMode = 'create';
  activeEmployeeId: number = null;

  employees: EmployeeView[] = [];
  filteredEmployees: EmployeeView[] = [];
  featuredEmployee: EmployeeView = null;

  departments: EmployeeReference[] = [];
  roles: EmployeeReference[] = [];
  jobs: EmployeeReference[] = [];
  managers: EmployeeReference[] = [];
  salaries: SalaryReference[] = [];
  contractTypes: EmployeeReference[] = [];
  documents: EmployeeDocumentRecord[] = [];
  compensationHistories: EmployeeCompensationRecord[] = [];
  transfers: EmployeeTransferRecord[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4, 5, 6];
  readonly photoPresets = Array.from(
    { length: 8 },
    (_, index) => 'assets/images/faces/' + (index + 1) + '.jpg'
  );
  readonly documentUploadActions: EmployeeDocumentUploadAction[] = [
    {
      key: 'identityProof',
      label: 'ID document',
      description: 'Register passport, ID card, or residency proof on the employee record.',
      documentType: 'ID',
      accept: '.pdf,.png,.jpg,.jpeg,.doc,.docx',
    },
    {
      key: 'contractAgreement',
      label: 'Contract',
      description: 'Track the signed contract or agreement file used for employment review.',
      documentType: 'Contract',
      accept: '.pdf,.doc,.docx',
    },
    {
      key: 'resume',
      label: 'CV',
      description: 'Keep the latest CV or resume linked directly from the employee profile.',
      documentType: 'CV',
      accept: '.pdf,.doc,.docx',
    },
  ];
  readonly employeeForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.employeeForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.maxLength(120)]],
      phone: ['', [Validators.maxLength(40)]],
      birthDay: [''],
      gender: [''],
      presentAddress: ['', [Validators.maxLength(240)]],
      permanentAddress: ['', [Validators.maxLength(240)]],
      photo: ['', [Validators.maxLength(255)]],
      joiningDate: [''],
      departmentId: [''],
      roleId: [''],
      jobId: [''],
      managerId: [''],
      salaryId: [''],
      contractTypeId: [''],
      maritalStatus: ['', [Validators.maxLength(60)]],
      numberOfChildren: [null, [Validators.min(0)]],
      emergencyContactNumber: ['', [Validators.maxLength(40)]],
      contactNumber: ['', [Validators.maxLength(40)]],
      contactNote: ['', [Validators.maxLength(240)]],
      identityProof: ['', [Validators.maxLength(160)]],
      resume: ['', [Validators.maxLength(160)]],
      offerLetter: ['', [Validators.maxLength(160)]],
      joiningLetter: ['', [Validators.maxLength(160)]],
      contractAgreement: ['', [Validators.maxLength(160)]],
      note: ['', [Validators.maxLength(600)]],
    });
  }

  ngOnInit(): void {
    this.loadEmployeeWorkspace();
    super.loadScripts();
  }

  get totalEmployeesCount(): number {
    return this.employees.length;
  }

  get profileReadyCount(): number {
    return this.employees.filter((employee) => employee.profileReady).length;
  }

  get assignedEmployeesCount(): number {
    return this.employees.filter((employee) => employee.assignmentReady).length;
  }

  get photoReadyCount(): number {
    return this.employees.filter((employee) => !!employee.photoUrl).length;
  }

  get contactGapCount(): number {
    return this.employees.filter((employee) => !employee.contactReady).length;
  }

  get profileCoverage(): number {
    return this.toPercent(this.profileReadyCount, Math.max(this.totalEmployeesCount, 1));
  }

  get assignmentCoverage(): number {
    return this.toPercent(this.assignedEmployeesCount, Math.max(this.totalEmployeesCount, 1));
  }

  get photoCoverage(): number {
    return this.toPercent(this.photoReadyCount, Math.max(this.totalEmployeesCount, 1));
  }

  get averageProfileScore(): number {
    if (!this.employees.length) {
      return 0;
    }

    const totalScore = this.employees.reduce(
      (sum, employee) => sum + employee.profileScore,
      0
    );

    return Math.round(totalScore / this.employees.length);
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredEmployees.length);
    const totalCount = this.formatCount(this.employees.length);

    return this.filteredEmployees.length === this.employees.length
      ? filteredCount + ' profiles'
      : filteredCount + ' of ' + totalCount + ' profiles';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create employee' : 'Edit employee';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Capture the core employee profile, assignment, and employment context in one polished flow.'
      : 'Refine the employee profile and keep people data current across the directory.';
  }

  get draftName(): string {
    return this.normalizeText(this.employeeForm.value.fullName) || 'Unnamed employee';
  }

  get draftRoleSummary(): string {
    const roleName = this.lookupOptionName(this.roles, this.employeeForm.value.roleId);
    const jobName = this.lookupOptionName(this.jobs, this.employeeForm.value.jobId);
    const departmentName = this.lookupOptionName(
      this.departments,
      this.employeeForm.value.departmentId
    );
    const managerName = this.lookupOptionName(this.managers, this.employeeForm.value.managerId);

    return (
      [
        roleName || jobName,
        departmentName,
        managerName ? 'Reports to ' + managerName : '',
      ]
        .filter(Boolean)
        .join(' • ') || 'Assignment pending'
    );
  }

  get draftPhotoUrl(): string {
    return this.resolveEmployeePhoto(this.employeeForm.value.photo);
  }

  get draftProfileQuality(): EmployeeQuality {
    return this.evaluateEmployeeQuality({
      fullName: this.normalizeText(this.employeeForm.value.fullName),
      phone: this.normalizeText(this.employeeForm.value.phone),
      presentAddress: this.normalizeText(this.employeeForm.value.presentAddress),
      departmentName: this.lookupOptionName(this.departments, this.employeeForm.value.departmentId),
      roleName: this.lookupOptionName(this.roles, this.employeeForm.value.roleId),
      jobName: this.lookupOptionName(this.jobs, this.employeeForm.value.jobId),
      managerName: this.lookupOptionName(this.managers, this.employeeForm.value.managerId),
      joiningDate: this.normalizeDateString(this.employeeForm.value.joiningDate),
      contractTypeName: this.lookupOptionName(
        this.contractTypes,
        this.employeeForm.value.contractTypeId
      ),
      emergencyContactNumber: this.normalizeText(
        this.employeeForm.value.emergencyContactNumber
      ),
      photo: this.normalizeText(this.employeeForm.value.photo),
      identityProof: this.normalizeText(this.employeeForm.value.identityProof),
      resume: this.normalizeText(this.employeeForm.value.resume),
      contractAgreement: this.normalizeText(this.employeeForm.value.contractAgreement),
    });
  }

  get draftNote(): string {
    return (
      this.normalizeText(this.employeeForm.value.note) ||
      'Add a short summary covering responsibilities, onboarding state, or any notable employee context.'
    );
  }

  get formControls() {
    return this.employeeForm.controls;
  }

  get featuredPersonalDetails(): EmployeeDetailItem[] {
    if (!this.featuredEmployee) {
      return [];
    }

    return [
      {
        label: 'Birthday',
        value: this.featuredEmployee.birthDay
          ? this.featuredEmployee.birthDayLabel
          : 'Not set',
        isMissing: !this.featuredEmployee.birthDay,
      },
      {
        label: 'Gender',
        value:
          this.featuredEmployee.gender &&
          this.featuredEmployee.gender !== 'Not specified'
            ? this.featuredEmployee.gender
            : 'Not set',
        isMissing:
          !this.featuredEmployee.gender ||
          this.featuredEmployee.gender === 'Not specified',
      },
      {
        label: 'Marital status',
        value: this.featuredEmployee.maritalStatus || 'Not set',
        isMissing: !this.featuredEmployee.maritalStatus,
      },
      {
        label: 'Children',
        value:
          this.featuredEmployee.numberOfChildren != null
            ? String(this.featuredEmployee.numberOfChildren)
            : 'Not set',
        isMissing: this.featuredEmployee.numberOfChildren == null,
      },
      {
        label: 'Primary phone',
        value: this.featuredEmployee.phone || 'Not set',
        isMissing: !this.featuredEmployee.phone,
      },
      {
        label: 'Alternative contact',
        value: this.featuredEmployee.contactNumber || 'Not set',
        isMissing: !this.featuredEmployee.contactNumber,
      },
      {
        label: 'Emergency contact',
        value: this.featuredEmployee.emergencyContactNumber || 'Not set',
        isMissing: !this.featuredEmployee.emergencyContactNumber,
      },
      {
        label: 'Present address',
        value: this.featuredEmployee.presentAddress || 'Not set',
        isMissing: !this.featuredEmployee.presentAddress,
      },
      {
        label: 'Permanent address',
        value: this.featuredEmployee.permanentAddress || 'Not set',
        isMissing: !this.featuredEmployee.permanentAddress,
      },
    ];
  }

  get featuredPersonalDetailCount(): number {
    return this.featuredPersonalDetails.filter((item) => !item.isMissing).length;
  }

  get featuredTrackedDocuments(): EmployeeTrackedDocument[] {
    if (!this.featuredEmployee) {
      return [];
    }

    const coreDocuments = [
      this.toTrackedDocument(
        'identityProof',
        'ID document',
        'ID',
        this.featuredEmployee.identityProof
      ),
      this.toTrackedDocument(
        'contractAgreement',
        'Contract',
        'Contract',
        this.featuredEmployee.contractAgreement
      ),
      this.toTrackedDocument(
        'resume',
        'CV',
        'CV',
        this.featuredEmployee.resume
      ),
    ];

    const trackedPaths = new Set(
      coreDocuments
        .map((document) => document.filePath)
        .filter((filePath) => !!filePath)
    );

    const supportingDocuments = this.featuredDocumentRecords
      .filter((document) => !trackedPaths.has(document.filePath))
      .map((document) => ({
        key: 'document-' + document.id,
        label: document.documentType || 'Supporting record',
        documentType: document.documentType || 'Supporting record',
        documentName: document.documentName,
        filePath: document.filePath,
        uploadedAtLabel: document.uploadedAtLabel,
        source: 'record' as const,
        documentId: document.id,
        isMissing: false,
      }));

    return [...coreDocuments, ...supportingDocuments];
  }

  get featuredTrackedDocumentCount(): number {
    return this.featuredTrackedDocuments.filter((document) => !document.isMissing).length;
  }

  get featuredDocumentRecords(): EmployeeDocumentRecord[] {
    if (!this.featuredEmployee) {
      return [];
    }

    return this.documents.filter(
      (document) => document.employeeId === this.featuredEmployee.id
    );
  }

  get featuredCompensationRecords(): EmployeeCompensationRecord[] {
    if (!this.featuredEmployee) {
      return [];
    }

    return this.compensationHistories.filter(
      (record) => record.employeeId === this.featuredEmployee.id
    );
  }

  get featuredTransferRecords(): EmployeeTransferRecord[] {
    if (!this.featuredEmployee) {
      return [];
    }

    return this.transfers.filter(
      (record) => record.employeeId === this.featuredEmployee.id
    );
  }

  get featuredTimeline(): EmployeeTimelineItem[] {
    if (!this.featuredEmployee) {
      return [];
    }

    const timeline: EmployeeTimelineItem[] = [
      {
        stamp: this.featuredEmployee.joiningDateLabel,
        title: 'Joined the organization',
        description:
          [
            this.featuredEmployee.roleName || this.featuredEmployee.jobName,
            this.featuredEmployee.departmentName,
          ]
            .filter(Boolean)
            .join(' • ') || 'Initial assignment is still being completed.',
      },
      {
        stamp: 'Current',
        title: 'Current assignment',
        description:
          [
            this.featuredEmployee.roleName || this.featuredEmployee.jobName,
            this.featuredEmployee.departmentName,
            this.featuredEmployee.managerName
              ? 'Reports to ' + this.featuredEmployee.managerName
              : '',
          ]
            .filter(Boolean)
            .join(' • ') || 'Assignment pending.',
      },
    ];

    this.featuredTransferRecords.forEach((record) => {
      timeline.push({
        stamp: record.transferDateLabel,
        title: 'Department transfer',
        description:
          [record.fromDepartment, record.toDepartment]
            .filter(Boolean)
            .join(' → ') || record.description || 'Transfer recorded.',
      });
    });

    return timeline;
  }

  get featuredRecommendation(): string {
    if (!this.featuredEmployee) {
      return 'Select an employee to review the profile quality and the most useful next update.';
    }

    if (!this.featuredEmployee.contactReady) {
      return 'Add missing phone, address, or emergency contact details so the employee record is operationally usable.';
    }

    if (!this.featuredEmployee.assignmentReady) {
      return 'Assign the department, business role, reporting manager, and contract so the employee is anchored in the organization structure.';
    }

    if (!this.featuredEmployee.photoUrl) {
      return 'Add a portrait so the employee is instantly recognizable across the premium people workspace.';
    }

    if (!this.featuredEmployee.profileReady) {
      return 'Complete the remaining employment, document, or history fields to make the profile audit-ready.';
    }

    return 'This employee profile is strong enough for directory use, operational reviews, and employment tracking.';
  }

  get featuredNextAction(): string {
    if (!this.featuredEmployee) {
      return 'Choose a profile from the directory or create a new employee record to begin.';
    }

    if (!this.featuredEmployee.contactReady) {
      return 'Next action: complete contact details and emergency information.';
    }

    if (!this.featuredEmployee.assignmentReady) {
      return 'Next action: set department, business role, reporting manager, and employment contract details.';
    }

    if (!this.featuredEmployee.photoUrl) {
      return 'Next action: link a portrait or employee image path for directory visibility.';
    }

    if (!this.featuredEmployee.profileReady) {
      return 'Next action: finish supporting documents and employee notes.';
    }

    return 'Next action: keep the profile current as assignment or employment details change.';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.activeEmployeeId = null;
    this.submitted = false;
    this.employeeForm.reset({
      fullName: '',
      phone: '',
      birthDay: '',
      gender: '',
      presentAddress: '',
      permanentAddress: '',
      photo: '',
      joiningDate: '',
      departmentId: '',
      roleId: '',
      jobId: '',
      managerId: '',
      salaryId: '',
      contractTypeId: '',
      maritalStatus: '',
      numberOfChildren: null,
      emergencyContactNumber: '',
      contactNumber: '',
      contactNote: '',
      identityProof: '',
      resume: '',
      offerLetter: '',
      joiningLetter: '',
      contractAgreement: '',
      note: '',
    });
  }

  openEditModal(employee: EmployeeView): void {
    this.modalMode = 'edit';
    this.activeEmployeeId = employee.id;
    this.submitted = false;
    this.selectEmployee(employee);
    this.employeeForm.reset({
      fullName: employee.fullName,
      phone: employee.phone,
      birthDay: employee.birthDay,
      gender: employee.gender,
      presentAddress: employee.presentAddress,
      permanentAddress: employee.permanentAddress,
      photo: employee.photo,
      joiningDate: employee.joiningDate,
      departmentId: employee.departmentId || '',
      roleId: employee.roleId || '',
      jobId: employee.jobId || '',
      managerId: employee.managerId || '',
      salaryId: employee.salaryId || '',
      contractTypeId: employee.contractTypeId || '',
      maritalStatus: employee.maritalStatus,
      numberOfChildren: employee.numberOfChildren,
      emergencyContactNumber: employee.emergencyContactNumber,
      contactNumber: employee.contactNumber,
      contactNote: employee.contactNote,
      identityProof: employee.identityProof,
      resume: employee.resume,
      offerLetter: employee.offerLetter,
      joiningLetter: employee.joiningLetter,
      contractAgreement: employee.contractAgreement,
      note: employee.note,
    });
  }

  resetEditor(): void {
    this.activeEmployeeId = null;
    this.submitted = false;
    this.saving = false;
    this.openCreateModal();
  }

  selectEmployee(employee: EmployeeView): void {
    this.featuredEmployee = employee;
  }

  openDetailsModal(employee: EmployeeView): void {
    this.selectEmployee(employee);

    window.requestAnimationFrame(() => {
      this.showModal('employeeDetailsModal');
    });
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: EmployeeFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: EmployeeSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshEmployees(): void {
    this.loadEmployeeWorkspace(true);
  }

  trackByEmployeeId(index: number, employee: EmployeeView): number {
    return employee.id || index;
  }

  applyPhotoPreset(photo: string): void {
    this.employeeForm.patchValue({ photo });
  }

  clearPhoto(): void {
    this.employeeForm.patchValue({ photo: '' });
  }

  clearDocumentField(controlName: string): void {
    this.employeeForm.patchValue({ [controlName]: '' });
  }

  useSelectedDocument(controlName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target && target.files && target.files[0];

    if (!file) {
      return;
    }

    this.employeeForm.patchValue({
      [controlName]: '/files/uploads/' + this.sanitizeFileName(file.name),
    });

    target.value = '';
  }

  async uploadEmployeeDocument(
    action: EmployeeDocumentUploadAction,
    event: Event
  ): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input && input.files && input.files[0];

    if (!this.featuredEmployee || !this.featuredEmployee.id) {
      if (input) {
        input.value = '';
      }

      super.show('Warning', 'Select an employee before uploading documents.', 'warning');
      return;
    }

    if (!file) {
      return;
    }

    const employee = this.featuredEmployee;
    const documentReference = this.buildTrackedDocumentReference(
      employee.id,
      action.key,
      file.name
    );
    const overrides = {} as Partial<EmployeeView>;
    overrides[action.key] = documentReference;

    this.uploadingDocumentField = action.key;

    try {
      await this.httpService.create(CONFIG.URL_BASE + '/api/documents', {
        documentName: file.name,
        documentType: action.documentType,
        filePath: documentReference,
        employee: { id: employee.id },
        uploadedAt: this.getCurrentDateTimeString(),
      });

      await this.httpService.update(
        CONFIG.URL_BASE + '/employee/update/' + employee.id,
        this.buildEmployeePayloadFromView(employee, overrides)
      );

      super.show(
        'Confirmation',
        action.label + ' uploaded and linked to the employee profile.',
        'success'
      );
      this.loadEmployeeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.uploadingDocumentField = '';
      if (input) {
        input.value = '';
      }
    }
  }

  getEmployeeInitials(fullName: string): string {
    const tokens = this.normalizeText(fullName)
      .split(/\s+/)
      .filter((value) => value.length > 0);

    if (!tokens.length) {
      return 'EM';
    }

    return tokens
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  }

  async saveEmployee(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeEmployeeId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/employee/update/' + this.activeEmployeeId,
          payload
        );
        super.show('Confirmation', 'Employee updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/employee/create', payload);
        super.show('Confirmation', 'Employee created successfully.', 'success');
      }

      this.closeCrudModal();
      this.openCreateModal();
      this.loadEmployeeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async delete(employee: EmployeeView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + employee.fullName + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = employee.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/employee/delete/' + employee.id
      );
      super.show('Confirmation', 'Employee deleted successfully.', 'success');

      if (this.featuredEmployee && this.featuredEmployee.id === employee.id) {
        this.featuredEmployee = null;
      }

      this.loadEmployeeWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  private loadEmployeeWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      employees: this.httpService.getAll(CONFIG.URL_BASE + '/employee/all'),
      departments: this.httpService
        .getAll(CONFIG.URL_BASE + '/departement/all')
        .pipe(catchError(() => of([]))),
      jobs: this.httpService
        .getAll(CONFIG.URL_BASE + '/job/all')
        .pipe(catchError(() => of([]))),
      salaries: this.httpService
        .getAll(CONFIG.URL_BASE + '/salary/all')
        .pipe(catchError(() => of([]))),
      contractTypes: this.httpService
        .getAll(CONFIG.URL_BASE + '/contracttype/all')
        .pipe(catchError(() => of([]))),
      roles: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/roles')
        .pipe(catchError(() => of([]))),
      documents: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/documents')
        .pipe(catchError(() => of([]))),
      compensationHistories: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/compensation-histories')
        .pipe(catchError(() => of([]))),
      transfers: this.httpService
        .getAll(CONFIG.URL_BASE + '/transfer/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.departments = this.normalizeReferenceOptions(result.departments);
          this.jobs = this.normalizeReferenceOptions(result.jobs);
          this.salaries = this.normalizeSalaryOptions(result.salaries);
          this.contractTypes = this.normalizeReferenceOptions(result.contractTypes);
          this.roles = this.normalizeReferenceOptions(result.roles);
          this.documents = this.normalizeDocuments(result.documents);
          this.compensationHistories = this.normalizeCompensationHistories(
            result.compensationHistories
          );
          this.transfers = this.normalizeTransfers(result.transfers);
          this.employees = this.normalizeEmployees(result.employees);
          this.managers = this.employees.map((employee) => ({
            id: employee.id,
            name: employee.fullName,
          }));
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Employees refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.employees = [];
          this.filteredEmployees = [];
          this.featuredEmployee = null;
          this.loadError = 'Unable to load employee records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredEmployees = this.employees
      .filter((employee) => {
        const matchesSearch =
          !searchValue ||
          employee.fullName.toLowerCase().includes(searchValue) ||
          employee.phone.toLowerCase().includes(searchValue) ||
          employee.departmentName.toLowerCase().includes(searchValue) ||
          employee.roleName.toLowerCase().includes(searchValue) ||
          employee.managerName.toLowerCase().includes(searchValue) ||
          employee.jobName.toLowerCase().includes(searchValue) ||
          employee.presentAddress.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'ready'
            ? employee.profileReady
            : this.activeFilter === 'missing-contact'
            ? !employee.contactReady
            : !employee.assignmentReady;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.fullName.localeCompare(right.fullName);
        }

        if (this.activeSort === 'latest-join') {
          return right.joiningDate.localeCompare(left.joiningDate);
        }

        const scoreDifference = right.profileScore - left.profileScore;
        return scoreDifference !== 0
          ? scoreDifference
          : left.fullName.localeCompare(right.fullName);
      });

    if (!this.filteredEmployees.length) {
      this.featuredEmployee = null;
      return;
    }

    if (
      !this.featuredEmployee ||
      !this.filteredEmployees.some(
        (employee) => employee.id === this.featuredEmployee.id
      )
    ) {
      this.featuredEmployee = this.filteredEmployees[0];
    }
  }

  private normalizeEmployees(data: unknown): EmployeeView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const employees = data
      .filter((record) => this.normalizeText(record && record.fullName).length > 0)
      .map((record, index) => this.toEmployeeView(record, index));

    const directReportCountMap = employees.reduce((map, employee) => {
      if (!employee.managerId) {
        return map;
      }

      map.set(employee.managerId, (map.get(employee.managerId) || 0) + 1);
      return map;
    }, new Map<number, number>());

    return employees.map((employee) => ({
      ...employee,
      directReportCount: directReportCountMap.get(employee.id) || 0,
      roleSummary:
        [
          employee.roleName || employee.jobName,
          employee.departmentName,
          employee.managerName ? 'Reports to ' + employee.managerName : '',
        ]
          .filter(Boolean)
          .join(' • ') || 'Assignment pending',
    }));
  }

  private toEmployeeView(record: any, index: number): EmployeeView {
    const fullName = this.normalizeText(record && record.fullName) || 'Unnamed employee';
    const phone = this.normalizeText(record && record.phone);
    const gender = this.normalizeText(record && record.gender) || 'Not specified';
    const presentAddress = this.normalizeText(record && record.presentAddress);
    const permanentAddress = this.normalizeText(record && record.permanentAddress);
    const photo = this.normalizeText(record && record.photo);
    const photoUrl = this.resolveEmployeePhoto(photo);
    const note = this.normalizeText(record && record.note);
    const departmentName = this.normalizeText(record && record.department && record.department.name);
    const roleName = this.normalizeText(record && record.role && record.role.name);
    const jobName = this.normalizeText(record && record.job && record.job.name);
    const managerName = this.normalizeText(
      record && record.manager && record.manager.fullName
    );
    const salaryName = this.normalizeText(
      record && record.salary && (record.salary.salaryName || record.salary.SalaryName)
    );
    const salaryTotal = this.normalizeText(
      record && record.salary && (record.salary.totalSalary || record.salary.TotalSalary)
    );
    const contractTypeName = this.normalizeText(
      record && record.contractType && record.contractType.name
    );
    const joiningDate = this.normalizeDateString(record && record.joiningDate);
    const birthDay = this.normalizeDateString(record && record.birthDay);
    const emergencyContactNumber = this.normalizeText(
      record && record.emergencyContactNumber
    );
    const contactNumber = this.normalizeText(record && record.contactNumber);
    const contactNote = this.normalizeText(record && record.contactNote);
    const identityProof = this.normalizeText(record && record.identityProof);
    const resume = this.normalizeText(record && record.resume);
    const offerLetter = this.normalizeText(record && record.offerLetter);
    const joiningLetter = this.normalizeText(record && record.joiningLetter);
    const contractAgreement = this.normalizeText(record && record.contractAgreement);
    const maritalStatus = this.normalizeText(record && record.maritalStatus);
    const numberOfChildren = this.normalizeNonNegativeNumber(
      record && record.numberOfChildren
    );
    const numericId = Number(record && record.id);
    const employeeId = Number.isFinite(numericId) ? numericId : index + 1;
    const coreDocumentCount = [
      identityProof,
      resume,
      offerLetter,
      joiningLetter,
      contractAgreement,
    ].filter((value) => !!value).length;
    const linkedDocumentCount = this.documents.filter(
      (document) => document.employeeId === employeeId
    ).length;
    const compensationHistory = this.compensationHistories.filter(
      (entry) => entry.employeeId === employeeId
    );
    const transferHistory = this.transfers.filter(
      (entry) => entry.employeeId === employeeId
    );
    const quality = this.evaluateEmployeeQuality({
      fullName,
      phone,
      presentAddress,
      departmentName,
      roleName,
      jobName,
      managerName,
      joiningDate,
      contractTypeName,
      emergencyContactNumber,
      photo,
      identityProof,
      resume,
      contractAgreement,
    });

    return {
      id: employeeId,
      fullName,
      phone,
      birthDay,
      birthDayLabel: this.formatDateLabel(birthDay, 'Birthday not set'),
      gender,
      presentAddress,
      permanentAddress,
      photo,
      photoUrl,
      note,
      excerpt: this.buildExcerpt(
        note,
        presentAddress,
        roleName || jobName,
        departmentName
      ),
      departmentId: this.normalizeNumericId(
        record && record.department && record.department.id
      ),
      departmentName: departmentName || 'Department pending',
      roleId: this.normalizeNumericId(record && record.role && record.role.id),
      roleName,
      jobId: this.normalizeNumericId(record && record.job && record.job.id),
      jobName: jobName || 'Role pending',
      managerId: this.normalizeNumericId(record && record.manager && record.manager.id),
      managerName,
      salaryId: this.normalizeNumericId(record && record.salary && record.salary.id),
      salaryName: salaryName || 'Salary pending',
      salaryTotal,
      contractTypeId: this.normalizeNumericId(
        record && record.contractType && record.contractType.id
      ),
      contractTypeName: contractTypeName || 'Contract pending',
      joiningDate,
      joiningDateLabel: this.formatDateLabel(joiningDate, 'Joining date not set'),
      emergencyContactNumber,
      contactNumber,
      contactNote,
      identityProof,
      resume,
      offerLetter,
      joiningLetter,
      contractAgreement,
      maritalStatus,
      numberOfChildren,
      assignmentReady: !!departmentName && !!(roleName || jobName) && !!managerName && !!contractTypeName,
      contactReady: !!phone && !!presentAddress && !!emergencyContactNumber,
      profileReady: quality.score >= 85,
      profileLabel: quality.label,
      profileTone: quality.tone,
      profileScore: quality.score,
      roleSummary: [roleName || jobName, departmentName].filter(Boolean).join(' • ') || 'Assignment pending',
      documentCount: coreDocumentCount + linkedDocumentCount,
      directReportCount: 0,
      compensationHistoryCount: compensationHistory.length,
      latestCompensationLabel: compensationHistory.length
        ? compensationHistory[0].effectiveDateLabel
        : '',
      transferHistoryCount: transferHistory.length,
    };
  }

  private evaluateEmployeeQuality(input: {
    fullName: string;
    phone: string;
    presentAddress: string;
    departmentName: string;
    roleName: string;
    jobName: string;
    managerName: string;
    joiningDate: string;
    contractTypeName: string;
    emergencyContactNumber: string;
    photo: string;
    identityProof: string;
    resume: string;
    contractAgreement: string;
  }): EmployeeQuality {
    const signals = [
      !!input.fullName,
      !!input.phone,
      !!input.presentAddress,
      !!input.departmentName,
      !!input.roleName || !!input.jobName,
      !!input.managerName,
      !!input.joiningDate,
      !!input.contractTypeName,
      !!input.emergencyContactNumber,
      !!input.photo,
      !!input.identityProof || !!input.resume || !!input.contractAgreement,
    ].filter(Boolean).length;
    const score = Math.round((signals / 9) * 100);

    if (score >= 85) {
      return {
        label: 'Ready profile',
        tone: 'strong',
        score,
      };
    }

    if (score >= 65) {
      return {
        label: 'Solid profile',
        tone: 'medium',
        score,
      };
    }

    if (score > 0) {
      return {
        label: 'Needs detail',
        tone: 'warning',
        score: Math.max(score, 24),
      };
    }

    return {
      label: 'Missing profile',
      tone: 'critical',
      score: 12,
    };
  }

  private buildExcerpt(
    note: string,
    presentAddress: string,
    jobName: string,
    departmentName: string
  ): string {
    const summary =
      note ||
      [jobName, departmentName].filter(Boolean).join(' • ') ||
      presentAddress ||
      'Add contact and assignment context to strengthen this employee profile.';

    return summary.length > 170
      ? summary.slice(0, 167).trim() + '...'
      : summary;
  }

  private normalizeReferenceOptions(data: unknown): EmployeeReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => ({
        id: this.normalizeNumericId(item && item.id) || 0,
        name: this.normalizeText(item && item.name),
      }))
      .filter((item) => item.id > 0 && !!item.name);
  }

  private normalizeSalaryOptions(data: unknown): SalaryReference[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => ({
        id: this.normalizeNumericId(item && item.id) || 0,
        salaryName: this.normalizeText(
          item && (item.salaryName || item.SalaryName)
        ),
        totalSalary: this.normalizeText(
          item && (item.totalSalary || item.TotalSalary)
        ),
      }))
      .filter((item) => item.id > 0 && !!item.salaryName);
  }

  private normalizeDocuments(data: unknown): EmployeeDocumentRecord[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => ({
        id: this.normalizeNumericId(item && item.id) || index + 1,
        employeeId: this.normalizeNumericId(item && item.employee && item.employee.id),
        documentName: this.normalizeText(item && item.documentName) || 'Untitled document',
        documentType: this.normalizeText(item && item.documentType) || 'Record',
        filePath: this.normalizeText(item && item.filePath),
        uploadedAt: this.normalizeDateString(item && item.uploadedAt),
        uploadedAtLabel: this.formatDateLabel(
          this.normalizeDateString(item && item.uploadedAt),
          'Date not set'
        ),
      }))
      .filter((item) => !!item.employeeId)
      .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
  }

  private normalizeCompensationHistories(data: unknown): EmployeeCompensationRecord[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => {
        const effectiveDate = this.normalizeDateString(item && item.effectiveDate);

        return {
          id: this.normalizeNumericId(item && item.id) || index + 1,
          employeeId: this.normalizeNumericId(item && item.employee && item.employee.id),
          effectiveDate,
          effectiveDateLabel: this.formatDateLabel(effectiveDate, 'Date not set'),
          salary: this.normalizeDisplayValue(item && item.salary),
          bonus: this.normalizeDisplayValue(item && item.bonus),
          notes: this.normalizeText(item && item.notes),
        };
      })
      .filter((item) => !!item.employeeId)
      .sort((left, right) => right.effectiveDate.localeCompare(left.effectiveDate));
  }

  private normalizeTransfers(data: unknown): EmployeeTransferRecord[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => {
        const noticeDate = this.normalizeDateString(item && item.noticeDate);
        const transferDate = this.normalizeDateString(item && item.transferDate);

        return {
          id: this.normalizeNumericId(item && item.id) || index + 1,
          employeeId: this.normalizeNumericId(
            item && item.employeeName && item.employeeName.id
          ),
          fromDepartment: this.normalizeText(
            item && item.departementFrom && item.departementFrom.name
          ),
          toDepartment: this.normalizeText(
            item && item.departementTo && item.departementTo.name
          ),
          designation: this.normalizeText(item && item.designation),
          noticeDate,
          noticeDateLabel: this.formatDateLabel(noticeDate, 'Notice date not set'),
          transferDate,
          transferDateLabel: this.formatDateLabel(transferDate, 'Transfer date not set'),
          description: this.normalizeText(item && item.description),
        };
      })
      .filter((item) => !!item.employeeId)
      .sort((left, right) => right.transferDate.localeCompare(left.transferDate));
  }

  private buildPayload(): any | null {
    const fullName = this.normalizeText(this.employeeForm.value.fullName);

    this.employeeForm.patchValue(
      {
        fullName,
        phone: this.normalizeText(this.employeeForm.value.phone),
        gender: this.normalizeText(this.employeeForm.value.gender),
        presentAddress: this.normalizeText(this.employeeForm.value.presentAddress),
        permanentAddress: this.normalizeText(this.employeeForm.value.permanentAddress),
        photo: this.normalizeText(this.employeeForm.value.photo),
        maritalStatus: this.normalizeText(this.employeeForm.value.maritalStatus),
        emergencyContactNumber: this.normalizeText(
          this.employeeForm.value.emergencyContactNumber
        ),
        contactNumber: this.normalizeText(this.employeeForm.value.contactNumber),
        contactNote: this.normalizeText(this.employeeForm.value.contactNote),
        identityProof: this.normalizeText(this.employeeForm.value.identityProof),
        resume: this.normalizeText(this.employeeForm.value.resume),
        offerLetter: this.normalizeText(this.employeeForm.value.offerLetter),
        joiningLetter: this.normalizeText(this.employeeForm.value.joiningLetter),
        contractAgreement: this.normalizeText(
          this.employeeForm.value.contractAgreement
        ),
        note: this.normalizeText(this.employeeForm.value.note),
      },
      { emitEvent: false }
    );

    if (!fullName) {
      this.employeeForm.get('fullName').setErrors({ required: true });
      return null;
    }

    if (this.employeeForm.invalid) {
      return null;
    }

    return {
      fullName,
      phone: this.normalizeText(this.employeeForm.value.phone),
      birthDay: this.normalizeDateString(this.employeeForm.value.birthDay) || null,
      gender: this.normalizeText(this.employeeForm.value.gender),
      presentAddress: this.normalizeText(this.employeeForm.value.presentAddress),
      permanentAddress: this.normalizeText(this.employeeForm.value.permanentAddress),
      photo: this.normalizeText(this.employeeForm.value.photo),
      joiningDate: this.normalizeDateString(this.employeeForm.value.joiningDate) || null,
      department: this.buildReference(this.employeeForm.value.departmentId),
      role: this.buildReference(this.employeeForm.value.roleId),
      job: this.buildReference(this.employeeForm.value.jobId),
      manager: this.buildReference(this.employeeForm.value.managerId),
      salary: this.buildReference(this.employeeForm.value.salaryId),
      contractType: this.buildReference(this.employeeForm.value.contractTypeId),
      maritalStatus: this.normalizeText(this.employeeForm.value.maritalStatus),
      numberOfChildren: this.normalizeNonNegativeNumber(
        this.employeeForm.value.numberOfChildren
      ),
      emergencyContactNumber: this.normalizeText(
        this.employeeForm.value.emergencyContactNumber
      ),
      contactNumber: this.normalizeText(this.employeeForm.value.contactNumber),
      contactNote: this.normalizeText(this.employeeForm.value.contactNote),
      identityProof: this.normalizeText(this.employeeForm.value.identityProof),
      resume: this.normalizeText(this.employeeForm.value.resume),
      offerLetter: this.normalizeText(this.employeeForm.value.offerLetter),
      joiningLetter: this.normalizeText(this.employeeForm.value.joiningLetter),
      contractAgreement: this.normalizeText(this.employeeForm.value.contractAgreement),
      note: this.normalizeText(this.employeeForm.value.note),
    };
  }

  private buildReference(value: unknown): { id: number } | null {
    const id = this.normalizeNumericId(value);

    return id ? { id } : null;
  }

  private buildEmployeePayloadFromView(
    employee: EmployeeView,
    overrides: Partial<EmployeeView> = {}
  ): any {
    const merged = {
      ...employee,
      ...overrides,
    };

    return {
      fullName: this.normalizeText(merged.fullName),
      phone: this.normalizeText(merged.phone),
      birthDay: this.normalizeDateString(merged.birthDay) || null,
      gender:
        merged.gender === 'Not specified' ? '' : this.normalizeText(merged.gender),
      presentAddress: this.normalizeText(merged.presentAddress),
      permanentAddress: this.normalizeText(merged.permanentAddress),
      photo: this.normalizeText(merged.photo),
      joiningDate: this.normalizeDateString(merged.joiningDate) || null,
      department: this.buildReference(merged.departmentId),
      role: this.buildReference(merged.roleId),
      job: this.buildReference(merged.jobId),
      manager: this.buildReference(merged.managerId),
      salary: this.buildReference(merged.salaryId),
      contractType: this.buildReference(merged.contractTypeId),
      maritalStatus: this.normalizeText(merged.maritalStatus),
      numberOfChildren: this.normalizeNonNegativeNumber(merged.numberOfChildren),
      emergencyContactNumber: this.normalizeText(merged.emergencyContactNumber),
      contactNumber: this.normalizeText(merged.contactNumber),
      contactNote: this.normalizeText(merged.contactNote),
      identityProof: this.normalizeText(merged.identityProof),
      resume: this.normalizeText(merged.resume),
      offerLetter: this.normalizeText(merged.offerLetter),
      joiningLetter: this.normalizeText(merged.joiningLetter),
      contractAgreement: this.normalizeText(merged.contractAgreement),
      note: this.normalizeText(merged.note),
    };
  }

  private toTrackedDocument(
    key: EmployeeDocumentField,
    label: string,
    documentType: string,
    reference: string
  ): EmployeeTrackedDocument {
    const normalizedReference = this.normalizeText(reference);
    const linkedDocument = normalizedReference
      ? this.featuredDocumentRecords.find(
          (document) => document.filePath === normalizedReference
        ) || null
      : null;

    return {
      key,
      label,
      documentType,
      documentName:
        (linkedDocument && linkedDocument.documentName) ||
        this.extractFileName(normalizedReference) ||
        label + ' missing',
      filePath: normalizedReference,
      uploadedAtLabel: linkedDocument
        ? linkedDocument.uploadedAtLabel
        : normalizedReference
        ? 'Stored on employee profile'
        : 'Missing',
      source: linkedDocument ? 'record' : 'core',
      documentId: linkedDocument ? linkedDocument.id : null,
      isMissing: !normalizedReference,
    };
  }

  lookupOptionName(options: EmployeeReference[], value: unknown): string {
    const id = this.normalizeNumericId(value);

    if (!id) {
      return '';
    }

    const match = options.find((option) => option.id === id);
    return match ? match.name : '';
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('employeeCrudModalClose');

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

  private normalizeDateString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeDisplayValue(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private buildTrackedDocumentReference(
    employeeId: number,
    field: EmployeeDocumentField,
    fileName: string
  ): string {
    return (
      '/files/employees/' +
      employeeId +
      '/' +
      field +
      '-' +
      Date.now() +
      '-' +
      this.sanitizeFileName(fileName)
    );
  }

  private extractFileName(value: string): string {
    const normalizedValue = this.normalizeText(value);

    if (!normalizedValue) {
      return '';
    }

    const tokens = normalizedValue.split('/');
    return tokens[tokens.length - 1] || normalizedValue;
  }

  private sanitizeFileName(value: string): string {
    const normalizedValue = this.normalizeText(value).toLowerCase();

    if (!normalizedValue) {
      return 'document';
    }

    return normalizedValue
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
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

  private resolveEmployeePhoto(photo: string): string {
    const normalizedPhoto = this.normalizeText(photo);

    if (!normalizedPhoto) {
      return '';
    }

    if (
      normalizedPhoto.indexOf('http://') === 0 ||
      normalizedPhoto.indexOf('https://') === 0 ||
      normalizedPhoto.indexOf('data:') === 0 ||
      normalizedPhoto.indexOf('assets/') === 0 ||
      normalizedPhoto.indexOf('/assets/') === 0
    ) {
      return normalizedPhoto;
    }

    if (
      normalizedPhoto.indexOf('/files/') === 0 ||
      normalizedPhoto.indexOf('files/') === 0
    ) {
      return (
        CONFIG.URL_BASE +
        (normalizedPhoto.indexOf('/') === 0 ? normalizedPhoto : '/' + normalizedPhoto)
      );
    }

    return normalizedPhoto;
  }

  private normalizeNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
  }

  private normalizeNonNegativeNumber(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
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

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the employee request right now.';
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
