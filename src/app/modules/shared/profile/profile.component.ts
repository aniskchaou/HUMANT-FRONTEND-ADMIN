import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import {
  WorkspaceProfileService,
  WorkspaceProfileState,
} from 'src/app/main/services/workspace-profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent extends URLLoader implements OnInit {
  private readonly configurationStorageKey = 'humant.workspace.configuration';
  readonly avatarPresets = Array.from(
    { length: 8 },
    (_, index) => 'assets/images/faces/' + (index + 1) + '.jpg'
  );
  readonly maxProfileImageSize = 1.5 * 1024 * 1024;

  submitted = false;
  saving = false;
  lastSavedAt = '';
  sessionUsername = 'operator';
  workspaceName = 'Humant HR Workspace';
  private currentEmployeeProfile: any = null;

  readonly profileForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService,
    private httpService: HTTPService,
    private profileWorkspaceService: WorkspaceProfileService
  ) {
    super();
    this.profileForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      jobTitle: ['', [Validators.required, Validators.maxLength(120)]],
      department: ['', [Validators.required, Validators.maxLength(120)]],
      phone: ['', [Validators.maxLength(60)]],
      location: ['', [Validators.maxLength(120)]],
      timezone: ['', [Validators.required]],
      bio: ['', [Validators.maxLength(500)]],
      photo: [''],
    });
  }

  ngOnInit(): void {
    this.sessionUsername =
      this.authentificationService.getStoredUsername() || 'operator';
    this.workspaceName = this.readWorkspaceName();
    this.profileWorkspaceService.refreshCurrentProfile();
    this.loadProfile();
    super.loadScripts();
  }

  get completionScore(): number {
    const values = this.profileForm.value;
    const fields = [
      values.displayName,
      values.email,
      values.jobTitle,
      values.department,
      values.phone,
      values.location,
      values.timezone,
      values.bio,
      values.photo,
    ];
    const completedFields = fields.filter((value) => this.normalizeText(value).length > 0).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  get initials(): string {
    const displayName = this.normalizeText(this.profileForm.value.displayName);
    const tokens = displayName.split(/\s+/).filter((value) => value.length > 0);

    if (!tokens.length) {
      return this.sessionUsername.substring(0, 2).toUpperCase();
    }

    return tokens
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  }

  get profileStatus(): string {
    if (this.completionScore >= 90) {
      return 'Polished';
    }

    if (this.completionScore >= 70) {
      return 'Visible';
    }

    return 'Needs detail';
  }

  get maskedPassword(): string {
    return 'Basic Auth token in use';
  }

  get profilePhoto(): string {
    return this.normalizeText(this.profileForm.value.photo);
  }

  get hasProfilePhoto(): boolean {
    return !!this.profilePhoto;
  }

  get profileHeadline(): string {
    const jobTitle = this.normalizeText(this.profileForm.value.jobTitle);
    const department = this.normalizeText(this.profileForm.value.department);

    return [jobTitle, department].filter(Boolean).join(' • ') || 'Profile pending';
  }

  async saveProfile(): Promise<void> {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload: WorkspaceProfileState = {
      ...this.profileForm.value,
      photo: this.profilePhoto,
      updatedAt: new Date().toISOString(),
    };

    let warningMessage = '';

    try {
      if (this.currentEmployeeProfile) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/employee/me',
          this.buildEmployeeProfilePayload(payload)
        );

        this.currentEmployeeProfile = {
          ...this.currentEmployeeProfile,
          ...this.buildEmployeeProfilePayload(payload),
        };
      } else {
        warningMessage = 'Profile preferences were saved locally. No linked employee record was available to update.';
      }

      this.profileWorkspaceService.saveProfile(payload, this.sessionUsername);
      this.profileWorkspaceService.refreshCurrentProfile();
      this.lastSavedAt = payload.updatedAt;

      if (warningMessage) {
        super.show('Warning', warningMessage, 'warning');
      } else {
        super.show('Confirmation', 'Profile saved successfully.', 'success');
      }
    } catch (error) {
      this.profileWorkspaceService.saveProfile(payload, this.sessionUsername);
      this.profileWorkspaceService.refreshCurrentProfile();
      this.lastSavedAt = payload.updatedAt;
      super.show(
        'Warning',
        'Profile preferences were saved locally, but the employee profile could not be updated right now.',
        'warning'
      );
    } finally {
      this.saving = false;
    }
  }

  resetProfile(): void {
    this.submitted = false;
    this.loadProfile();
  }

  applyAvatarPreset(photo: string): void {
    this.profileForm.patchValue({ photo });
  }

  clearAvatar(): void {
    this.profileForm.patchValue({ photo: '' });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      return;
    }

    if (file.type.indexOf('image/') !== 0) {
      super.show('Warning', 'Choose an image file for the profile portrait.', 'warning');
      input.value = '';
      return;
    }

    if (file.size > this.maxProfileImageSize) {
      super.show('Warning', 'Keep the portrait below 1.5 MB for reliable local storage.', 'warning');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';

      if (!result) {
        super.show('Warning', 'Unable to read the selected image.', 'warning');
        return;
      }

      this.profileForm.patchValue({ photo: result });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  formatSavedAt(value: string): string {
    if (!value) {
      return 'Not saved yet';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not saved yet';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsedDate);
  }

  private loadProfile(): void {
    const defaults = this.buildDefaultProfile();
    const storedProfile = this.profileWorkspaceService.readProfile(this.sessionUsername);

    this.httpService.get(CONFIG.URL_BASE + '/employee/me').subscribe(
      (employee: any) => {
        this.currentEmployeeProfile = employee;

        const merged = {
          ...defaults,
          ...(storedProfile || {}),
          ...this.mapEmployeeToProfileState(employee),
        };

        this.profileForm.reset(merged);
        this.lastSavedAt = merged.updatedAt || '';
      },
      () => {
        this.currentEmployeeProfile = null;

        const merged = storedProfile
          ? {
              ...defaults,
              ...storedProfile,
            }
          : defaults;

        this.profileForm.reset(merged);
        this.lastSavedAt = merged.updatedAt || '';
      }
    );
  }

  private buildDefaultProfile(): WorkspaceProfileState {
    const formattedName = this.toTitleCase(this.sessionUsername);

    return {
      displayName:
        this.sessionUsername.toLowerCase() === 'admin'
          ? 'Administrator'
          : formattedName,
      email: this.sessionUsername.toLowerCase() + '@humant.local',
      jobTitle: 'HR Workspace Lead',
      department: 'Operations',
      phone: '+1 555 0100',
      location: 'Head office',
      timezone: 'UTC',
      bio: 'Owns daily HR operations, policy follow-up, and workspace readiness across routed admin modules.',
      photo: '',
      updatedAt: '',
    };
  }

  private readWorkspaceName(): string {
    const storedValue = localStorage.getItem(this.configurationStorageKey);

    if (!storedValue) {
      return 'Humant HR Workspace';
    }

    try {
      const parsed = JSON.parse(storedValue) as { companyName?: string };
      return this.normalizeText(parsed.companyName) || 'Humant HR Workspace';
    } catch (error) {
      return 'Humant HR Workspace';
    }
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private mapEmployeeToProfileState(employee: any): Partial<WorkspaceProfileState> {
    if (!employee || typeof employee !== 'object') {
      return {};
    }

    return {
      displayName: this.pickFirstText(employee.fullName),
      email: this.pickFirstText(employee.email),
      jobTitle: this.pickFirstText(
        employee.jobPosition && employee.jobPosition.title,
        employee.jobPosition && employee.jobPosition.name,
        employee.job && employee.job.title,
        employee.job && employee.job.name,
        employee.designation && employee.designation.name
      ),
      department: this.pickFirstText(
        employee.department && employee.department.name,
        employee.departement && employee.departement.name
      ),
      phone: this.pickFirstText(employee.phone, employee.contactNumber),
      location: this.pickFirstText(employee.presentAddress),
      bio: this.pickFirstText(employee.note),
      photo: this.pickFirstText(employee.photo),
    };
  }

  private buildEmployeeProfilePayload(profile: WorkspaceProfileState): Record<string, string> {
    return {
      fullName: this.normalizeText(profile.displayName),
      phone: this.normalizeText(profile.phone),
      presentAddress: this.normalizeText(profile.location),
      photo: this.normalizeText(profile.photo),
      note: this.normalizeText(profile.bio),
      contactNumber: this.normalizeText(profile.phone),
    };
  }

  private pickFirstText(...values: unknown[]): string {
    for (const value of values) {
      const normalized = this.normalizeText(value);
      if (normalized.length > 0) {
        return normalized;
      }
    }

    return '';
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}
