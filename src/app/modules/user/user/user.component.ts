import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'RECRUITER' | 'EMPLOYEE';
type UserMode = 'create' | 'edit';
type UserStatusFilter = 'all' | 'active' | 'inactive';

interface CompanyRecord {
  id: number;
  code: string;
  name: string;
  active: boolean;
  defaultCompany: boolean;
}

interface RoleProfile {
  value: UserRole;
  label: string;
  summary: string;
  accentClass: string;
  permissions: string[];
}

interface UserAccount {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
  roleLabel: string;
  active: boolean;
  statusLabel: string;
  companyId: number | null;
  companyName: string;
  summary: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  submitted = false;
  deletingId: number = null;
  loadError = '';
  passwordResetResult = '';

  modalMode: UserMode = 'create';
  activeUserId: number = null;

  searchTerm = '';
  activeRoleFilter: 'all' | UserRole = 'all';
  activeStatusFilter: UserStatusFilter = 'all';

  users: UserAccount[] = [];
  filteredUsers: UserAccount[] = [];
  featuredUser: UserAccount = null;
  companies: CompanyRecord[] = [];

  readonly roleProfiles: RoleProfile[] = [
    {
      value: 'ADMIN',
      label: 'Admin',
      summary: 'Own the full workspace, security settings, and account administration.',
      accentClass: 'tone-admin',
      permissions: [
        'Create and remove login accounts',
        'Change role assignments and activation status',
        'Access every operational workspace and settings page',
      ],
    },
    {
      value: 'HR',
      label: 'HR',
      summary: 'Run people operations, payroll, records, documents, and workforce workflows.',
      accentClass: 'tone-hr',
      permissions: [
        'Manage employee, payroll, document, and leave workspaces',
        'Review communications, performance, and people data',
        'No access to user administration or system settings',
      ],
    },
    {
      value: 'MANAGER',
      label: 'Manager',
      summary: 'Monitor team activity, reviews, leave, announcements, and manager-facing operations.',
      accentClass: 'tone-manager',
      permissions: [
        'Access dashboards, employee overviews, leave, performance, and announcements',
        'Review manager-facing communication streams',
        'No access to payroll, document administration, or account creation',
      ],
    },
    {
      value: 'RECRUITER',
      label: 'Recruiter',
      summary: 'Coordinate hiring activity, candidate operations, and talent-facing workflows without opening sensitive HR data.',
      accentClass: 'tone-recruiter',
      permissions: [
        'Access job, onboarding, communication, training, and event workspaces',
        'Blocked from payroll, document administration, and account creation',
        'Intended for recruiting and hiring coordination roles',
      ],
    },
    {
      value: 'EMPLOYEE',
      label: 'Employee',
      summary: 'Use a tightly scoped login limited to personal workspace access.',
      accentClass: 'tone-employee',
      permissions: [
        'Access profile workspace only',
        'Blocked from admin operations and people-management modules',
        'Suitable for personal login accounts rather than admin work',
      ],
    },
  ];

