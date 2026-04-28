import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import CONFIG from '../urls/urls';

interface SessionResponse {
  username: string;
  displayName?: string;
  authorities?: string[];
  role?: string;
  company?: {
    id?: number;
    code?: string;
    name?: string;
  };
  accessPolicy?: StoredAccessPolicy;
  authSettings?: AuthSettingsSnapshot;
}

export interface StoredAccessPolicy {
  roleName?: string;
  allowedRoutePrefixes?: string;
  canViewSensitiveData?: boolean;
  canManageUsers?: boolean;
  canManageConfiguration?: boolean;
  canManageCompanies?: boolean;
  canViewAuditLogs?: boolean;
  defaultLandingRoute?: string;
}

export interface AuthSettingsSnapshot {
  passwordMinLength?: number;
  sessionTimeoutMinutes?: number;
  allowRememberMe?: boolean;
}

interface StoredAuthState {
  username: string;
  authorization: string;
  displayName?: string;
  authorities?: string[];
  role?: string;
  companyName?: string;
  companyCode?: string;
  accessPolicy?: StoredAccessPolicy;
  authSettings?: AuthSettingsSnapshot;
  rememberMe: boolean;
  authenticatedAt: string;
}

export interface AuthenticatedSession {
  username: string;
  displayName: string;
  authorities: string[];
  role: string;
  primaryAuthority: string;
  companyName: string;
  accessPolicy?: StoredAccessPolicy;
  authSettings?: AuthSettingsSnapshot;
  rememberMe: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  private readonly sessionStorageKey = 'humant.auth.session';
  private readonly persistentStorageKey = 'humant.auth.remembered';

  constructor(private httpClient: HttpClient) {}

  authenticate(
    username: string,
    password: string,
    rememberMe = false
  ): Observable<AuthenticatedSession> {
    const normalizedUsername = (username || '').trim();
    const authorization = this.buildAuthorizationToken(
      normalizedUsername,
      password || ''
    );
    const headers = new HttpHeaders({
      Authorization: authorization,
    });

    return this.httpClient
      .get<SessionResponse>(CONFIG.URL_BASE + '/user/session', { headers })
      .pipe(
        map((sessionResponse) => {
          const session = this.persistSession(
            sessionResponse.username || normalizedUsername,
            authorization,
            rememberMe,
            sessionResponse
          );

          return this.toAuthenticatedSession(sessionResponse, session);
        })
      );
  }

  isUserLoggedIn(): boolean {
    const state = this.readStoredState();

    if (!state || !state.authorization || !state.username) {
      return false;
    }

    const sessionTimeoutMinutes = Number(state.authSettings && state.authSettings.sessionTimeoutMinutes);

    if (sessionTimeoutMinutes > 0 && state.authenticatedAt) {
      const authenticatedAt = new Date(state.authenticatedAt).getTime();

      if (!Number.isNaN(authenticatedAt)) {
        const expiration = authenticatedAt + sessionTimeoutMinutes * 60 * 1000;

        if (Date.now() > expiration) {
          this.logOut();
          return false;
        }
      }
    }

    return true;
  }

  getStoredUsername(): string {
    const state = this.readStoredState();

    if (state && state.username) {
      return state.username;
    }

    return sessionStorage.getItem('username') || localStorage.getItem('username');
  }

  getStoredAuthorization(): string {
    const state = this.readStoredState();

    if (state && state.authorization) {
      return state.authorization;
    }

    const legacyUsername = sessionStorage.getItem('username') || localStorage.getItem('username');
    const legacyPassword = sessionStorage.getItem('password') || localStorage.getItem('password');

    if (!legacyUsername || !legacyPassword) {
      return '';
    }

    return this.buildAuthorizationToken(legacyUsername, legacyPassword);
  }

  getStoredAuthorities(): string[] {
    const state = this.readStoredState();

    if (state && Array.isArray(state.authorities) && state.authorities.length) {
      return state.authorities;
    }

    const username = (state && state.username) || this.getStoredUsername();
    return this.deriveAuthoritiesFromUsername(username);
  }

  getStoredRole(): string {
    const state = this.readStoredState();

    if (state && state.role) {
      return state.role;
    }

    const authorities = this.getStoredAuthorities();

    if (authorities.length) {
      return authorities[0].replace(/^ROLE_/, '').toUpperCase();
    }

    return 'EMPLOYEE';
  }

  getStoredAccessPolicy(): StoredAccessPolicy | null {
    const state = this.readStoredState();
    return state && state.accessPolicy ? state.accessPolicy : null;
  }

  getStoredAuthSettings(): AuthSettingsSnapshot | null {
    const state = this.readStoredState();
    return state && state.authSettings ? state.authSettings : null;
  }

  getStoredCompanyName(): string {
    const state = this.readStoredState();
    return state && state.companyName ? state.companyName : '';
  }

  getAuthHeaders(includeContentType = false): HttpHeaders {
    let headers = new HttpHeaders();
    const authorization = this.getStoredAuthorization();

    if (authorization) {
      headers = headers.set('Authorization', authorization);
    }

    if (includeContentType) {
      headers = headers.set('content-type', 'application/json');
    }

    return headers;
  }

