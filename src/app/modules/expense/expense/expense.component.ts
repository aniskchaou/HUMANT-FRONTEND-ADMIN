import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface ExpenseEmployeeOption {
  id: number;
  fullName: string;
}

interface ExpenseClaimView {
  id: number;
  claimNumber: string;
  claimType: string;
  description: string;
  amount: number;
  claimDate: string;
  claimDateLabel: string;
  status: string;
  statusTone: string;
  notes: string;
  submittedBy: string;
  submittedByLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
  reviewedBy: string;
  reviewedAtLabel: string;
  reviewNotes: string;
  employeeId: number;
  employeeName: string;
  hasReceipt: boolean;
  receiptOriginalFileName: string;
  reimbursementId: number;
  reimbursementStatus: string;
  reimbursementStatusLabel: string;
  reimbursementTone: string;
  reimbursementAmount: number;
  reimbursementDate: string;
  reimbursementDateLabel: string;
  reimbursementDescription: string;
  reimbursementNotes: string;
  paymentReference: string;
  processedBy: string;
  processedAtLabel: string;
}

type ClaimStatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'reimbursed';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
})
export class ExpenseComponent extends URLLoader implements OnInit {
  loading = false;
  submittingClaim = false;
  reviewingClaim = false;
  updatingReimbursement = false;

  submittedClaim = false;
  submittedReimbursement = false;

  loadError = '';
  searchTerm = '';
  activeStatusFilter: ClaimStatusFilter = 'all';

  pendingReceiptFile: File = null;
  pendingReceiptName = '';

  selectedClaim: ExpenseClaimView = null;
  private selectedClaimId: number = null;
  reviewNotesDraft = '';

  claims: ExpenseClaimView[] = [];
  filteredClaims: ExpenseClaimView[] = [];
  employees: ExpenseEmployeeOption[] = [];

  readonly loadingCards = [1, 2, 3, 4];
  readonly claimTypeOptions = [
    'Travel',
    'Meals',
    'Accommodation',
    'Transport',
    'Supplies',
    'Training',
    'Client Meeting',
    'Other',
  ];
  readonly reimbursementStatusOptions = [
    'PENDING',
    'PROCESSING',
    'REIMBURSED',
    'CANCELLED',
  ];
  readonly claimStatusOptions = [
    { label: 'All claims', value: 'all' },
    { label: 'Pending review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Reimbursed', value: 'reimbursed' },
  ];

