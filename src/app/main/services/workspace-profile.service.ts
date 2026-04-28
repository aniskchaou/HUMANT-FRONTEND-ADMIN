import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AuthentificationService } from '../security/authentification.service';

export interface WorkspaceProfileState {
  displayName: string;
  email: string;
  jobTitle: string;
  department: string;
  phone: string;
  location: string;
  timezone: string;
  bio: string;
  photo: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceProfileService {
  private readonly storagePrefix = 'humant.profile.';
  private readonly currentProfileState =
    new BehaviorSubject<WorkspaceProfileState | null>(null);

  constructor(private authentificationService: AuthentificationService) {
    this.refreshCurrentProfile();
  }

  watchCurrentProfile(): Observable<WorkspaceProfileState | null> {
    return this.currentProfileState.asObservable();
  }

  getCurrentProfile(): WorkspaceProfileState | null {
    return this.currentProfileState.value;
  }

  getProfileStorageKey(username?: string): string {
    return this.storagePrefix + this.resolveUsername(username);
  }

  readProfile(username?: string): WorkspaceProfileState | null {
    const storedValue = localStorage.getItem(this.getProfileStorageKey(username));

    if (!storedValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(storedValue) as Partial<WorkspaceProfileState>;

      return {
        displayName: this.normalizeText(parsed.displayName),
        email: this.normalizeText(parsed.email),
        jobTitle: this.normalizeText(parsed.jobTitle),
        department: this.normalizeText(parsed.department),
        phone: this.normalizeText(parsed.phone),
        location: this.normalizeText(parsed.location),
        timezone: this.normalizeText(parsed.timezone),
        bio: this.normalizeText(parsed.bio),
        photo: this.normalizeText(parsed.photo),
        updatedAt: this.normalizeText(parsed.updatedAt),
      };
    } catch (error) {
      return null;
    }
  }

  saveProfile(
    profile: WorkspaceProfileState,
    username?: string
  ): WorkspaceProfileState {
    const payload: WorkspaceProfileState = {
      ...profile,
      photo: this.normalizeText(profile.photo),
      updatedAt: this.normalizeText(profile.updatedAt),
    };

    localStorage.setItem(this.getProfileStorageKey(username), JSON.stringify(payload));

    if (!username || this.resolveUsername(username) === this.resolveUsername()) {
      this.currentProfileState.next(payload);
    }

    return payload;
  }

  refreshCurrentProfile(): void {
    this.currentProfileState.next(this.readProfile());
  }

  clearProfile(username?: string): void {
    localStorage.removeItem(this.getProfileStorageKey(username));

    if (!username || this.resolveUsername(username) === this.resolveUsername()) {
      this.currentProfileState.next(null);
    }
  }

  private resolveUsername(username?: string): string {
    return (
      this.normalizeText(
        username || this.authentificationService.getStoredUsername() || 'operator'
      ).toLowerCase() || 'operator'
    );
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}