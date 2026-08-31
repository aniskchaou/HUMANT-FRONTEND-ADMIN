import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import CONFIG from 'src/app/main/urls/urls';
import { AuthentificationService } from 'src/app/main/security/authentification.service';

interface Tenant {
  id: number;
  tenantCode: string;
  companyName: string;
  adminEmail: string;
  plan: string;
  status: string;
  billingCycle: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  maxUsers: string;
  maxEmployees: string;
  seatsConsumed: string;
  couponCode: string;
  discountPercent: string;
  industry: string;
  companySize: string;
  country: string;
  currency: string;
  timezone: string;
  language: string;
  domain: string;
  subdomain: string;
  logoUrl: string;
  description: string;
  phone: string;
  ownerName: string;
  ownerEmail: string;
  notes: string;
  storageUsageMb: number;
  apiCallsThisMonth: number;
  totalEmployees: number;
  totalUsers: number;
  createdAt: string;
  updatedAt: string;
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionEndsAt: string;
  cancelledAt: string;
  archivedAt: string;
  lastLoginAt: string;
  lastActivityAt: string;
}

interface PlatformUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  active: boolean;
  tenantCode: string;
}

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  cancelledTenants: number;
  trialTenants: number;
  paidTenants: number;
  newThisMonth: number;
  expiringSoon: number;
  trialExpiringSoon: number;
  byPlan: { FREE: number; STARTER: number; PROFESSIONAL: number; ENTERPRISE: number };
  estimatedMrrCents: number;
  estimatedArrCents: number;
  revenueThisMonthCents: number;
  churnRate: number;
  arpuCents: number;
  clvCents: number;
  totalEmployees: number;
  totalUsers: number;
  totalStorageMb: number;
  totalApiCallsThisMonth: number;
}

interface SaasPlan {
  id: number;
  planKey: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  setupFeeCents: number;
  trialDays: number;
  currency: string;
  minUsers: number;
  maxUsers: number;
  maxEmployees: number;
  maxStorageMb: number;
  apiLimitPerMonth: number;
  features: string;
  enabled: boolean;
  hidden: boolean;
  popular: boolean;
  publicPlan: boolean;
  sortOrder: number;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

interface FeatureFlag {
  id: number;
  featureKey: string;
  featureName: string;
  description: string;
  module: string;
  enabledGlobally: boolean;
  enabledForPlans: string;
  enabledForTenants: string;
  betaFeature: boolean;
  rolloutPercent: number;
  scheduledActivationAt: string;
  scheduledDeactivationAt: string;
}

interface Integration {
  id: number;
  integrationKey: string;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  enabled: boolean;
  configJson: string;
  syncStatus: string;
  failedSyncs: number;
  lastSyncError: string;
  recentLogs: string;
  createdAt: string;
  updatedAt: string;
  lastSyncAt: string;
  lastTestedAt: string;
}

interface AnalyticsData {
  customer: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
    cancelled: number;
    newThisMonth: number;
    newLast3Month: number;
    churnRate: number;
    retentionRate: number;
  };
  subscription: {
    newThisMonth: number;
    trialConversionRate: number;
    renewalsDue30d: number;
    byPlan: { FREE: number; STARTER: number; PROFESSIONAL: number; ENTERPRISE: number };
  };
  revenue: {
    mrrCents: number;
    arrCents: number;
    arpuCents: number;
    totalRevenueCents: number;
    refundedCents: number;
    netRevenueCents: number;
    revenueByPlan: { [plan: string]: number };
    revenueByCountry: { [country: string]: number };
  };
  product: {
    totalUsers: number;
    totalEmployees: number;
    mau: number;
    wau: number;
    dau: number;
    dauToMau: number;
    featureAdoption: Array<{ feature: string; adoptionPct: number }>;
  };
  monthlyTrend: Array<{ month: string; newTenants: number; totalTenants: number; revenueCents: number }>;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  tenantCode: string;
  companyName: string;
  amountCents: number;
  taxAmountCents: number;
  currency: string;
  status: string;
  description: string;
  stripeInvoiceId: string;
  downloadUrl: string;
  issuedAt: string;
  dueAt: string;
  paidAt: string;
  sentAt: string;
}

interface Payment {
  id: number;
  tenantCode: string;
  companyName: string;
  amountCents: number;
  refundedAmountCents: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  stripePaymentIntentId: string;
  failureReason: string;
  invoiceId: number;
  createdAt: string;
  processedAt: string;
  refundedAt: string;
}

interface BillingStats {
  totalRevenueCents: number;
  outstandingCents: number;
  overdueCents: number;
  paymentsTodayCents: number;
  paymentsThisMonthCents: number;
  failedPayments: number;
  totalRefundedCents: number;
  totalInvoices: number;
  paidInvoices: number;
  draftInvoices: number;
  overdueInvoices: number;
}

interface PlatformRole {
  id: number;
  roleName: string;
  description: string;
  permissions: string;
  systemRole: boolean;
  active: boolean;
}

interface Customer360 {
  tenantCode: string;
  companyName: string;
  adminEmail: string;
  industry: string;
  companySize: string;
  country: string;
  currency: string;
  logoUrl: string;
  ownerName: string;
  phone: string;
  plan: string;
  status: string;
  billingCycle: string;
  maxUsers: string;
  maxEmployees: string;
  seatsConsumed: string;
  subscriptionEndsAt: string;
  trialEndsAt: string;
  createdAt: string;
  totalEmployees: number;
  totalUsers: number;
  storageUsageMb: number;
  apiCallsThisMonth: number;
  stripeCustomerId: string;
  couponCode: string;
  discountPercent: string;
  platformUserCount: number;
  healthScore: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css'],
})
export class SuperAdminDashboardComponent implements OnInit {
  tenants: Tenant[] = [];
  stats: PlatformStats | null = null;
  platformUsers: PlatformUser[] = [];
  saasPlan: SaasPlan[] = [];
  featureFlags: FeatureFlag[] = [];
  invoices: Invoice[] = [];
  payments: Payment[] = [];
  billingStats: BillingStats | null = null;
  platformRoles: PlatformRole[] = [];
  customer360: Customer360 | null = null;

