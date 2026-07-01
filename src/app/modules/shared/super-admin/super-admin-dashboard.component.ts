import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import CONFIG from 'src/app/main/urls/urls';
import { AuthentificationService } from 'src/app/main/security/authentification.service';

interface Tenant {
  id: number;
  tenantCode: string;
  companyName: string;
  adminEmail: string;
  plan: string;
  status: string;
  stripeCustomerId: string;
  createdAt: string;
  trialEndsAt: string;
  subscriptionEndsAt: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css'],
})
export class SuperAdminDashboardComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.http.get<Tenant[]>(`${CONFIG.URL_BASE}/api/super-admin/tenants`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (tenants) => { this.tenants = tenants; this.loading = false; },
      error: () => { this.errorMessage = 'Could not load tenants.'; this.loading = false; },
    });
  }

  suspend(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/suspend`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenant(t); this.successMessage = `${code} suspended.`; },
      error: () => { this.errorMessage = 'Could not suspend tenant.'; },
    });
  }

  activate(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/activate`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenant(t); this.successMessage = `${code} activated.`; },
      error: () => { this.errorMessage = 'Could not activate tenant.'; },
    });
  }

  changePlan(code: string, plan: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/plan`, { plan }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (t) => { this.updateTenant(t); this.successMessage = `${code} plan updated.`; },
      error: () => { this.errorMessage = 'Could not update plan.'; },
    });
  }

  private updateTenant(updated: Tenant): void {
    const idx = this.tenants.findIndex((t) => t.tenantCode === updated.tenantCode);
    if (idx >= 0) { this.tenants[idx] = updated; }
  }

  get activeCount(): number { return this.tenants.filter((t) => t.status === 'ACTIVE').length; }
  get suspendedCount(): number { return this.tenants.filter((t) => t.status === 'SUSPENDED').length; }
  get paidCount(): number { return this.tenants.filter((t) => t.plan !== 'FREE').length; }
}
