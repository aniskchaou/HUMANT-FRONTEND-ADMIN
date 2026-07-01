import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  tenantCode = '';
  companyName = '';
  adminEmail = '';
  adminUsername = '';
  adminPassword = '';
  confirmPassword = '';

  submitting = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  codeAvailable: boolean | null = null;
  checkingCode = false;

  constructor(private http: HttpClient, private router: Router) {}

  checkCode(): void {
    const code = (this.tenantCode || '').trim().toLowerCase();
    if (!code) { this.codeAvailable = null; return; }
    this.checkingCode = true;
    this.http.get<any>(`${CONFIG.URL_BASE}/api/tenants/check?code=${code}`)
      .subscribe({
        next: (res) => { this.codeAvailable = res.available; this.checkingCode = false; },
        error: () => { this.codeAvailable = null; this.checkingCode = false; },
      });
  }

  get formValid(): boolean {
    return !!(
      this.tenantCode.trim() &&
      this.companyName.trim() &&
      this.adminEmail.trim() &&
      this.adminUsername.trim() &&
      this.adminPassword.length >= 8 &&
      this.adminPassword === this.confirmPassword &&
      this.codeAvailable === true
    );
  }

  register(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.formValid) { return; }

    this.submitting = true;

    this.http.post<any>(`${CONFIG.URL_BASE}/api/tenants/register`, {
      tenantCode: this.tenantCode.trim().toLowerCase(),
      companyName: this.companyName.trim(),
      adminEmail: this.adminEmail.trim(),
      adminUsername: this.adminUsername.trim(),
      adminPassword: this.adminPassword,
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successMessage = res.message || 'Registration successful!';
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = (err.error && err.error.error) || 'Registration failed. Please try again.';
      },
    });
  }
}