  getDisplayName(username?: string): string {
    if (!username) {
      const state = this.readStoredState();

      if (state && state.displayName) {
        return state.displayName;
      }
    }

    const resolvedUsername = (username || this.getStoredUsername() || 'operator').trim();

    if (!resolvedUsername) {
      return 'Operator';
    }

    if (resolvedUsername.toLowerCase() === 'admin') {
      return 'Administrator';
    }

    return resolvedUsername
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  getPrimaryRoleLabel(): string {
    const role = this.getStoredRole();

    if (role === 'HR') {
      return 'HR';
    }

    return role.charAt(0) + role.substring(1).toLowerCase();
  }

  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }

  hasAnyRole(roles: string[]): boolean {
    const normalizedRoles = roles.map((role) => role.toUpperCase());

    return this.getStoredAuthorities().some((authority) =>
      normalizedRoles.includes(authority.replace(/^ROLE_/, '').toUpperCase())
    );
  }

  logOut(): void {
    sessionStorage.removeItem(this.sessionStorageKey);
    sessionStorage.removeItem('username');
		 sessionStorage.removeItem('password');
		 localStorage.removeItem(this.persistentStorageKey);
		 localStorage.removeItem('username');
		 localStorage.removeItem('password');
  }

  private persistSession(
    username: string,
    authorization: string,
    rememberMe: boolean,
    sessionResponse?: SessionResponse
  ): StoredAuthState {
    const authorities = Array.isArray(sessionResponse && sessionResponse.authorities)
      ? sessionResponse.authorities
      : this.deriveAuthoritiesFromUsername(username);
    const authSettings: AuthSettingsSnapshot = {
      passwordMinLength: Number(sessionResponse && sessionResponse.authSettings && sessionResponse.authSettings.passwordMinLength) || 8,
      sessionTimeoutMinutes: Number(sessionResponse && sessionResponse.authSettings && sessionResponse.authSettings.sessionTimeoutMinutes) || 480,
      allowRememberMe: sessionResponse && sessionResponse.authSettings
        ? sessionResponse.authSettings.allowRememberMe !== false
        : true,
    };
    const effectiveRememberMe = rememberMe && authSettings.allowRememberMe !== false;
    const session: StoredAuthState = {
      username,
      authorization,
      displayName:
        (sessionResponse && sessionResponse.displayName) || this.getDisplayName(username),
      authorities,
      role:
        (sessionResponse && sessionResponse.role) ||
        (authorities.length ? authorities[0].replace(/^ROLE_/, '').toUpperCase() : 'EMPLOYEE'),
      companyName: (sessionResponse && sessionResponse.company && sessionResponse.company.name) || '',
      companyCode: (sessionResponse && sessionResponse.company && sessionResponse.company.code) || '',
      accessPolicy: sessionResponse && sessionResponse.accessPolicy ? sessionResponse.accessPolicy : null,
      authSettings,
      rememberMe: effectiveRememberMe,
      authenticatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
    sessionStorage.setItem('username', username);
    sessionStorage.removeItem('password');

    if (effectiveRememberMe) {
      localStorage.setItem(this.persistentStorageKey, JSON.stringify(session));
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem(this.persistentStorageKey);
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }

    return session;
  }

  private toAuthenticatedSession(
    sessionResponse: SessionResponse,
    session: StoredAuthState
  ): AuthenticatedSession {
    const authorities = Array.isArray(session.authorities)
      ? session.authorities
      : this.deriveAuthoritiesFromUsername(session.username);

    return {
      username: sessionResponse.username || session.username,
      displayName:
        session.displayName || this.getDisplayName(sessionResponse.username || session.username),
      authorities,
      role: session.role || 'EMPLOYEE',
      primaryAuthority: authorities.length ? authorities[0] : 'ROLE_EMPLOYEE',
      companyName: session.companyName || '',
      accessPolicy: session.accessPolicy || undefined,
      authSettings: session.authSettings || undefined,
      rememberMe: session.rememberMe,
    };
  }

  private readStoredState(): StoredAuthState | null {
    return (
      this.parseStoredState(sessionStorage.getItem(this.sessionStorageKey)) ||
      this.parseStoredState(localStorage.getItem(this.persistentStorageKey))
    );
  }

  private parseStoredState(value: string | null): StoredAuthState | null {
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as Partial<StoredAuthState>;

      if (!parsed.username || !parsed.authorization) {
        return null;
      }

      return {
        username: parsed.username,
        authorization: parsed.authorization,
        displayName: parsed.displayName || '',
        authorities: Array.isArray(parsed.authorities) ? parsed.authorities : [],
        role: parsed.role || '',
        companyName: parsed.companyName || '',
        companyCode: parsed.companyCode || '',
        accessPolicy: parsed.accessPolicy || null,
        authSettings: parsed.authSettings || null,
        rememberMe: !!parsed.rememberMe,
        authenticatedAt: parsed.authenticatedAt || '',
      };
    } catch (error) {
      return null;
    }
  }

  private buildAuthorizationToken(username: string, password: string): string {
    return 'Basic ' + btoa(username + ':' + password);
  }

  private deriveAuthoritiesFromUsername(username?: string): string[] {
    const normalizedUsername = (username || '').trim().toLowerCase();

    switch (normalizedUsername) {
      case 'admin':
        return ['ROLE_ADMIN'];
      case 'hr':
        return ['ROLE_HR'];
      case 'manager':
        return ['ROLE_MANAGER'];
      case 'recruiter':
        return ['ROLE_RECRUITER'];
      case 'emp':
      default:
        return normalizedUsername ? ['ROLE_EMPLOYEE'] : [];
    }
  }
}
