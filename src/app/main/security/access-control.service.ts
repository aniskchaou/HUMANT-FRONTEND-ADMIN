import { Injectable } from '@angular/core';

import { AuthentificationService, StoredAccessPolicy } from './authentification.service';

type AccessRole = 'ADMIN' | 'HR' | 'MANAGER' | 'RECRUITER' | 'EMPLOYEE';

interface RouteAccessRule {
  prefixes: string[];
  roles: AccessRole[];
}

@Injectable({
  providedIn: 'root',
})
export class AccessControlService {
  private readonly accessPolicyStorageKey = 'humant.workspace.accessPolicies';
  private readonly sensitivePrefixes = ['/salary', '/pay-slip', '/document', '/configuration', '/user'];
  private readonly routeAccessRules: RouteAccessRule[] = [
    {
      prefixes: ['/user', '/configuration'],
      roles: ['ADMIN', 'HR'],
    },
    {
      prefixes: [
        '/job',
        '/candidate',
        '/interview',
        '/offer-letter',
        '/pipeline',
        '/announcement',
        '/communication',
        '/onboarding',
        '/training',
        '/event',
      ],
      roles: ['ADMIN', 'HR', 'MANAGER', 'RECRUITER'],
    },
    {
      prefixes: [
        '/employee',
        '/departement',
        '/designation',
        '/education-level',
        '/contract',
        '/contract-type',
        '/document',
        '/salary',
        '/pay-slip',
        '/loan',
        '/advance',
        '/attendance',
        '/notice',
        '/warning',
        '/resignation',
        '/resign',
        '/termination',
        '/transfert',
      ],
      roles: ['ADMIN', 'HR', 'MANAGER'],
    },
    {
      prefixes: [
        '/dashboard',
        '/announcement',
        '/leave',
        '/leave-type',
        '/holiday',
        '/onboarding',
        '/performance',
        '/expense',
        '/training',
        '/training-type',
        '/award',
        '/award-type',
        '/event',
        '/job',
        '/launch-plan',
        '/communication',
        '/profile',
        '/editprofile',
        '/documentation',
      ],
      roles: ['ADMIN', 'HR', 'MANAGER'],
    },
    {
      prefixes: ['/profile', '/editprofile', '/expense', '/leave', '/pay-slip', '/performance', '/resignation', '/resign', '/documentation'],
      roles: ['EMPLOYEE'],
    },
    {
      prefixes: ['/documentation'],
      roles: ['RECRUITER'],
    },
  ];

  constructor(private authentificationService: AuthentificationService) {}

  canAccessRoute(route: string): boolean {
    const normalizedRoute = this.normalizeRoute(route);

    if (normalizedRoute === '/login') {
      return true;
    }

    const currentRoles = this.getCurrentRoles();

    if (!currentRoles.length) {
      return false;
    }

    if (currentRoles.includes('ADMIN')) {
      return true;
    }

    const policy = this.getEffectivePolicy(currentRoles);

    if (policy) {
      const policyDecision = this.canAccessByPolicy(normalizedRoute, policy);

      if (policyDecision !== null) {
        return policyDecision;
      }
    }

    let matchedRule = false;

    for (const rule of this.routeAccessRules) {
      if (
        rule.prefixes.some((prefix) => this.routeMatches(normalizedRoute, prefix))
      ) {
        matchedRule = true;

        if (rule.roles.some((role) => currentRoles.includes(role))) {
          return true;
        }
      }
    }

    return !matchedRule ? false : false;
  }

  getDefaultRoute(): string {
    const currentRoles = this.getCurrentRoles();
    const policy = this.getEffectivePolicy(currentRoles);

    if (policy && policy.defaultLandingRoute && this.canAccessRoute(policy.defaultLandingRoute)) {
      return policy.defaultLandingRoute;
    }

    if (currentRoles.includes('ADMIN') || currentRoles.includes('HR') || currentRoles.includes('MANAGER')) {
      return '/dashboard';
    }

    if (currentRoles.includes('RECRUITER')) {
      return '/job';
    }

    if (currentRoles.includes('EMPLOYEE')) {
      return '/profile';
    }

    return '/login';
  }

  private getCurrentRoles(): AccessRole[] {
    return this.authentificationService
      .getStoredAuthorities()
      .map((authority) => authority.replace(/^ROLE_/, '').toUpperCase())
      .filter((authority): authority is AccessRole =>
        ['ADMIN', 'HR', 'MANAGER', 'RECRUITER', 'EMPLOYEE'].includes(authority)
      );
  }

  private getEffectivePolicy(currentRoles: AccessRole[]): StoredAccessPolicy | null {
    const sessionPolicy = this.authentificationService.getStoredAccessPolicy();

    if (sessionPolicy) {
      return sessionPolicy;
    }

    const role = currentRoles[0];

    if (!role) {
      return null;
    }

    const rolePolicies = this.readStoredRolePolicies();
    return rolePolicies[role] || null;
  }

  private canAccessByPolicy(route: string, policy: StoredAccessPolicy): boolean | null {
    const allowedPrefixes = (policy.allowedRoutePrefixes || '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (!allowedPrefixes.length) {
      return null;
    }

    if (
      this.sensitivePrefixes.some((prefix) => this.routeMatches(route, prefix)) &&
      policy.canViewSensitiveData === false
    ) {
      return false;
    }

    return allowedPrefixes.some((prefix) => this.routeMatches(route, prefix));
  }

  private normalizeRoute(route: string): string {
    const normalized = (route || '').split('?')[0].split('#')[0].trim();
    return normalized || '/dashboard';
  }

  private routeMatches(route: string, prefix: string): boolean {
    return route === prefix || route.startsWith(prefix + '/');
  }

  private readStoredRolePolicies(): Record<string, StoredAccessPolicy> {
    const rawValue = localStorage.getItem(this.accessPolicyStorageKey);

    if (!rawValue) {
      return {};
    }

    try {
      const parsed = JSON.parse(rawValue);

      if (!Array.isArray(parsed)) {
        return {};
      }

      return parsed.reduce((accumulator: Record<string, StoredAccessPolicy>, item: StoredAccessPolicy) => {
        const roleName = ((item && item.roleName) || '').toString().trim().toUpperCase();

        if (!roleName) {
          return accumulator;
        }

        accumulator[roleName] = item;
        return accumulator;
      }, {});
    } catch (_error) {
      return {};
    }
  }
}