  loading = true;
  usersLoading = false;
  plansLoading = false;
  featuresLoading = false;
  billingLoading2 = false;
  paymentsLoading = false;
  rolesLoading = false;
  customer360Loading = false;
  integrationsLoading = false;
  analyticsLoading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  activeSection = 'overview';

  integrations: Integration[] = [];
  analyticsData: AnalyticsData | null = null;

  showCredentialsModal = false;
  editingIntegration: Integration | null = null;
  credentialsForm: { credentialsJson: string; configJson: string } = { credentialsJson: '{}', configJson: '{}' };
  integrationLogs: { [id: number]: string } = {};


  selectedTenant: Tenant | null = null;
  billingDetail: any = null;
  billingLoading = false;

  trialDays = 14;
  maxUsersInput: { [code: string]: string } = {};

  showTenantModal = false;
  editingTenant: Tenant | null = null;
  tenantForm: Partial<Tenant> & { adminPassword?: string } = {};

  showPlanModal = false;
  editingPlan: SaasPlan | null = null;
  planForm: Partial<SaasPlan> = {};

  showFeatureModal = false;
  editingFeature: FeatureFlag | null = null;
  featureForm: Partial<FeatureFlag> = {};

  showInvoiceModal = false;
  invoiceForm: Partial<Invoice> & { tenantCodeInput?: string } = {};

  showPlatformUserModal = false;
  platformUserForm: { username: string; displayName: string; password: string; role: string } = { username: '', displayName: '', password: '', role: 'ADMIN' };

  showRoleModal = false;
  editingRole: PlatformRole | null = null;
  roleForm: Partial<PlatformRole> = {};

  customer360Code = '';
  refundForm: { [id: number]: number } = {};

  selectedPaymentId: number | null = null;

  tenantFilter = '';
  tenantStatusFilter = 'ALL';
  tenantPlanFilter = 'ALL';
  invoiceStatusFilter = 'ALL';
  paymentStatusFilter = 'ALL';

  readonly ALL_PERMISSIONS = [
    'view_tenants', 'create_tenants', 'delete_tenants',
    'view_billing', 'refund_payments', 'manage_plans',
    'manage_features', 'manage_users', 'view_audit_logs',
    'manage_integrations', 'manage_system_settings',
  ];

  get featureModules(): string[] {
    return [...new Set(this.featureFlags.map(f => f.module || 'General'))];
  }

  flagsForModule(module: string): FeatureFlag[] {
    return this.featureFlags.filter(f => (f.module || 'General') === module);
  }

  get filteredInvoices(): Invoice[] {
    return this.invoices.filter(i => this.invoiceStatusFilter === 'ALL' || i.status === this.invoiceStatusFilter);
  }

  get filteredPayments(): Payment[] {
    return this.payments.filter(p => this.paymentStatusFilter === 'ALL' || p.status === this.paymentStatusFilter);
  }

  constructor(
    private http: HttpClient,
    private authService: AuthentificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadTenants();
  }

  doLogout(): void {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }

  get conversionRate(): number {
    if (!this.stats?.totalTenants) { return 0; }
    return Math.round((this.stats.paidTenants / this.stats.totalTenants) * 100);
  }

  get healthScore(): number {
    if (!this.stats?.totalTenants) { return 100; }
    return Math.round((this.stats.activeTenants / this.stats.totalTenants) * 100);
  }

  get planDistribution(): Array<{ plan: string; count: number; pct: number; barColor: string; badgeClass: string }> {
    if (!this.stats?.totalTenants) { return []; }
    const t = this.stats.totalTenants;
    return [
      { plan: 'Enterprise',   count: this.stats.byPlan?.ENTERPRISE   || 0, barColor: '#f59e0b', badgeClass: 'badge-ent' },
      { plan: 'Professional', count: this.stats.byPlan?.PROFESSIONAL || 0, barColor: '#8b5cf6', badgeClass: 'badge-pro' },
      { plan: 'Starter',      count: this.stats.byPlan?.STARTER      || 0, barColor: '#3b82f6', badgeClass: 'badge-starter' },
      { plan: 'Free',         count: this.stats.byPlan?.FREE         || 0, barColor: '#9ca3af', badgeClass: 'badge-free' },
    ].map(p => ({ ...p, pct: t ? Math.round((p.count / t) * 100) : 0 }));
  }