  readonly userForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(120)]],
      displayName: ['', [Validators.required, Validators.maxLength(160)]],
      role: ['EMPLOYEE', [Validators.required]],
      companyId: [null, [Validators.required]],
      password: ['', [Validators.minLength(3)]],
      active: ['true', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.openCreateEditor();
    this.loadWorkspace();
    super.loadScripts();
  }

  get totalUsersCount(): number {
    return this.users.length;
  }

  get activeUsersCount(): number {
    return this.users.filter((item) => item.active).length;
  }

  get adminUsersCount(): number {
    return this.users.filter((item) => item.role === 'ADMIN').length;
  }

  get managerUsersCount(): number {
    return this.users.filter((item) => item.role === 'MANAGER').length;
  }

  get recruiterUsersCount(): number {
    return this.users.filter((item) => item.role === 'RECRUITER').length;
  }

  get editorTitle(): string {
    return this.modalMode === 'create' ? 'Create login account' : 'Edit login account';
  }

  get editorSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Create a new authenticated workspace account and assign the correct access role.'
      : 'Update the account profile, role assignment, activation status, or password.';
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.filteredUsers.length;
    const totalCount = this.users.length;

    return filteredCount === totalCount
      ? filteredCount + ' user accounts'
      : filteredCount + ' of ' + totalCount + ' user accounts';
  }

  get selectedRoleProfile(): RoleProfile {
    const selectedRole = this.normalizeRole(this.userForm.value.role);

    return this.getRoleProfile(selectedRole);
  }

  get selectedStatusLabel(): string {
    return this.userForm.value.active === 'false' ? 'Inactive account' : 'Active account';
  }

  trackByUserId(index: number, item: UserAccount): number {
    return item.id || index;
  }

  resolveRoleAccent(role: UserRole): string {
    return this.getRoleProfile(role).accentClass;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onRoleFilterChange(value: 'all' | UserRole): void {
    this.activeRoleFilter = value || 'all';
    this.applyFilters();
  }

  onStatusFilterChange(value: UserStatusFilter): void {
    this.activeStatusFilter = value || 'all';
    this.applyFilters();
  }

  openCreateEditor(): void {
    this.modalMode = 'create';
    this.activeUserId = null;
    this.submitted = false;
    this.userForm.reset({
      username: '',
      displayName: '',
      role: 'EMPLOYEE',
      companyId: this.resolveDefaultCompanyId(),
      password: '',
      active: 'true',
    });
    this.userForm.get('password').setValidators([Validators.required, Validators.minLength(3)]);
    this.userForm.get('password').updateValueAndValidity();
  }

  openEditEditor(item: UserAccount): void {
    this.modalMode = 'edit';
    this.activeUserId = item.id;
    this.submitted = false;
    this.featuredUser = item;
    this.userForm.reset({
      username: item.username,
      displayName: item.displayName,
      role: item.role,
      companyId: item.companyId,
      password: '',
      active: item.active ? 'true' : 'false',
    });
    this.userForm.get('password').clearValidators();
    this.userForm.get('password').setValidators([Validators.minLength(3)]);
    this.userForm.get('password').updateValueAndValidity();
  }

  selectUser(item: UserAccount): void {
    this.featuredUser = item;
  }

  async saveUser(): Promise<void> {
    this.submitted = true;

    if (this.userForm.invalid || this.saving) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.loadError = '';

    try {
      const payload = this.buildPayload();
      let savedUser: any;

      if (this.modalMode === 'create') {
        savedUser = await this.httpService.postWithResponse<any>(
          CONFIG.URL_BASE + '/user/create',
          payload
        );
        super.show('Confirmation', 'User account created successfully.', 'success');
      } else {
        savedUser = await this.httpService.putWithResponse<any>(
          CONFIG.URL_BASE + '/user/update/' + this.activeUserId,
          payload
        );
        super.show('Confirmation', 'User account updated successfully.', 'success');
      }

      const normalizedUser = this.normalizeUser(savedUser);
      this.users = [normalizedUser].concat(
        this.users.filter((item) => item.id !== normalizedUser.id)
      ).sort((left, right) => left.username.localeCompare(right.username));
      this.applyFilters();
      this.featuredUser = normalizedUser;
      this.openEditEditor(normalizedUser);
    } catch (error) {
      this.loadError = this.extractErrorMessage(
        error,
        'Unable to save the user account.'
      );
    } finally {
      this.saving = false;
    }
  }

  async deleteUser(item: UserAccount): Promise<void> {
    if (!item || this.deletingId === item.id) {
      return;
    }

    if (!window.confirm('Delete the account for ' + item.displayName + '?')) {
      return;
    }

    this.deletingId = item.id;
    this.loadError = '';

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/user/delete/' + item.id);
      this.users = this.users.filter((user) => user.id !== item.id);
      this.applyFilters();

      if (this.featuredUser && this.featuredUser.id === item.id) {
        this.featuredUser = this.filteredUsers.length ? this.filteredUsers[0] : null;
      }

      if (this.activeUserId === item.id) {
        this.openCreateEditor();
      }

      super.show('Confirmation', 'User account removed successfully.', 'success');
    } catch (error) {
      this.loadError = this.extractErrorMessage(
        error,
        'Unable to delete the user account.'
      );
    } finally {
      this.deletingId = null;
    }
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  async resetPassword(item?: UserAccount): Promise<void> {
    const target = item || this.featuredUser;

    if (!target || !target.id) {
      return;
    }

    const suggestedPassword = 'Temp' + String(Date.now()).slice(-8);
    const requestedPassword = window.prompt('Enter a new password for ' + target.displayName, suggestedPassword);

    if (requestedPassword === null) {
      return;
    }

    try {
      const response = await this.httpService.postWithResponse<{ temporaryPassword: string }>(
        CONFIG.URL_BASE + '/user/reset-password/' + target.id,
        { password: requestedPassword }
      );
      this.passwordResetResult = 'Temporary password for ' + target.displayName + ': ' + (response && response.temporaryPassword ? response.temporaryPassword : requestedPassword);
      super.show('Confirmation', 'Password reset successfully.', 'success');
    } catch (error) {
      this.loadError = this.extractErrorMessage(error, 'Unable to reset the password.');
    }
  }

  private loadWorkspace(isRefresh = false): void {
    this.loading = true;

    if (!isRefresh) {
      this.loadError = '';
    }
    forkJoin({
      users: this.httpService.getAll(CONFIG.URL_BASE + '/user/all').pipe(catchError((error) => { throw error; })),
      companies: this.httpService.getAll(CONFIG.URL_BASE + '/api/companies').pipe(catchError(() => of([]))),
    }).subscribe(
      (result: { users: any[]; companies: any[] }) => {
        this.companies = (result.companies || []).map((record) => this.normalizeCompany(record));
        this.users = (result.users || [])
          .map((record) => this.normalizeUser(record))
          .filter((record) => record.id !== null)
          .sort((left, right) => left.username.localeCompare(right.username));
        this.applyFilters();
        if (this.modalMode === 'create') {
          this.userForm.patchValue({ companyId: this.resolveDefaultCompanyId() });
        }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        this.loadError = this.extractErrorMessage(
          error,
          'Unable to load user accounts.'
        );
        this.loading = false;
      }
    );
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((item) => {
      const matchesRole =
        this.activeRoleFilter === 'all' || item.role === this.activeRoleFilter;
      const matchesStatus =
        this.activeStatusFilter === 'all' ||
        (this.activeStatusFilter === 'active' ? item.active : !item.active);
      const matchesTerm =
        !term ||
        item.username.toLowerCase().includes(term) ||
        item.displayName.toLowerCase().includes(term) ||
        item.roleLabel.toLowerCase().includes(term) ||
        item.companyName.toLowerCase().includes(term);

      return matchesRole && matchesStatus && matchesTerm;
    });

    if (!this.filteredUsers.length) {
      this.featuredUser = null;
      return;
    }

    if (
      this.featuredUser &&
      this.filteredUsers.some((item) => item.id === this.featuredUser.id)
    ) {
      this.featuredUser = this.filteredUsers.find(
        (item) => item.id === this.featuredUser.id
      );
      return;
    }

    this.featuredUser = this.filteredUsers[0];
  }

  private buildPayload(): Record<string, unknown> {
    return {
      username: this.normalizeText(this.userForm.value.username),
      displayName: this.normalizeText(this.userForm.value.displayName),
      role: this.normalizeRole(this.userForm.value.role),
      company: {
        id: this.toNumber(this.userForm.value.companyId),
      },
      password: this.normalizeText(this.userForm.value.password),
      active: this.userForm.value.active !== 'false',
    };
  }

  private normalizeUser(record: any): UserAccount {
    const role = this.normalizeRole(record && record.role);
    const roleProfile = this.getRoleProfile(role);
    const displayName =
      this.normalizeText(record && record.displayName) ||
      this.toDisplayName(this.normalizeText(record && record.username));
    const active = record && record.active !== false;

    return {
      id: this.toNumber(record && record.id),
      username: this.normalizeText(record && record.username),
      displayName,
      role,
      roleLabel: roleProfile.label,
      active,
      statusLabel: active ? 'Active' : 'Inactive',
      companyId: this.toNumber(record && record.company && record.company.id),
      companyName: this.normalizeText(record && record.company && record.company.name) || 'Default company',
      summary: (roleProfile.summary || 'Restricted workspace access.') + ' • ' + (this.normalizeText(record && record.company && record.company.name) || 'Default company'),
    };
  }

  private normalizeCompany(record: any): CompanyRecord {
    return {
      id: this.toNumber(record && record.id),
      code: this.normalizeText(record && record.code),
      name: this.normalizeText(record && record.name),
      active: record && record.active !== false,
      defaultCompany: !!(record && record.defaultCompany),
    };
  }

  private getRoleProfile(role: UserRole): RoleProfile {
    return (
      this.roleProfiles.find((profile) => profile.value === role) ||
      this.roleProfiles[this.roleProfiles.length - 1]
    );
  }

  private normalizeRole(value: unknown): UserRole {
    switch ((value || '').toString().trim().toUpperCase()) {
      case 'ADMIN':
      case 'HR':
      case 'MANAGER':
      case 'RECRUITER':
      case 'EMPLOYEE':
        return (value as string).trim().toUpperCase() as UserRole;
      default:
        return 'EMPLOYEE';
    }
  }

  private resolveDefaultCompanyId(): number | null {
    const defaultCompany = this.companies.find((item) => item.defaultCompany) || this.companies[0];
    return defaultCompany ? defaultCompany.id : null;
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

  private toDisplayName(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase()) || 'Operator';
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toNumber(value: unknown): number | null {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

}
