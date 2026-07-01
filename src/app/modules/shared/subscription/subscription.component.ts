import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import CONFIG from 'src/app/main/urls/urls';
import { AuthentificationService } from 'src/app/main/security/authentification.service';

interface Plan {
  priceId: string;
  nickname: string;
  amount: number;
  currency: string;
  interval: string;
  features?: string[];
}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
})
export class SubscriptionComponent implements OnInit {
  plans: Plan[] = [];
  loading = true;
  selectedPriceId = '';
  subscribing = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.http.get<Plan[]>(`${CONFIG.URL_BASE}/api/stripe/plans`).subscribe({
      next: (plans) => { this.plans = plans; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  formatAmount(amount: number, currency: string): string {
    return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency.toUpperCase() });
  }

  subscribe(priceId: string): void {
    this.subscribing = true;
    this.errorMessage = '';
    const tenantCode = this.authService.getStoredTenantCode();

    this.http.post<any>(`${CONFIG.URL_BASE}/api/tenants/subscribe`, {
      tenantCode,
      priceId,
    }, { headers: this.authService.getAuthHeaders(true) }).subscribe({
      next: (res) => {
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          this.errorMessage = 'Could not redirect to payment. Please try again.';
          this.subscribing = false;
        }
      },
      error: (err) => {
        this.errorMessage = (err.error && err.error.error) || 'Payment redirect failed.';
        this.subscribing = false;
      },
    });
  }
}
