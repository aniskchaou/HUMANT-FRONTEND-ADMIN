import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

type Tone = 'strong' | 'medium' | 'warning' | 'critical';
type DocumentEditorMode = 'create' | 'edit' | 'version';

interface EmployeeOption {
  id: number;
  name: string;
}

interface DocumentView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  documentName: string;
  documentType: string;
  documentCategory: string;
  categoryLabel: string;
  originalFileName: string;
  accessLevel: string;
  accessLabel: string;
  notes: string;
  uploadedBy: string;
  uploadedAt: string;
  uploadedAtLabel: string;
  versionGroup: string;
  versionNumber: number;
  activeVersion: boolean;
  fileSize: number;
  fileSizeLabel: string;
  summary: string;
  tone: Tone;
}

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
})
export class DocumentComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';

  selectedCategory = 'all';
  selectedAccess = 'all';
  selectedEmployee = 'all';
  searchTerm = '';

  editorMode: DocumentEditorMode = 'create';
  activeDocumentId: number = null;
  selectedFile: File = null;
  selectedFileName = '';

  employees: EmployeeOption[] = [];
  documents: DocumentView[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly categoryOptions = ['OFFER_LETTER', 'CONTRACT', 'ID', 'CERTIFICATE', 'OTHER'];
  readonly accessOptions = ['ADMIN_ONLY', 'EMPLOYEE_AND_ADMIN'];
  readonly documentForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.documentForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      documentName: ['', [Validators.required, Validators.maxLength(120)]],
      documentCategory: ['CONTRACT', [Validators.required]],
      accessLevel: ['ADMIN_ONLY', [Validators.required]],
      notes: ['', [Validators.maxLength(1500)]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get totalDocumentsCount(): number {
    return this.filteredDocuments.length;
  }

  get latestDocumentsCount(): number {
    return this.latestDocuments.length;
  }

  get protectedDocumentsCount(): number {
    return this.filteredDocuments.filter((item) => item.accessLevel === 'ADMIN_ONLY').length;
  }

  get archivedDocumentsCount(): number {
    return this.filteredDocuments.filter((item) => !item.activeVersion).length;
  }

  get versionedCollectionsCount(): number {
    const counts = new Map<string, number>();

    this.filteredDocuments.forEach((item) => {
      counts.set(item.versionGroup, (counts.get(item.versionGroup) || 0) + 1);
    });

    let versionedGroups = 0;
    counts.forEach((count) => {
      if (count > 1) {
        versionedGroups += 1;
      }
    });

    return versionedGroups;
  }

  get latestDocuments(): DocumentView[] {
    return this.filteredDocuments.filter((item) => item.activeVersion);
  }

  get filteredDocuments(): DocumentView[] {
    const normalizedSearch = this.normalizeText(this.searchTerm).toLowerCase();

    return this.documents.filter((item) => {
      const matchesCategory = this.selectedCategory === 'all' || item.documentCategory === this.selectedCategory;
      const matchesAccess = this.selectedAccess === 'all' || item.accessLevel === this.selectedAccess;
      const matchesEmployee =
        this.selectedEmployee === 'all' || String(item.employeeId) === this.selectedEmployee;
      const matchesSearch =
        !normalizedSearch ||
        item.documentName.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.employeeName.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.originalFileName.toLowerCase().indexOf(normalizedSearch) !== -1 ||
        item.notes.toLowerCase().indexOf(normalizedSearch) !== -1;

      return matchesCategory && matchesAccess && matchesEmployee && matchesSearch;
    });
  }

  get editorTitle(): string {
    if (this.editorMode === 'edit') {
      return 'Edit document metadata';
    }

    if (this.editorMode === 'version') {
      return 'Upload next version';
    }

    return 'Upload employee document';
  }

  get editorCopy(): string {
    if (this.editorMode === 'edit') {
      return 'Adjust category, secure access, or notes without replacing the stored file.';
    }

    if (this.editorMode === 'version') {
      return 'Store a new file version while keeping earlier versions visible in the history.';
    }

    return 'Upload and store employee contracts, IDs, certificates, and other sensitive HR files.';
  }

  get saveLabel(): string {
    if (this.saving) {
      return 'Saving...';
    }

    if (this.editorMode === 'edit') {
      return 'Update metadata';
    }

    if (this.editorMode === 'version') {
      return 'Upload version';
    }

    return 'Upload document';
  }

  get fileHint(): string {
    if (this.editorMode === 'edit') {
      return 'Editing metadata does not replace the stored file.';
    }

    return this.selectedFileName || 'Choose the file to store securely.';
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value || 'all';
  }

  onAccessChange(value: string): void {
    this.selectedAccess = value || 'all';
  }

  onEmployeeChange(value: string): void {
    this.selectedEmployee = value || 'all';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input && input.files ? input.files : null;
    this.selectedFile = files && files.length ? files[0] : null;
    this.selectedFileName = this.selectedFile ? this.selectedFile.name : '';
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  startCreate(): void {
    this.editorMode = 'create';
    this.activeDocumentId = null;
    this.submitted = false;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.documentForm.reset({
      employeeId: '',
      documentName: '',
      documentCategory: 'CONTRACT',
      accessLevel: 'ADMIN_ONLY',
      notes: '',
    });
  }

  startEdit(item: DocumentView): void {
    this.editorMode = 'edit';
    this.activeDocumentId = item.id;
    this.submitted = false;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.documentForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      documentName: item.documentName,
      documentCategory: item.documentCategory,
      accessLevel: item.accessLevel,
      notes: item.notes,
    });
  }

  startVersionUpload(item: DocumentView): void {
    this.editorMode = 'version';
    this.activeDocumentId = item.id;
    this.submitted = false;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.documentForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      documentName: item.documentName,
      documentCategory: item.documentCategory,
      accessLevel: item.accessLevel,
      notes: item.notes,
    });
  }

  trackByDocumentId(index: number, item: DocumentView): number {
    return item.id || index;
  }

  trackByEmployeeId(index: number, item: EmployeeOption): number {
    return item.id || index;
  }

  async saveDocument(): Promise<void> {
    this.submitted = true;

    if (this.documentForm.invalid || (this.requiresFile() && !this.selectedFile)) {
      this.documentForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.editorMode === 'edit' && this.activeDocumentId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/documents/' + this.activeDocumentId,
          this.buildMetadataPayload()
        );
        super.show('Confirmation', 'Document metadata updated successfully.', 'success');
      } else if (this.editorMode === 'version' && this.activeDocumentId !== null) {
        await this.httpService.postFormDataWithResponse(
          CONFIG.URL_BASE + '/api/documents/' + this.activeDocumentId + '/versions',
          this.buildUploadFormData(false)
        );
        super.show('Confirmation', 'New document version uploaded successfully.', 'success');
      } else {
        await this.httpService.postFormDataWithResponse(
          CONFIG.URL_BASE + '/api/documents/upload',
          this.buildUploadFormData(true)
        );
        super.show('Confirmation', 'Document uploaded successfully.', 'success');
      }

      this.startCreate();
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async deleteDocument(item: DocumentView): Promise<void> {
    const confirmed = confirm(
      'Delete ' + item.documentName + ' version ' + item.versionNumber + ' for ' + item.employeeName + '?'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/documents/' + item.id);
      super.show('Confirmation', 'Document deleted successfully.', 'success');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  async downloadDocument(item: DocumentView): Promise<void> {
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

  requiresFile(): boolean {
    return this.editorMode !== 'edit';
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
      documents: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/documents')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result: any) => {
          this.employees = this.normalizeEmployees(result && result.employees);
          this.documents = this.normalizeDocuments(result && result.documents);

          if (showRefreshNotice) {
            super.show('Workspace refreshed', 'Document library refreshed successfully.', 'success');
          }
        },
        error: (error: unknown) => {
          this.loadError = this.getErrorMessage(error);
        },
      });
  }

  private buildMetadataPayload(): any {
    const employeeId = this.toNumericId(this.documentForm.value.employeeId);

    return {
      documentName: this.normalizeText(this.documentForm.value.documentName),
      documentCategory: this.normalizeText(this.documentForm.value.documentCategory),
      accessLevel: this.normalizeText(this.documentForm.value.accessLevel),
      notes: this.normalizeText(this.documentForm.value.notes),
      employee: employeeId !== null ? { id: employeeId } : null,
    };
  }

  private buildUploadFormData(includeEmployee = true): FormData {
    const formData = new FormData();
    const employeeId = this.toNumericId(this.documentForm.value.employeeId);

    if (includeEmployee && employeeId !== null) {
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

        return {
          id,
          name: fullName || (id !== null ? 'Employee #' + id : 'Employee pending'),
        };
      })
      .filter((item) => item.id !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private normalizeDocuments(data: unknown): DocumentView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const employeeId = this.toNumericId(record && record.employee && record.employee.id);
        const employeeName =
          this.normalizeText(record && record.employee && record.employee.fullName) ||
          this.lookupEmployeeName(employeeId) ||
          'Employee pending';
        const documentName = this.normalizeText(record && record.documentName) || 'Employee document';
        const documentCategory = this.normalizeCategory(record && record.documentCategory);
        const accessLevel = this.normalizeAccessLevel(record && record.accessLevel);
        const uploadedAt = this.normalizeText(record && record.uploadedAt);
        const versionGroup = this.normalizeText(record && record.versionGroup) || 'ungrouped';
        const versionNumber = Math.max(1, Math.round(this.toAmount(record && record.versionNumber)));
        const activeVersion = record && record.activeVersion !== false;
        const fileSize = Math.max(0, Math.round(this.toAmount(record && record.fileSize)));
        const tone = this.resolveTone(accessLevel, activeVersion, versionNumber);

        return {
          id,
          employeeId,
          employeeName,
          documentName,
          documentType: this.normalizeText(record && record.documentType) || 'FILE',
          documentCategory,
          categoryLabel: this.toDisplayLabel(documentCategory),
          originalFileName:
            this.normalizeText(record && record.originalFileName) ||
            this.normalizeText(record && record.storedFileName) ||
            documentName,
          accessLevel,
          accessLabel:
            accessLevel === 'EMPLOYEE_AND_ADMIN' ? 'Employee + Admin' : 'Admin only',
          notes: this.normalizeText(record && record.notes),
          uploadedBy: this.normalizeText(record && record.uploadedBy) || 'System',
          uploadedAt,
          uploadedAtLabel: uploadedAt ? this.formatDateTime(uploadedAt) : 'Pending timestamp',
          versionGroup,
          versionNumber,
          activeVersion,
          fileSize,
          fileSizeLabel: this.formatFileSize(fileSize),
          summary:
            documentName +
            ' for ' +
            employeeName +
            ' is stored as version ' +
            versionNumber +
            ' with ' +
            (activeVersion ? 'latest access' : 'archived history') +
            '.',
          tone,
        };
      })
      .sort(
        (left, right) =>
          right.uploadedAt.localeCompare(left.uploadedAt) ||
          right.versionNumber - left.versionNumber ||
          left.employeeName.localeCompare(right.employeeName)
      );
  }

  private normalizeCategory(value: unknown): string {
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

    return 'OTHER';
  }

  private normalizeAccessLevel(value: unknown): string {
    const normalizedValue = this.normalizeText(value).toUpperCase();
    return normalizedValue.indexOf('EMPLOYEE') !== -1 ? 'EMPLOYEE_AND_ADMIN' : 'ADMIN_ONLY';
  }

  private resolveTone(accessLevel: string, activeVersion: boolean, versionNumber: number): Tone {
    if (accessLevel === 'ADMIN_ONLY' && activeVersion) {
      return 'critical';
    }

    if (!activeVersion && versionNumber > 1) {
      return 'warning';
    }

    if (activeVersion && versionNumber > 1) {
      return 'strong';
    }

    return 'medium';
  }

  private lookupEmployeeName(employeeId: number | null): string {
    const employee = this.employees.find((item) => item.id === employeeId);
    return employee ? employee.name : '';
  }

  private formatDateTime(value: string): string {
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

  private formatFileSize(value: number): string {
    if (value <= 0) {
      return 'Unknown size';
    }

    if (value < 1024) {
      return value + ' B';
    }

    if (value < 1024 * 1024) {
      return (value / 1024).toFixed(1) + ' KB';
    }

    return (value / (1024 * 1024)).toFixed(1) + ' MB';
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
    }

    return 'Unable to complete the document request.';
  }
}