import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  WorkspaceProfileService,
  WorkspaceProfileState,
} from 'src/app/main/services/workspace-profile.service';
import { AuthentificationService } from 'src/app/main/security/authentification.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent implements OnInit, OnDestroy {
  displayName = 'Administrator';
  workspaceLabel = 'Premium HR Operations';
  avatarPhoto = '';
  roleLabel = 'Admin';

  private profileSubscription: Subscription;

  constructor(
    private router: Router,
    private authentificationService: AuthentificationService,
    private workspaceProfileService: WorkspaceProfileService
  ) {}

  ngOnInit(): void {
    const storedUsername = this.authentificationService.getStoredUsername();
    this.applyFallbackIdentity(storedUsername);
    this.workspaceProfileService.refreshCurrentProfile();
    this.profileSubscription = this.workspaceProfileService
      .watchCurrentProfile()
      .subscribe((profile) => this.applyProfile(profile, storedUsername));
  }

  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  get initials(): string {
    const displayName = (this.displayName || 'Operator').trim();
    const tokens = displayName.split(/\s+/).filter((value) => value.length > 0);

    if (!tokens.length) {
      return 'OP';
    }

    return tokens
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  }

  get hasAvatarPhoto(): boolean {
    return !!this.avatarPhoto;
  }

  logOut() {
    this.authentificationService.logOut();
    this.router.navigate(['/login']);
  }

  private applyProfile(
    profile: WorkspaceProfileState | null,
    username?: string
  ): void {
    this.applyFallbackIdentity(username);

    if (!profile) {
      return;
    }

    if (profile.displayName) {
      this.displayName = profile.displayName;
    }

    if (profile.jobTitle) {
      this.workspaceLabel = profile.jobTitle;
    }

    if (profile.department) {
      this.roleLabel = profile.department;
    }

    if (profile.photo) {
      this.avatarPhoto = profile.photo;
    }
  }

  private applyFallbackIdentity(username?: string): void {
    const resolvedUsername = username || this.authentificationService.getStoredUsername();
    this.displayName = this.authentificationService.getDisplayName(resolvedUsername);
    this.workspaceLabel = this.resolveWorkspaceLabel();
    this.roleLabel = this.authentificationService.getPrimaryRoleLabel();
    this.avatarPhoto = '';
  }

  private resolveWorkspaceLabel(): string {
    const role = this.authentificationService.getStoredRole();

    switch (role) {
      case 'ADMIN':
        return 'System Administration';
      case 'HR':
        return 'HR Operations';
      case 'MANAGER':
        return 'Team Management';
      case 'EMPLOYEE':
      default:
        return 'Employee Workspace';
    }
  }
}