  readonly claimForm: FormGroup;
  readonly reimbursementForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    public authentificationService: AuthentificationService
  ) {
    super();

    this.claimForm = this.formBuilder.group({
      claimType: ['Travel', [Validators.required, Validators.maxLength(80)]],
      employeeId: [''],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      amount: ['', [Validators.required]],
      claimDate: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(500)]],
    });

    this.reimbursementForm = this.formBuilder.group({
      description: ['', [Validators.maxLength(200)]],
      status: ['PENDING', [Validators.required]],
      amount: ['', [Validators.required]],
      reimbursementDate: [''],
      paymentReference: ['', [Validators.maxLength(120)]],
      notes: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get canApproveClaims(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR', 'MANAGER']);
  }

  get canManageReimbursements(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR']);
  }

  get canAssignEmployee(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR']);
  }

  get totalClaimsCount(): number {
    return this.claims.length;
  }

  get pendingClaimsCount(): number {
    return this.claims.filter((claim) => claim.status === 'PENDING').length;
  }

  get approvedClaimsCount(): number {
    return this.claims.filter((claim) => claim.status === 'APPROVED').length;
  }

  get reimbursedClaimsCount(): number {
    return this.claims.filter((claim) => claim.reimbursementStatus === 'REIMBURSED').length;
  }

  get receiptCoverageLabel(): string {
    if (!this.claims.length) {
      return '0%';
    }

    const claimsWithReceipts = this.claims.filter((claim) => claim.hasReceipt).length;
    return Math.round((claimsWithReceipts / this.claims.length) * 100) + '%';
  }

  get filteredResultsLabel(): string {
    if (this.filteredClaims.length === this.claims.length) {
      return this.filteredClaims.length + ' claims';
    }

    return this.filteredClaims.length + ' of ' + this.claims.length + ' claims';
  }

  get selectedClaimTitle(): string {
    if (!this.selectedClaim) {
      return 'Expense claim detail';
    }

    return this.selectedClaim.claimNumber + ' · ' + this.selectedClaim.claimType;
  }

  get selectedClaimSubtitle(): string {
    if (!this.selectedClaim) {
      return 'Select a claim to inspect receipt status, approval history, and reimbursement progress.';
    }

    return this.selectedClaim.employeeName + ' · submitted by ' + this.selectedClaim.submittedByLabel;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onStatusFilterChange(value: ClaimStatusFilter): void {
    this.activeStatusFilter = value || 'all';
    this.applyFilters();
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input && input.files && input.files.length ? input.files[0] : null;

    this.pendingReceiptFile = file;
    this.pendingReceiptName = file ? file.name : '';
  }

  refreshWorkspace(): void {
    this.loadWorkspace(this.selectedClaimId);
  }

  selectClaim(claim: ExpenseClaimView): void {
    this.selectedClaim = claim;
    this.selectedClaimId = claim ? claim.id : null;
    this.reviewNotesDraft = claim && claim.reviewNotes ? claim.reviewNotes : '';
    this.submittedReimbursement = false;

    if (!claim) {
      this.reimbursementForm.reset({
        description: '',
        status: 'PENDING',
        amount: '',
        reimbursementDate: '',
        paymentReference: '',
        notes: '',
      });
      return;
    }

    this.reimbursementForm.reset({
      description: claim.reimbursementDescription,
      status: claim.reimbursementStatus === 'NONE' ? 'PENDING' : claim.reimbursementStatus,
      amount: claim.reimbursementAmount ? String(claim.reimbursementAmount) : String(claim.amount),
      reimbursementDate: claim.reimbursementDate,
      paymentReference: claim.paymentReference,
      notes: claim.reimbursementNotes,
    });
  }

  trackByClaimId(index: number, claim: ExpenseClaimView): number {
    return claim.id || index;
  }

  async submitClaim(): Promise<void> {
    this.submittedClaim = true;

    if (this.canAssignEmployee && !this.normalizeText(this.claimForm.value.employeeId)) {
      this.claimForm.get('employeeId').setErrors({ required: true });
    }

    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('claimType', this.claimForm.value.claimType);
    formData.append('description', this.claimForm.value.description);
    formData.append('amount', this.claimForm.value.amount);
    formData.append('claimDate', this.claimForm.value.claimDate);

    if (this.normalizeText(this.claimForm.value.notes)) {
      formData.append('notes', this.claimForm.value.notes);
    }

    if (this.canAssignEmployee && this.normalizeText(this.claimForm.value.employeeId)) {
      formData.append('employeeId', this.claimForm.value.employeeId);
    }

    if (this.pendingReceiptFile) {
      formData.append('receipt', this.pendingReceiptFile);
    }

    this.submittingClaim = true;

    try {
      await this.httpService.postFormDataWithResponse(
        CONFIG.URL_BASE + '/api/expense-claims/submit',
        formData
      );
      super.show('Confirmation', 'Expense claim submitted successfully.', 'success');
      this.resetClaimForm();
      await this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.extractErrorMessage(error), 'warning');
    } finally {
      this.submittingClaim = false;
    }
  }

  async reviewSelectedClaim(status: string): Promise<void> {
    if (!this.selectedClaim) {
      return;
    }

    this.reviewingClaim = true;

    try {
      await this.httpService.putWithResponse(
        CONFIG.URL_BASE + '/api/expense-claims/' + this.selectedClaim.id + '/review',
        {
          status: status,
          reviewNotes: this.reviewNotesDraft,
        }
      );
      super.show('Confirmation', 'Expense claim review saved.', 'success');
      await this.loadWorkspace(this.selectedClaim.id);
    } catch (error) {
      super.show('Error', this.extractErrorMessage(error), 'warning');
    } finally {
      this.reviewingClaim = false;
    }
  }

  async saveReimbursement(): Promise<void> {
    this.submittedReimbursement = true;

    if (
      !this.selectedClaim ||
      !this.selectedClaim.reimbursementId ||
      this.reimbursementForm.invalid
    ) {
      this.reimbursementForm.markAllAsTouched();
      return;
    }

    this.updatingReimbursement = true;

    try {
      await this.httpService.putWithResponse(
        CONFIG.URL_BASE + '/api/reimbursements/' + this.selectedClaim.reimbursementId,
        {
          description: this.reimbursementForm.value.description,
          status: this.reimbursementForm.value.status,
          amount: this.reimbursementForm.value.amount,
          reimbursementDate: this.reimbursementForm.value.reimbursementDate,
          paymentReference: this.reimbursementForm.value.paymentReference,
          notes: this.reimbursementForm.value.notes,
        }
      );
      super.show('Confirmation', 'Reimbursement progress updated.', 'success');
      await this.loadWorkspace(this.selectedClaim.id);
    } catch (error) {
      super.show('Error', this.extractErrorMessage(error), 'warning');
    } finally {
      this.updatingReimbursement = false;
    }
  }

  async downloadReceipt(claim: ExpenseClaimView): Promise<void> {
    if (!claim || !claim.hasReceipt) {
      return;
    }

    try {
      const blob = await this.httpService.getBlob(
        CONFIG.URL_BASE + '/api/expense-claims/' + claim.id + '/receipt'
      );
      this.saveBlob(blob, claim.receiptOriginalFileName || claim.claimNumber + '-receipt');
    } catch (error) {
      super.show('Error', this.extractErrorMessage(error), 'warning');
    }
  }

  statusBadgeClass(claim: ExpenseClaimView): string {
    return 'status-badge ' + claim.statusTone;
  }

  reimbursementBadgeClass(claim: ExpenseClaimView): string {
    return 'status-badge reimbursement ' + claim.reimbursementTone;
  }

  private async loadWorkspace(preferredClaimId?: number): Promise<void> {
    this.loading = true;
    this.loadError = '';

    try {
      const workspace: any = await forkJoin({
        employees: this.canAssignEmployee
          ? this.httpService
              .getAll(CONFIG.URL_BASE + '/employee/all')
              .pipe(catchError(() => of([])))
          : of([]),
        claims: this.httpService.getAll(CONFIG.URL_BASE + '/api/expense-claims').pipe(
          catchError((error) => {
            this.loadError = this.extractErrorMessage(error);
            return of([]);
          })
        ),
        reimbursements: this.httpService
          .getAll(CONFIG.URL_BASE + '/api/reimbursements')
          .pipe(catchError(() => of([]))),
      })
        .pipe(finalize(() => (this.loading = false)))
        .toPromise();

      this.employees = this.mapEmployees(workspace.employees);
      this.claims = this.mapClaims(workspace.claims, this.buildReimbursementMap(workspace.reimbursements));
      this.applyFilters();
      this.restoreSelection(preferredClaimId);
    } catch (error) {
      this.loading = false;
      this.loadError = this.extractErrorMessage(error);
    }
  }

  private mapEmployees(items: any[]): ExpenseEmployeeOption[] {
    const employees: ExpenseEmployeeOption[] = [];

    for (const item of items || []) {
      const id = this.toNumber(item && item.id);
      if (!id) {
        continue;
      }

      employees.push({
        id: id,
        fullName: this.normalizeText(item && item.fullName) || 'Employee #' + id,
      });
    }

    employees.sort((left, right) => left.fullName.localeCompare(right.fullName));
    return employees;
  }

  private buildReimbursementMap(items: any[]): { [claimId: number]: any } {
    const reimbursementMap: { [claimId: number]: any } = {};

    for (const item of items || []) {
      const claimId = this.toNumber(
        (item && item.expenseClaimId) ||
          (item && item.expenseClaim && item.expenseClaim.id)
      );

      if (claimId) {
        reimbursementMap[claimId] = item;
      }
    }

    return reimbursementMap;
  }

  private mapClaims(items: any[], reimbursementMap: { [claimId: number]: any }): ExpenseClaimView[] {
    const claims: ExpenseClaimView[] = [];

    for (const item of items || []) {
      claims.push(this.buildClaimView(item, reimbursementMap[this.toNumber(item && item.id)]));
    }

    claims.sort((left, right) => {
      const leftDate = left.submittedAt ? Date.parse(left.submittedAt) : 0;
      const rightDate = right.submittedAt ? Date.parse(right.submittedAt) : 0;
      return rightDate - leftDate;
    });

    return claims;
  }

  private buildClaimView(item: any, reimbursement: any): ExpenseClaimView {
    const status = this.normalizeText(item && item.status) || 'PENDING';
    const amount = this.toNumber(item && item.amount);
    const employeeId = this.toNumber(item && item.employee && item.employee.id);
    const employeeName =
      this.normalizeText(item && item.employee && item.employee.fullName) ||
      this.authentificationService.getDisplayName(item && item.submittedBy);
    const reimbursementStatus = this.normalizeText(reimbursement && reimbursement.status)
      ? reimbursement.status
      : status === 'APPROVED'
      ? 'PENDING'
      : 'NONE';

    return {
      id: this.toNumber(item && item.id),
      claimNumber: this.normalizeText(item && item.claimNumber) || 'EXP-' + this.toNumber(item && item.id),
      claimType: this.normalizeText(item && item.claimType) || 'Expense',
      description: this.normalizeText(item && item.description) || 'No description provided.',
      amount: amount,
      claimDate: this.normalizeText(item && item.claimDate) || '',
      claimDateLabel: this.formatDate(item && item.claimDate),
      status: status,
      statusTone: this.resolveClaimTone(status),
      notes: this.normalizeText(item && item.notes) || '',
      submittedBy: this.normalizeText(item && item.submittedBy) || '',
      submittedByLabel: this.authentificationService.getDisplayName(item && item.submittedBy),
      submittedAt: this.normalizeText(item && item.submittedAt) || '',
      submittedAtLabel: this.formatDateTime(item && item.submittedAt),
      reviewedBy: this.normalizeText(item && item.reviewedBy) || '',
      reviewedAtLabel: this.formatDateTime(item && item.reviewedAt),
      reviewNotes: this.normalizeText(item && item.reviewNotes) || '',
      employeeId: employeeId,
      employeeName: employeeName,
      hasReceipt: !!(item && item.hasReceipt),
      receiptOriginalFileName: this.normalizeText(item && item.receiptOriginalFileName) || '',
      reimbursementId: this.toNumber(reimbursement && reimbursement.id),
      reimbursementStatus: reimbursementStatus,
      reimbursementStatusLabel: this.resolveReimbursementLabel(reimbursementStatus),
      reimbursementTone: this.resolveReimbursementTone(reimbursementStatus),
      reimbursementAmount: this.toNumber(reimbursement && reimbursement.amount) || amount,
      reimbursementDate: this.normalizeText(reimbursement && reimbursement.reimbursementDate) || '',
      reimbursementDateLabel: this.formatDate(reimbursement && reimbursement.reimbursementDate),
      reimbursementDescription:
        this.normalizeText(reimbursement && reimbursement.description) ||
        (this.normalizeText(item && item.claimType) || 'Expense') + ' reimbursement',
      reimbursementNotes: this.normalizeText(reimbursement && reimbursement.notes) || '',
      paymentReference: this.normalizeText(reimbursement && reimbursement.paymentReference) || '',
      processedBy: this.normalizeText(reimbursement && reimbursement.processedBy) || '',
      processedAtLabel: this.formatDateTime(reimbursement && reimbursement.processedAt),
    };
  }

  private applyFilters(): void {
    const normalizedSearch = this.normalizeText(this.searchTerm);

    this.filteredClaims = this.claims.filter((claim) => {
      if (this.activeStatusFilter === 'pending' && claim.status !== 'PENDING') {
        return false;
      }

      if (this.activeStatusFilter === 'approved' && claim.status !== 'APPROVED') {
        return false;
      }

      if (this.activeStatusFilter === 'rejected' && claim.status !== 'REJECTED') {
        return false;
      }

      if (
        this.activeStatusFilter === 'reimbursed' &&
        claim.reimbursementStatus !== 'REIMBURSED'
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        claim.claimNumber,
        claim.claimType,
        claim.description,
        claim.employeeName,
        claim.submittedByLabel,
        claim.status,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch.toLowerCase());
    });
  }

  private restoreSelection(preferredClaimId?: number): void {
    const targetId = preferredClaimId || this.selectedClaimId;

    if (targetId) {
      const matchedClaim = this.claims.find((claim) => claim.id === targetId);
      if (matchedClaim) {
        this.selectClaim(matchedClaim);
        return;
      }
    }

    if (this.claims.length) {
      this.selectClaim(this.claims[0]);
      return;
    }

    this.selectClaim(null);
  }

  private resetClaimForm(): void {
    this.claimForm.reset({
      claimType: 'Travel',
      employeeId: '',
      description: '',
      amount: '',
      claimDate: '',
      notes: '',
    });
    this.pendingReceiptFile = null;
    this.pendingReceiptName = '';
    this.submittedClaim = false;
  }

  private resolveClaimTone(status: string): string {
    if (status === 'APPROVED') {
      return 'approved';
    }

    if (status === 'REJECTED') {
      return 'rejected';
    }

    return 'pending';
  }

  private resolveReimbursementTone(status: string): string {
    if (status === 'REIMBURSED') {
      return 'settled';
    }

    if (status === 'PROCESSING') {
      return 'processing';
    }

    if (status === 'CANCELLED') {
      return 'cancelled';
    }

    if (status === 'PENDING') {
      return 'queued';
    }

    return 'none';
  }

  private resolveReimbursementLabel(status: string): string {
    if (status === 'REIMBURSED') {
      return 'Reimbursed';
    }

    if (status === 'PROCESSING') {
      return 'Processing';
    }

    if (status === 'CANCELLED') {
      return 'Cancelled';
    }

    if (status === 'PENDING') {
      return 'Pending payout';
    }

    return 'Not started';
  }

  private formatDate(value: string): string {
    if (!this.normalizeText(value)) {
      return 'No date';
    }

    const timestamp = Date.parse(value);
    if (isNaN(timestamp)) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp));
  }

  private formatDateTime(value: string): string {
    if (!this.normalizeText(value)) {
      return 'Not recorded yet';
    }

    const timestamp = Date.parse(value);
    if (isNaN(timestamp)) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp));
  }

  private toNumber(value: any): number {
    const amount = Number(value);
    return isNaN(amount) ? 0 : amount;
  }

  private normalizeText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  private extractErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error && error.error.message) {
        return error.error.message;
      }

      return error.message;
    }

    if (error && error.message) {
      return error.message;
    }

    return 'The expense workspace request could not be completed.';
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(objectUrl);
  }
}