  get userRoleDistribution(): Array<{ role: string; count: number; pct: number }> {
    if (!this.platformUsers.length) { return []; }
    const total = this.platformUsers.length;
    const byRole: { [r: string]: number } = {};
    this.platformUsers.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
    return Object.entries(byRole)
      .map(([role, count]) => ({ role, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  get mrr(): number { return this.stats ? this.stats.estimatedMrrCents / 100 : 0; }
  get arr(): number { return this.mrr * 12; }
  get avgRevenuePerTenant(): number {
    if (!this.stats?.paidTenants) { return 0; }
    return this.stats.estimatedMrrCents / this.stats.paidTenants / 100;
  }
  get arpu(): number { return this.stats ? this.stats.arpuCents / 100 : 0; }
  get clv(): number  { return this.stats ? this.stats.clvCents  / 100 : 0; }

  get filteredTenants(): Tenant[] {
    return this.tenants.filter(t => {
      const q = this.tenantFilter.toLowerCase();
      const matchSearch = !q || t.tenantCode.toLowerCase().includes(q) || t.companyName.toLowerCase().includes(q) || t.adminEmail.toLowerCase().includes(q);
      const matchStatus = this.tenantStatusFilter === 'ALL' || t.status === this.tenantStatusFilter;
      const matchPlan   = this.tenantPlanFilter   === 'ALL' || t.plan   === this.tenantPlanFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }

  setSection(section: string): void {
    this.activeSection = section;
    if (section === 'users' && !this.platformUsers.length && !this.usersLoading) { this.loadUsers(); }
    if (section === 'plans' && !this.saasPlan.length && !this.plansLoading) { this.loadPlans(); }
    if (section === 'features' && !this.featureFlags.length && !this.featuresLoading) { this.loadFeatures(); }
    if (section === 'analytics' && !this.platformUsers.length && !this.usersLoading) { this.loadUsers(); }
    if (section === 'billing-payments' && !this.invoices.length) { this.loadBillingStats(); this.loadInvoices(); this.loadPayments(); }
    if (section === 'platform-users' && !this.platformUsers.length && !this.usersLoading) { this.loadUsers(); }
    if (section === 'platform-roles' && !this.platformRoles.length && !this.rolesLoading) { this.loadRoles(); }
    if (section === 'integrations' && !this.integrations.length && !this.integrationsLoading) { this.loadIntegrations(); }
    if (section === 'saas-analytics' && !this.analyticsData && !this.analyticsLoading) { this.loadAnalytics(); }
  }

  get integrationsByCategory(): { [cat: string]: Integration[] } {
    const groups: { [cat: string]: Integration[] } = {};
    for (const i of this.integrations) {
      const cat = i.category || 'OTHER';
      if (!groups[cat]) { groups[cat] = []; }
      groups[cat].push(i);
    }
    return groups;
  }

  get integrationCategories(): string[] {
    return Object.keys(this.integrationsByCategory);
  }

  syncStatusClass(status: string): string {
    const map: { [k: string]: string } = {
      SUCCESS: 'sync-ok', SYNCING: 'sync-syncing',
      FAILED: 'sync-failed', IDLE: 'sync-idle', NOT_CONFIGURED: 'sync-nc',
    };
    return map[status] || 'sync-nc';
  }

  catLabel(cat: string): string {
    const map: { [k: string]: string } = {
      IDENTITY: 'Identity & SSO', HR: 'HR & Payroll',
      COMMUNICATION: 'Communication', ANALYTICS: 'Analytics', OTHER: 'Other',
    };
    return map[cat] || cat;
  }

  loadStats(): void {
    this.http.get<PlatformStats>(`${CONFIG.URL_BASE}/api/super-admin/stats`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({ next: (s) => { this.stats = s; }, error: () => {} });
  }

  loadTenants(): void {
    this.loading = true;
    this.http.get<Tenant[]>(`${CONFIG.URL_BASE}/api/super-admin/tenants`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.loading = false;
        tenants.forEach((t) => { this.maxUsersInput[t.tenantCode] = t.maxUsers || '10'; });
      },
      error: () => { this.errorMessage = 'Could not load tenants.'; this.loading = false; },
    });
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.http.get<PlatformUser[]>(`${CONFIG.URL_BASE}/api/super-admin/users`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (users) => { this.platformUsers = users; this.usersLoading = false; },
      error: () => { this.usersLoading = false; },
    });
  }

  loadPlans(): void {
    this.plansLoading = true;
    this.http.get<SaasPlan[]>(`${CONFIG.URL_BASE}/api/super-admin/plans`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (plans) => { this.saasPlan = plans; this.plansLoading = false; },
      error: () => { this.plansLoading = false; },
    });
  }

  loadFeatures(): void {
    this.featuresLoading = true;
    this.http.get<FeatureFlag[]>(`${CONFIG.URL_BASE}/api/super-admin/features`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (flags) => { this.featureFlags = flags; this.featuresLoading = false; },
      error: () => { this.featuresLoading = false; },
    });
  }

  // â”€â”€ Tenant actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  openCreateTenant(): void {
    this.editingTenant = null;
    this.tenantForm = { currency: 'USD', timezone: 'UTC', language: 'en', billingCycle: 'MONTHLY' };
    this.showTenantModal = true;
  }

  openEditTenant(tenant: Tenant): void { this.editingTenant = tenant; this.tenantForm = { ...tenant }; this.showTenantModal = true; }
  closeTenantModal(): void { this.showTenantModal = false; this.editingTenant = null; this.tenantForm = {}; }

  saveTenant(): void {
    this.saving = true;
    const isEdit = !!this.editingTenant;
    const url = isEdit
      ? `${CONFIG.URL_BASE}/api/super-admin/tenants/${this.editingTenant!.tenantCode}`
      : `${CONFIG.URL_BASE}/api/super-admin/tenants`;
    const req = isEdit
      ? this.http.put<Tenant>(url, this.tenantForm, { headers: this.authService.getAuthHeaders(true) })
      : this.http.post<Tenant>(url, this.tenantForm, { headers: this.authService.getAuthHeaders(true) });
    req.subscribe({
      next: (t) => {
        if (isEdit) { this.updateTenantInList(t); } else { this.tenants = [t, ...this.tenants]; }
        this.saving = false; this.closeTenantModal(); this.flash(isEdit ? 'Tenant updated.' : 'Tenant created.', false); this.loadStats();
      },
      error: () => { this.saving = false; this.flash('Could not save tenant.', true); },
    });
  }

  suspend(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/suspend`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} suspended.`, false); this.loadStats(); },
      error: () => { this.flash('Could not suspend tenant.', true); },
    });
  }

  activate(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/activate`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} activated.`, false); this.loadStats(); },
      error: () => { this.flash('Could not activate tenant.', true); },
    });
  }

  archiveTenant(code: string): void {
    if (!confirm(`Archive tenant ${code}?`)) { return; }
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/archive`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} archived.`, false); this.loadStats(); },
      error: () => { this.flash('Could not archive.', true); },
    });
  }

  restoreTenant(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/restore`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} restored.`, false); this.loadStats(); },
      error: () => { this.flash('Could not restore.', true); },
    });
  }

  changePlan(code: string, plan: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/plan`, { plan }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} plan changed to ${plan}.`, false); this.loadStats(); },
      error: () => { this.flash('Could not update plan.', true); },
    });
  }

  extendTrial(code: string): void {
    const days = Number(this.trialDays) || 14;
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/trial`, { days }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`Trial extended by ${days}d for ${code}.`, false); },
      error: () => { this.flash('Could not extend trial.', true); },
    });
  }

  startTrial(code: string): void {
    const days = Number(this.trialDays) || 14;
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/start-trial`, { days }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`Trial started for ${code}.`, false); this.loadStats(); },
      error: () => { this.flash('Could not start trial.', true); },
    });
  }

  convertTrial(code: string, plan: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/convert-trial`, { plan }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} converted to ${plan}.`, false); this.loadStats(); },
      error: () => { this.flash('Could not convert trial.', true); },
    });
  }

  pauseSubscription(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/pause`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} paused.`, false); this.loadStats(); },
      error: () => { this.flash('Could not pause.', true); },
    });
  }

  resumeSubscription(code: string): void {
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/resume`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`${code} resumed.`, false); this.loadStats(); },
      error: () => { this.flash('Could not resume.', true); },
    });
  }

  setMaxUsers(code: string): void {
    const maxUsers = this.maxUsersInput[code] || '10';
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/max-users`, { maxUsers }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`Max users for ${code} set to ${maxUsers}.`, false); },
      error: () => { this.flash('Could not update max users.', true); },
    });
  }

  cancelSubscription(code: string): void {
    if (!confirm(`Cancel subscription for ${code}? This downgrades them to FREE.`)) { return; }
    this.http.put<Tenant>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}/cancel-subscription`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (t) => { this.updateTenantInList(t); this.flash(`Subscription cancelled for ${code}.`, false); this.loadStats(); },
      error: () => { this.flash('Could not cancel subscription.', true); },
    });
  }

  viewBilling(tenant: Tenant): void {
    this.selectedTenant = tenant;
    this.billingLoading = true;
    this.billingDetail = null;
    this.http.get<any>(`${CONFIG.URL_BASE}/api/super-admin/tenants/${tenant.tenantCode}/billing`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (d) => { this.billingDetail = d; this.billingLoading = false; },
      error: () => { this.billingLoading = false; },
    });
  }

  closeBillingPanel(): void { this.selectedTenant = null; this.billingDetail = null; }

  deleteTenant(code: string): void {
    if (!confirm(`Permanently delete tenant ${code}? This cannot be undone.`)) { return; }
    this.http.delete(`${CONFIG.URL_BASE}/api/super-admin/tenants/${code}`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: () => { this.tenants = this.tenants.filter((t) => t.tenantCode !== code); this.flash(`${code} deleted.`, false); this.loadStats(); },
      error: () => { this.flash('Could not delete tenant.', true); },
    });
  }

  toggleUser(userId: number): void {
    this.http.put<{ id: number; active: boolean }>(`${CONFIG.URL_BASE}/api/super-admin/users/${userId}/toggle`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (r) => { const u = this.platformUsers.find(x => x.id === r.id); if (u) { u.active = r.active; } },
      error: () => { this.flash('Could not toggle user.', true); },
    });
  }

  // â”€â”€ Plan actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  openCreatePlan(): void {
    this.editingPlan = null;
    this.planForm = { currency: 'USD', trialDays: 14, minUsers: 1, maxUsers: 25, maxEmployees: 100, maxStorageMb: 5120, apiLimitPerMonth: 50000, sortOrder: 0, enabled: true, hidden: false, popular: false, publicPlan: true };
    this.showPlanModal = true;
  }

  openEditPlan(plan: SaasPlan): void { this.editingPlan = plan; this.planForm = { ...plan }; this.showPlanModal = true; }
  closePlanModal(): void { this.showPlanModal = false; this.editingPlan = null; this.planForm = {}; }

  savePlan(): void {
    this.saving = true;
    const isEdit = !!this.editingPlan;
    const url = isEdit ? `${CONFIG.URL_BASE}/api/super-admin/plans/${this.editingPlan!.id}` : `${CONFIG.URL_BASE}/api/super-admin/plans`;
    const req = isEdit
      ? this.http.put<SaasPlan>(url, this.planForm, { headers: this.authService.getAuthHeaders(true) })
      : this.http.post<SaasPlan>(url, this.planForm, { headers: this.authService.getAuthHeaders(true) });
    req.subscribe({
      next: (p) => {
        if (isEdit) { const idx = this.saasPlan.findIndex(x => x.id === p.id); if (idx >= 0) { this.saasPlan[idx] = p; } }
        else { this.saasPlan = [...this.saasPlan, p]; }
        this.saving = false; this.closePlanModal(); this.flash(isEdit ? 'Plan updated.' : 'Plan created.', false);
      },
      error: () => { this.saving = false; this.flash('Could not save plan.', true); },
    });
  }

  togglePlanEnabled(plan: SaasPlan): void {
    this.http.put<SaasPlan>(`${CONFIG.URL_BASE}/api/super-admin/plans/${plan.id}/toggle-enabled`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (p) => { const idx = this.saasPlan.findIndex(x => x.id === p.id); if (idx >= 0) { this.saasPlan[idx] = p; } },
      error: () => { this.flash('Could not toggle plan.', true); },
    });
  }

  togglePlanHidden(plan: SaasPlan): void {
    this.http.put<SaasPlan>(`${CONFIG.URL_BASE}/api/super-admin/plans/${plan.id}/toggle-hidden`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (p) => { const idx = this.saasPlan.findIndex(x => x.id === p.id); if (idx >= 0) { this.saasPlan[idx] = p; } },
      error: () => { this.flash('Could not toggle plan.', true); },
    });
  }

  togglePlanPopular(plan: SaasPlan): void {
    this.http.put<SaasPlan>(`${CONFIG.URL_BASE}/api/super-admin/plans/${plan.id}/toggle-popular`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (p) => { const idx = this.saasPlan.findIndex(x => x.id === p.id); if (idx >= 0) { this.saasPlan[idx] = p; } },
      error: () => { this.flash('Could not toggle plan.', true); },
    });
  }

  deletePlan(id: number): void {
    if (!confirm('Delete this plan?')) { return; }
    this.http.delete(`${CONFIG.URL_BASE}/api/super-admin/plans/${id}`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: () => { this.saasPlan = this.saasPlan.filter(p => p.id !== id); this.flash('Plan deleted.', false); },
      error: () => { this.flash('Could not delete plan.', true); },
    });
  }

  planFeaturesArray(plan: SaasPlan): string[] {
    return plan.features ? plan.features.split(',').map(f => f.trim()).filter(Boolean) : [];
  }

  // â”€â”€ Feature flag actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  openCreateFeature(): void {
    this.editingFeature = null;
    this.featureForm = { enabledGlobally: false, betaFeature: false, rolloutPercent: 0, enabledForPlans: '', enabledForTenants: '' };
    this.showFeatureModal = true;
  }

  openEditFeature(flag: FeatureFlag): void { this.editingFeature = flag; this.featureForm = { ...flag }; this.showFeatureModal = true; }
  closeFeatureModal(): void { this.showFeatureModal = false; this.editingFeature = null; this.featureForm = {}; }

  saveFeature(): void {
    this.saving = true;
    const isEdit = !!this.editingFeature;
    const url = isEdit ? `${CONFIG.URL_BASE}/api/super-admin/features/${this.editingFeature!.id}` : `${CONFIG.URL_BASE}/api/super-admin/features`;
    const req = isEdit
      ? this.http.put<FeatureFlag>(url, this.featureForm, { headers: this.authService.getAuthHeaders(true) })
      : this.http.post<FeatureFlag>(url, this.featureForm, { headers: this.authService.getAuthHeaders(true) });
    req.subscribe({
      next: (f) => {
        if (isEdit) { const idx = this.featureFlags.findIndex(x => x.id === f.id); if (idx >= 0) { this.featureFlags[idx] = f; } }
        else { this.featureFlags = [...this.featureFlags, f]; }
        this.saving = false; this.closeFeatureModal(); this.flash(isEdit ? 'Feature updated.' : 'Feature created.', false);
      },
      error: () => { this.saving = false; this.flash('Could not save feature.', true); },
    });
  }

  toggleGlobal(flag: FeatureFlag): void {
    this.http.put<FeatureFlag>(`${CONFIG.URL_BASE}/api/super-admin/features/${flag.id}/toggle-global`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (f) => { const idx = this.featureFlags.findIndex(x => x.id === f.id); if (idx >= 0) { this.featureFlags[idx] = f; } },
      error: () => { this.flash('Could not toggle feature.', true); },
    });
  }

  toggleFlagForPlan(flag: FeatureFlag, planKey: string, enable: boolean): void {
    this.http.put<FeatureFlag>(`${CONFIG.URL_BASE}/api/super-admin/features/${flag.id}/plan-toggle`,
      { planKey, enable }, { headers: this.authService.getAuthHeaders(true) }).subscribe({
      next: (f) => { const idx = this.featureFlags.findIndex(x => x.id === f.id); if (idx >= 0) { this.featureFlags[idx] = f; } },
      error: () => { this.flash('Could not toggle plan flag.', true); },
    });
  }

  isFlagForPlan(flag: FeatureFlag, planKey: string): boolean {
    return flag.enabledForPlans ? flag.enabledForPlans.split(',').map(p => p.trim()).includes(planKey) : false;
  }

  deleteFeature(id: number): void {
    if (!confirm('Delete this feature flag?')) { return; }
    this.http.delete(`${CONFIG.URL_BASE}/api/super-admin/features/${id}`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: () => { this.featureFlags = this.featureFlags.filter(f => f.id !== id); this.flash('Feature deleted.', false); },
      error: () => { this.flash('Could not delete feature.', true); },
    });
  }

  // ── Billing & Payments ─────────────────────────────────────────────────────

  loadBillingStats(): void {
    this.http.get<BillingStats>(`${CONFIG.URL_BASE}/api/super-admin/invoices/billing-stats`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({ next: (s) => { this.billingStats = s; }, error: () => {} });
  }

  loadInvoices(): void {
    this.billingLoading2 = true;
    this.http.get<Invoice[]>(`${CONFIG.URL_BASE}/api/super-admin/invoices`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (inv) => { this.invoices = inv; this.billingLoading2 = false; },
      error: () => { this.billingLoading2 = false; },
    });
  }

  loadPayments(): void {
    this.paymentsLoading = true;
    this.http.get<Payment[]>(`${CONFIG.URL_BASE}/api/super-admin/payments`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (p) => { this.payments = p; this.paymentsLoading = false; },
      error: () => { this.paymentsLoading = false; },
    });
  }

  openGenerateInvoice(): void {
    this.invoiceForm = { currency: 'USD', amountCents: 0, taxAmountCents: 0, description: 'Subscription' };
    this.showInvoiceModal = true;
  }

  closeInvoiceModal(): void { this.showInvoiceModal = false; this.invoiceForm = {}; }

  generateInvoice(): void {
    this.saving = true;
    const payload = {
      tenantCode: (this.invoiceForm as any).tenantCodeInput || '',
      companyName: (this.invoiceForm as any).tenantCodeInput || '',
      amountCents: this.invoiceForm.amountCents || 0,
      taxAmountCents: this.invoiceForm.taxAmountCents || 0,
      description: this.invoiceForm.description || 'Subscription',
      currency: this.invoiceForm.currency || 'USD',
    };
    this.http.post<Invoice>(`${CONFIG.URL_BASE}/api/super-admin/invoices/generate`, payload, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (inv) => { this.invoices = [inv, ...this.invoices]; this.saving = false; this.closeInvoiceModal(); this.flash('Invoice generated.', false); this.loadBillingStats(); },
      error: () => { this.saving = false; this.flash('Could not generate invoice.', true); },
    });
  }

  invoiceAction(inv: Invoice, action: 'send' | 'mark-paid' | 'void' | 'refund'): void {
    this.http.put<Invoice>(`${CONFIG.URL_BASE}/api/super-admin/invoices/${inv.id}/${action}`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (updated) => { const idx = this.invoices.findIndex(i => i.id === updated.id); if (idx >= 0) { this.invoices[idx] = updated; } this.flash(`Invoice ${action}.`, false); this.loadBillingStats(); },
      error: () => { this.flash(`Could not ${action} invoice.`, true); },
    });
  }

  retryPayment(p: Payment): void {
    this.http.put<Payment>(`${CONFIG.URL_BASE}/api/super-admin/payments/${p.id}/retry`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (updated) => { const idx = this.payments.findIndex(x => x.id === updated.id); if (idx >= 0) { this.payments[idx] = updated; } this.flash('Payment retried.', false); },
      error: () => { this.flash('Could not retry payment.', true); },
    });
  }

  refundPayment(p: Payment): void {
    const amount = (this.refundForm[p.id] || 0) * 100;
    this.http.put<Payment>(`${CONFIG.URL_BASE}/api/super-admin/payments/${p.id}/refund`, { amountCents: amount }, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (updated) => { const idx = this.payments.findIndex(x => x.id === updated.id); if (idx >= 0) { this.payments[idx] = updated; } this.flash('Refund processed.', false); this.loadBillingStats(); },
      error: () => { this.flash('Could not refund payment.', true); },
    });
  }

  // ── Customer 360° ──────────────────────────────────────────────────────────

  loadCustomer360(code: string): void {
    this.customer360Loading = true;
    this.customer360 = null;
    this.http.get<Customer360>(`${CONFIG.URL_BASE}/api/super-admin/customer360/${code}`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (c) => { this.customer360 = c; this.customer360Loading = false; this.setSection('customer360'); },
      error: () => { this.customer360Loading = false; this.flash('Tenant not found.', true); },
    });
  }

  healthClass(score: string): string {
    const map: { [k: string]: string } = {
      'Healthy': 'health-healthy', 'At Risk': 'health-risk',
      'Churning': 'health-churning', 'Archived': 'health-archived',
    };
    return map[score] || 'health-healthy';
  }

  // ── Platform users ─────────────────────────────────────────────────────────

  openCreatePlatformUser(): void {
    this.platformUserForm = { username: '', displayName: '', password: '', role: 'ADMIN' };
    this.showPlatformUserModal = true;
  }

  closePlatformUserModal(): void { this.showPlatformUserModal = false; }

  createPlatformUser(): void {
    this.saving = true;
    this.http.post<any>(`${CONFIG.URL_BASE}/api/super-admin/users`, this.platformUserForm, {
      headers: this.authService.getAuthHeaders(true),
    }).subscribe({
      next: (u) => { this.platformUsers = [u, ...this.platformUsers]; this.saving = false; this.closePlatformUserModal(); this.flash('User created.', false); },
      error: (err) => { this.saving = false; this.flash(err?.error?.error || 'Could not create user.', true); },
    });
  }

  deletePlatformUser(userId: number): void {
    if (!confirm('Delete this user permanently?')) { return; }
    this.http.delete(`${CONFIG.URL_BASE}/api/super-admin/users/${userId}`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: () => { this.platformUsers = this.platformUsers.filter(u => u.id !== userId); this.flash('User deleted.', false); },
      error: () => { this.flash('Could not delete user.', true); },
    });
  }

  // ── Platform roles ─────────────────────────────────────────────────────────

  loadRoles(): void {
    this.rolesLoading = true;
    this.http.get<PlatformRole[]>(`${CONFIG.URL_BASE}/api/super-admin/platform-roles`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (r) => { this.platformRoles = r; this.rolesLoading = false; },
      error: () => { this.rolesLoading = false; },
    });
  }

  openCreateRole(): void {
    this.editingRole = null;
    this.roleForm = { active: true, systemRole: false, permissions: '' };
    this.showRoleModal = true;
  }

  openEditRole(role: PlatformRole): void { this.editingRole = role; this.roleForm = { ...role }; this.showRoleModal = true; }
  closeRoleModal(): void { this.showRoleModal = false; this.editingRole = null; this.roleForm = {}; }

  saveRole(): void {
    this.saving = true;
    const isEdit = !!this.editingRole;
    const url = isEdit ? `${CONFIG.URL_BASE}/api/super-admin/platform-roles/${this.editingRole!.id}` : `${CONFIG.URL_BASE}/api/super-admin/platform-roles`;
    const req = isEdit
      ? this.http.put<PlatformRole>(url, this.roleForm, { headers: this.authService.getAuthHeaders(true) })
      : this.http.post<PlatformRole>(url, this.roleForm, { headers: this.authService.getAuthHeaders(true) });
    req.subscribe({
      next: (r) => {
        if (isEdit) { const idx = this.platformRoles.findIndex(x => x.id === r.id); if (idx >= 0) { this.platformRoles[idx] = r; } }
        else { this.platformRoles = [...this.platformRoles, r]; }
        this.saving = false; this.closeRoleModal(); this.flash(isEdit ? 'Role updated.' : 'Role created.', false);
      },
      error: () => { this.saving = false; this.flash('Could not save role.', true); },
    });
  }

  toggleRolePermission(perm: string): void {
    const current = (this.roleForm.permissions || '').split(',').map(p => p.trim()).filter(Boolean);
    const idx = current.indexOf(perm);
    if (idx >= 0) { current.splice(idx, 1); } else { current.push(perm); }
    this.roleForm = { ...this.roleForm, permissions: current.join(',') };
  }

  hasRoleFormPermission(perm: string): boolean {
    return (this.roleForm.permissions || '').split(',').map(p => p.trim()).includes(perm);
  }

  toggleRoleActive(role: PlatformRole): void {
    this.http.put<PlatformRole>(`${CONFIG.URL_BASE}/api/super-admin/platform-roles/${role.id}/toggle-active`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (r) => { const idx = this.platformRoles.findIndex(x => x.id === r.id); if (idx >= 0) { this.platformRoles[idx] = r; } },
      error: () => { this.flash('Could not toggle role.', true); },
    });
  }

  deleteRole(id: number): void {
    if (!confirm('Delete this role?')) { return; }
    this.http.delete(`${CONFIG.URL_BASE}/api/super-admin/platform-roles/${id}`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: () => { this.platformRoles = this.platformRoles.filter(r => r.id !== id); this.flash('Role deleted.', false); },
      error: (err) => { this.flash(err?.error?.error || 'Could not delete role.', true); },
    });
  }

  hasPermission(role: PlatformRole, perm: string): boolean {
    return role.permissions ? role.permissions.split(',').map(p => p.trim()).includes(perm) : false;
  }

  // ── Integrations ──────────────────────────────────────────────────────────

  loadIntegrations(): void {
    this.integrationsLoading = true;
    this.http.get<Integration[]>(`${CONFIG.URL_BASE}/api/super-admin/integrations`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (list) => { this.integrations = list; this.integrationsLoading = false; },
      error: () => { this.integrationsLoading = false; },
    });
  }

  toggleIntegration(integ: Integration, enable: boolean): void {
    const url = `${CONFIG.URL_BASE}/api/super-admin/integrations/${integ.id}/${enable ? 'enable' : 'disable'}`;
    this.http.put<Integration>(url, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (updated) => { this.replaceIntegration(updated); this.flash(`${integ.name} ${enable ? 'enabled' : 'disabled'}.`, false); },
      error: () => { this.flash('Could not toggle integration.', true); },
    });
  }

  openCredentials(integ: Integration): void {
    this.editingIntegration = integ;
    this.credentialsForm = { credentialsJson: integ.configJson || '{}', configJson: integ.configJson || '{}' };
    this.showCredentialsModal = true;
  }

  closeCredentialsModal(): void { this.showCredentialsModal = false; this.editingIntegration = null; }

  saveCredentials(): void {
    if (!this.editingIntegration) { return; }
    this.saving = true;
    this.http.put<Integration>(`${CONFIG.URL_BASE}/api/super-admin/integrations/${this.editingIntegration.id}/credentials`,
      this.credentialsForm, { headers: this.authService.getAuthHeaders(true) }).subscribe({
      next: (updated) => { this.replaceIntegration(updated); this.saving = false; this.closeCredentialsModal(); this.flash('Credentials saved.', false); },
      error: () => { this.saving = false; this.flash('Could not save credentials.', true); },
    });
  }

  testConnection(integ: Integration): void {
    this.http.post<{ result: string }>(`${CONFIG.URL_BASE}/api/super-admin/integrations/${integ.id}/test`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (r) => { this.flash(`${integ.name}: Connection ${r.result === 'OK' ? 'successful ✓' : 'failed ✗'}`, r.result !== 'OK'); this.loadIntegrations(); },
      error: () => { this.flash('Test failed.', true); },
    });
  }

  syncIntegration(integ: Integration): void {
    this.http.post<Integration>(`${CONFIG.URL_BASE}/api/super-admin/integrations/${integ.id}/sync`, {}, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (updated) => { this.replaceIntegration(updated); this.flash(`${integ.name} synced.`, false); },
      error: () => { this.flash('Sync failed.', true); },
    });
  }

  loadLogs(integ: Integration): void {
    this.http.get<{ logs: string }>(`${CONFIG.URL_BASE}/api/super-admin/integrations/${integ.id}/logs`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (r) => { this.integrationLogs[integ.id] = r.logs; },
      error: () => {},
    });
  }

  private replaceIntegration(updated: Integration): void {
    const idx = this.integrations.findIndex(i => i.id === updated.id);
    if (idx >= 0) { this.integrations[idx] = updated; }
  }

  // ── SaaS Analytics ────────────────────────────────────────────────────────

  loadAnalytics(): void {
    this.analyticsLoading = true;
    this.http.get<AnalyticsData>(`${CONFIG.URL_BASE}/api/super-admin/analytics`, {
      headers: this.authService.getAuthHeaders(),
    }).subscribe({
      next: (data) => { this.analyticsData = data; this.analyticsLoading = false; },
      error: () => { this.analyticsLoading = false; },
    });
  }

  revenueByPlanList(): Array<{ plan: string; cents: number; pct: number; color: string }> {
    if (!this.analyticsData) { return []; }
    const r = this.analyticsData.revenue.revenueByPlan;
    const total = Object.values(r).reduce((a, b) => a + b, 0);
    const colors: { [k: string]: string } = { STARTER: '#3b82f6', PROFESSIONAL: '#8b5cf6', ENTERPRISE: '#f59e0b' };
    return Object.entries(r).filter(([, v]) => v > 0).map(([plan, cents]) => ({
      plan, cents, color: colors[plan] || '#9ca3af',
      pct: total > 0 ? Math.round((cents / total) * 100) : 0,
    }));
  }

  revenueByCountryList(): Array<{ country: string; cents: number }> {
    if (!this.analyticsData) { return []; }
    return Object.entries(this.analyticsData.revenue.revenueByCountry)
      .map(([country, cents]) => ({ country, cents }))
      .sort((a, b) => b.cents - a.cents)
      .slice(0, 8);
  }

  trendBarHeight(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 80) : 4;
  }

  get trendMaxRevenue(): number {
    if (!this.analyticsData) { return 1; }
    return Math.max(...this.analyticsData.monthlyTrend.map(m => m.revenueCents), 1);
  }

  get trendMaxTenants(): number {
    if (!this.analyticsData) { return 1; }
    return Math.max(...this.analyticsData.monthlyTrend.map(m => m.totalTenants), 1);
  }

  private updateTenantInList(updated: Tenant): void {
    const idx = this.tenants.findIndex((t) => t.tenantCode === updated.tenantCode);
    if (idx >= 0) { this.tenants[idx] = updated; }
    if (this.selectedTenant?.tenantCode === updated.tenantCode) { this.selectedTenant = updated; }
    this.maxUsersInput[updated.tenantCode] = updated.maxUsers || '10';
  }

  private flash(msg: string, isError: boolean): void {
    if (isError) { this.errorMessage = msg; this.successMessage = ''; }
    else { this.successMessage = msg; this.errorMessage = ''; }
    setTimeout(() => { this.successMessage = ''; this.errorMessage = ''; }, 4000);
  }

  formatMrr(cents: number): string {
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  formatStorage(mb: number): string {
    if (!mb) { return '0 MB'; }
    if (mb >= 1024) { return (mb / 1024).toFixed(1) + ' GB'; }
    return mb + ' MB';
  }

  planClass(plan: string): string {
    const map: { [k: string]: string } = { FREE: 'badge-free', STARTER: 'badge-starter', PROFESSIONAL: 'badge-pro', ENTERPRISE: 'badge-ent' };
    return map[plan] || 'badge-free';
  }

  statusClass(status: string): string {
    const map: { [k: string]: string } = { ACTIVE: 'sa-active', TRIAL: 'sa-trial', SUSPENDED: 'sa-suspended', CANCELLED: 'sa-cancelled', PENDING: 'sa-pending', ARCHIVED: 'sa-archived' };
    return map[status] || '';
  }

  get activeCount(): number    { return this.tenants.filter((t) => t.status === 'ACTIVE').length; }
  get suspendedCount(): number { return this.tenants.filter((t) => t.status === 'SUSPENDED').length; }
  get paidCount(): number      { return this.tenants.filter((t) => t.plan !== 'FREE').length; }
  get trialCount(): number     { return this.tenants.filter((t) => t.status === 'TRIAL').length; }

  get revenueBreakdown(): Array<{ plan: string; count: number; unitCents: number; totalCents: number; color: string }> {
    if (!this.stats) { return []; }
    return [
      { plan: 'Starter',      count: this.stats.byPlan?.STARTER      || 0, unitCents: 2900,  totalCents: (this.stats.byPlan?.STARTER      || 0) * 2900,  color: '#3b82f6' },
      { plan: 'Professional', count: this.stats.byPlan?.PROFESSIONAL || 0, unitCents: 7900,  totalCents: (this.stats.byPlan?.PROFESSIONAL || 0) * 7900,  color: '#8b5cf6' },
      { plan: 'Enterprise',   count: this.stats.byPlan?.ENTERPRISE   || 0, unitCents: 19900, totalCents: (this.stats.byPlan?.ENTERPRISE   || 0) * 19900, color: '#f59e0b' },
    ].filter(r => r.count > 0);
  }

  get activeUsersCount(): number { return this.platformUsers.filter(u => u.active).length; }

  getTenantByCode(code: string): Tenant | undefined {
    return this.tenants.find(t => t.tenantCode === code);
  }

  formatPermLabel(perm: string): string {
    return perm.split('_').join(' ');
  }
}
