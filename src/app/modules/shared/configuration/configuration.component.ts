import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import { ThemeDensity, ThemeGraphStyle, ThemePreferences, ThemePreferencesService, ThemeSurfaceStyle } from 'src/app/main/services/theme-preferences.service';
import CONFIG from 'src/app/main/urls/urls';

interface CompanyRecord {
  id?: number;
  code: string;
  name: string;
  email: string;
  address: string;
  currency: string;
  timezone: string;
  active: boolean;
  defaultCompany: boolean;
}

interface RoleAccessPolicyRecord {
  id?: number;
  roleName: string;
  allowedRoutePrefixes: string;
  canViewSensitiveData: boolean;
  canManageUsers: boolean;
  canManageConfiguration: boolean;
  canManageCompanies: boolean;
  canViewAuditLogs: boolean;
  defaultLandingRoute: string;
  updatedAt?: string;
}

interface AccessModuleOption {
  label: string;
  prefix: string;
}

interface ThemePresetOption {
  id: string;
  label: string;
  summary: string;
  preferences: ThemePreferences;
}

interface AuditLogRecord {
  id?: number;
  actorUsername: string;
  actorRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  summary: string;
  details: string;
  requestPath: string;
  companyCode: string;
  createdAt: string;
}

interface WorkspaceConfigurationState {
  id?: number;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  defaultCompany?: CompanyRecord | null;
  language: string;
  currency: string;
  timezone: string;
  payrollCutoffDay: string;
  approvalMode: string;
  payslipSignature: string;
  notificationMode: string;
  autoLeaveBalanceEnabled: boolean;
  autoPayrollEnabled: boolean;
  customApprovalFlowsEnabled: boolean;
  ruleBasedTriggersEnabled: boolean;
  reminderWindowDays: string;
  passwordMinLength: string;
  sessionTimeoutMinutes: string;
  allowRememberMe: boolean;
  approvalStages: string;
  updatedAt?: string;
}

interface LeaveBalanceSummary {
  employeeId: number | null;
  employeeName: string;
  leaveTypeId: number | null;
  leaveTypeName: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  usagePercent: number;
  status: string;
}

interface AutomationReminder {
  reminderType: string;
  employeeId: number | null;
  employeeName: string;
  title: string;
  subject: string;
  dueDate: string;
  daysRemaining: number;
  severity: string;
  route: string;
}

interface CustomFieldDefinition {
  id?: number;
  label: string;
  fieldKey: string;
  targetModule: string;
  fieldType: string;
  required: boolean;
  active: boolean;
  placeholderText: string;
  optionsCsv: string;
}

interface ApprovalFlowDefinition {
  id?: number;
  name: string;
  targetModule: string;
  stageSequence: string;
  description: string;
  active: boolean;
}

interface WorkflowRuleDefinition {
  id?: number;
  name: string;
  targetModule: string;
  triggerEvent: string;
  conditionExpression: string;
  actionExpression: string;
  description: string;
  active: boolean;
}

interface PolicyRecord {
  id?: number;
  title: string;
  description: string;
  effectiveDate: string;
  expiryDate: string;
  documentPath: string;
}

interface LeaveTypeRecord {
  id?: number;
  name: string;
  days: string;
}

interface PayrollRunRequest {
  cycleMonth: string;
  generatePayslips: boolean;
  overwriteExisting: boolean;
}

interface PayrollRunResponse {
  cycleMonth: string;
  generatedOn: string;
  createdPayrollCount: number;
  updatedPayrollCount: number;
  createdPaySlipCount: number;
  updatedPaySlipCount: number;
  skippedEmployees: number;
  employeesProcessed: number;
  totalGrossPay: number;
  totalNetPay: number;
  warnings: string[];
}

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent extends URLLoader implements OnInit {
  private readonly storageKey = 'humant.workspace.configuration';
  private readonly accessPolicyStorageKey = 'humant.workspace.accessPolicies';
  readonly moduleOptions = ['Employee', 'Leave', 'Payroll', 'Contract', 'Visa', 'Expense', 'Resignation'];
  readonly approvalModuleOptions = ['Leave', 'Expense', 'Resignation', 'Payroll'];
  readonly fieldTypeOptions = ['Text', 'Textarea', 'Number', 'Date', 'Select', 'Checkbox'];
  readonly triggerEventOptions = [
    'On create',
    'On update',
    'Before approval',
    'After approval',
    '7 days before expiry',
    '30 days before expiry',
  ];
  readonly accessPolicyRoles = ['ADMIN', 'HR', 'MANAGER', 'RECRUITER', 'EMPLOYEE'];
  readonly adminLandingRouteOptions = ['/dashboard', '/job', '/profile'];
  readonly themeSurfaceOptions: ThemeSurfaceStyle[] = ['glass', 'solid'];
  readonly themeDensityOptions: ThemeDensity[] = ['comfortable', 'compact'];
  readonly themeGraphStyleOptions: ThemeGraphStyle[] = ['soft', 'vivid'];
  readonly themePresets: ThemePresetOption[] = [
    {
      id: 'corporate-blue',
      label: 'Corporate Blue',
      summary: 'Balanced enterprise palette with glass surfaces.',
      preferences: {
        primaryColor: '#1c4e80',
        accentColor: '#1d7874',
        surfaceStyle: 'glass',
        density: 'comfortable',
        reducedMotion: false,
        highContrast: false,
        graphStyle: 'soft',
      },
    },
    {
      id: 'emerald-operations',
      label: 'Emerald Ops',
      summary: 'Fresh operations look with vivid graph accents.',
      preferences: {
        primaryColor: '#137a6a',
        accentColor: '#2f9e44',
        surfaceStyle: 'glass',
        density: 'comfortable',
        reducedMotion: false,
        highContrast: false,
        graphStyle: 'vivid',
      },
    },
    {
      id: 'sunset-admin',
      label: 'Sunset Admin',
      summary: 'Warm contrast for admin control rooms.',
      preferences: {
        primaryColor: '#b45309',
        accentColor: '#be123c',
        surfaceStyle: 'solid',
        density: 'comfortable',
        reducedMotion: false,
        highContrast: false,
        graphStyle: 'vivid',
      },
    },
    {
      id: 'mono-focus',
      label: 'Monochrome Focus',
      summary: 'High-clarity grayscale mode with compact spacing.',
      preferences: {
        primaryColor: '#334155',
        accentColor: '#0f172a',
        surfaceStyle: 'solid',
        density: 'compact',
        reducedMotion: true,
        highContrast: true,
        graphStyle: 'soft',
      },
    },
  ];
  readonly accessModuleOptions: AccessModuleOption[] = [
    { label: 'Executive Dashboard', prefix: '/dashboard' },
    { label: 'People & Structure', prefix: '/employee' },
    { label: 'Onboarding', prefix: '/onboarding' },
    { label: 'Documents', prefix: '/document' },
    { label: 'Users', prefix: '/user' },
    { label: 'Departments', prefix: '/departement' },
    { label: 'Designations', prefix: '/designation' },
    { label: 'Education Levels', prefix: '/education-level' },
    { label: 'Contracts', prefix: '/contract' },
    { label: 'Contract Types', prefix: '/contract-type' },
    { label: 'Jobs', prefix: '/job' },
    { label: 'Candidates', prefix: '/candidate' },
    { label: 'Interviews', prefix: '/interview' },
    { label: 'Offer Letters', prefix: '/offer-letter' },
    { label: 'Recruitment Pipeline', prefix: '/pipeline' },
    { label: 'Training', prefix: '/training' },
    { label: 'Performance', prefix: '/performance' },
    { label: 'Training Types', prefix: '/training-type' },
    { label: 'Awards', prefix: '/award' },
    { label: 'Award Types', prefix: '/award-type' },
    { label: 'Announcements', prefix: '/announcement' },
    { label: 'Communications', prefix: '/communication' },
    { label: 'Events', prefix: '/event' },
    { label: 'Launch Plans', prefix: '/launch-plan' },
    { label: 'Attendance', prefix: '/attendance' },
    { label: 'Leave', prefix: '/leave' },
    { label: 'Leave Types', prefix: '/leave-type' },
    { label: 'Holiday', prefix: '/holiday' },
    { label: 'Transfers', prefix: '/transfert' },
    { label: 'Notice', prefix: '/notice' },
    { label: 'Salary', prefix: '/salary' },
    { label: 'Pay Slips', prefix: '/pay-slip' },
    { label: 'Expenses', prefix: '/expense' },
    { label: 'Loans', prefix: '/loan' },
    { label: 'Advance Salary', prefix: '/advance' },
    { label: 'Resignations', prefix: '/resignation' },
    { label: 'Terminations', prefix: '/termination' },
    { label: 'Warnings', prefix: '/warning' },
    { label: 'Configuration', prefix: '/configuration' },
    { label: 'Profile', prefix: '/profile' },
  ];
  readonly isAdminUser: boolean;

  loading = false;
  saving = false;
  payrollRunning = false;
  submitted = false;
  loadError = '';
  lastSavedAt = '';

  configurationId: number = null;

  payrollRunResult: PayrollRunResponse = null;
  leaveBalances: LeaveBalanceSummary[] = [];
  reminders: AutomationReminder[] = [];
  customFields: CustomFieldDefinition[] = [];
  approvalFlows: ApprovalFlowDefinition[] = [];
  workflowRules: WorkflowRuleDefinition[] = [];
  policies: PolicyRecord[] = [];
  leaveTypes: LeaveTypeRecord[] = [];
  companies: CompanyRecord[] = [];
  accessPolicies: RoleAccessPolicyRecord[] = [];
  auditLogs: AuditLogRecord[] = [];

  customFieldMode: EditorMode = 'create';
  approvalFlowMode: EditorMode = 'create';
  workflowRuleMode: EditorMode = 'create';
  policyMode: EditorMode = 'create';
  leaveTypeMode: EditorMode = 'create';
  companyMode: EditorMode = 'create';

  activeCustomFieldId: number = null;
  activeApprovalFlowId: number = null;
  activeWorkflowRuleId: number = null;
  activePolicyId: number = null;
  activeLeaveTypeId: number = null;
  activeCompanyId: number = null;
  activeAccessPolicyRole = 'ADMIN';

  readonly configurationForm: FormGroup;
  readonly payrollRunForm: FormGroup;
  readonly customFieldForm: FormGroup;
  readonly approvalFlowForm: FormGroup;
  readonly workflowRuleForm: FormGroup;
  readonly policyForm: FormGroup;
  readonly leaveTypeForm: FormGroup;
  readonly companyForm: FormGroup;
  readonly accessPolicyForm: FormGroup;
  readonly themeForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HTTPService,
    private authentificationService: AuthentificationService,
    private themePreferencesService: ThemePreferencesService
  ) {
    super();
    this.isAdminUser = this.authentificationService.hasRole('ADMIN');
    this.configurationForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.maxLength(120)]],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyAddress: ['', [Validators.required, Validators.maxLength(200)]],
      defaultCompanyId: [''],
      language: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      timezone: ['', [Validators.required]],
      payrollCutoffDay: ['', [Validators.required]],
      approvalMode: ['', [Validators.required]],
      payslipSignature: ['', [Validators.required, Validators.maxLength(120)]],
      notificationMode: ['', [Validators.required]],
      autoLeaveBalanceEnabled: [true],
      autoPayrollEnabled: [true],
      customApprovalFlowsEnabled: [true],
      ruleBasedTriggersEnabled: [true],
      reminderWindowDays: ['30', [Validators.required]],
      passwordMinLength: ['8', [Validators.required]],
      sessionTimeoutMinutes: ['480', [Validators.required]],
      allowRememberMe: [true],
      approvalStages: ['', [Validators.required, Validators.maxLength(240)]],
    });
    this.payrollRunForm = this.formBuilder.group({
      cycleMonth: [this.buildCurrentCycleMonth(), [Validators.required]],
      generatePayslips: [true],
      overwriteExisting: [true],
    });
    this.customFieldForm = this.formBuilder.group({
      label: ['', [Validators.required, Validators.maxLength(120)]],
      fieldKey: ['', [Validators.maxLength(120)]],
      targetModule: ['', [Validators.required]],
      fieldType: ['', [Validators.required]],
      required: [false],
      active: [true],
      placeholderText: ['', [Validators.maxLength(120)]],
      optionsCsv: ['', [Validators.maxLength(500)]],
    });
    this.approvalFlowForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      targetModule: ['', [Validators.required]],
      stageSequence: ['', [Validators.required, Validators.maxLength(240)]],
      description: ['', [Validators.maxLength(500)]],
      active: [true],
    });
    this.workflowRuleForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      targetModule: ['', [Validators.required]],
      triggerEvent: ['', [Validators.required]],
      conditionExpression: ['', [Validators.maxLength(240)]],
      actionExpression: ['', [Validators.required, Validators.maxLength(240)]],
      description: ['', [Validators.maxLength(500)]],
      active: [true],
    });
    this.policyForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(160)]],
      description: ['', [Validators.maxLength(5000)]],
      effectiveDate: ['', [Validators.required]],
      expiryDate: [''],
      documentPath: ['', [Validators.maxLength(240)]],
    });
    this.leaveTypeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      days: ['', [Validators.required]],
    });
    this.companyForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.maxLength(80)]],
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.email]],
      address: ['', [Validators.maxLength(200)]],
      currency: ['USD', [Validators.required]],
      timezone: ['UTC', [Validators.required]],
      active: [true],
      defaultCompany: [false],
    });
    this.accessPolicyForm = this.formBuilder.group({
      roleName: ['ADMIN', [Validators.required]],
      allowedRoutePrefixes: ['', [Validators.required, Validators.maxLength(2400)]],
      canViewSensitiveData: [true],
      canManageUsers: [false],
      canManageConfiguration: [false],
      canManageCompanies: [false],
      canViewAuditLogs: [false],
      defaultLandingRoute: ['/dashboard', [Validators.required]],
    });
    this.themeForm = this.formBuilder.group({
      primaryColor: ['#1c4e80', [Validators.required]],
      accentColor: ['#1d7874', [Validators.required]],
      surfaceStyle: ['glass', [Validators.required]],
      density: ['comfortable', [Validators.required]],
      reducedMotion: [false],
      highContrast: [false],
      graphStyle: ['soft', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadThemePreferences();
    this.loadWorkspace();
    super.loadScripts();
  }

  get readinessScore(): number {
    const values = this.configurationForm.value;
    const scoredValues = [
      this.normalizeText(values.companyName),
      this.normalizeText(values.companyEmail),
      this.normalizeText(values.companyAddress),
      this.normalizeText(values.language),
      this.normalizeText(values.currency),
      this.normalizeText(values.timezone),
      this.normalizeText(values.payrollCutoffDay),
      this.normalizeText(values.approvalMode),
      this.normalizeText(values.payslipSignature),
      this.normalizeText(values.notificationMode),
      this.normalizeText(values.reminderWindowDays),
      this.normalizeText(values.approvalStages),
      values.autoLeaveBalanceEnabled ? 'configured' : '',
      values.autoPayrollEnabled ? 'configured' : '',
      values.customApprovalFlowsEnabled ? 'configured' : '',
      values.ruleBasedTriggersEnabled ? 'configured' : '',
    ];
    const completed = scoredValues.filter((value) => value.length > 0).length;
    return Math.round((completed / scoredValues.length) * 100);
  }

  get readinessLabel(): string {
    if (this.readinessScore >= 90) {
      return 'Ready';
    }
    if (this.readinessScore >= 70) {
      return 'In progress';
    }
    return 'Needs setup';
  }

  get languageCurrencySummary(): string {
    const values = this.configurationForm.value;
    return [this.normalizeText(values.language), this.normalizeText(values.currency)]
      .filter((value) => value.length > 0)
      .join(' / ');
  }

  get operatingSummary(): string {
    const values = this.configurationForm.value;
    return [
      'Cutoff day ' + (this.normalizeText(values.payrollCutoffDay) || '--'),
      this.normalizeText(values.approvalMode) || 'Approval mode pending',
    ].join(' • ');
  }

  get configurationInitials(): string {
    const companyName = this.normalizeText(this.configurationForm.value.companyName);
    const tokens = companyName.split(/\s+/).filter((value) => value.length > 0);

    if (!tokens.length) {
      return 'HR';
    }

    return tokens
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  }

  get remindersCount(): number {
    return this.reminders.length;
  }

  get urgentRemindersCount(): number {
    return this.reminders.filter((item) => this.isUrgentSeverity(item.severity)).length;
  }

  get atRiskLeaveBalancesCount(): number {
    return this.leaveBalances.filter((item) => item.status !== 'Healthy').length;
  }

  get automationAssetCount(): number {
    return this.customFields.filter((item) => item.active).length
      + this.approvalFlows.filter((item) => item.active).length
      + this.workflowRules.filter((item) => item.active).length;
  }

  get companyCount(): number {
    return this.companies.length;
  }

  get activeCompanyCount(): number {
    return this.companies.filter((item) => item.active).length;
  }

  get companySubmitLabel(): string {
    return this.companyMode === 'edit' ? 'Update company' : 'Add company';
  }

  get selectedAccessPolicy(): RoleAccessPolicyRecord | null {
    return this.accessPolicies.find((item) => item.roleName === this.accessPolicyForm.value.roleName) || null;
  }

  get selectedAccessRoutePrefixes(): string[] {
    return this.parseRoutePrefixes(this.accessPolicyForm.value.allowedRoutePrefixes);
  }

  get activeThemePresetId(): string {
    const currentPreferences = this.buildThemePreferencesPayload();
    const activePreset = this.themePresets.find((preset) =>
      this.areThemePreferencesEqual(preset.preferences, currentPreferences)
    );

    return activePreset ? activePreset.id : '';
  }

  get topReminders(): AutomationReminder[] {
    return this.reminders.slice(0, 6);
  }

  get topLeaveBalances(): LeaveBalanceSummary[] {
    return this.leaveBalances.slice(0, 8);
  }

  get customFieldSubmitLabel(): string {
    return this.customFieldMode === 'edit' ? 'Update field' : 'Add field';
  }

  get themePreviewPreferences(): ThemePreferences {
    return this.buildThemePreferencesPayload();
  }

  get approvalFlowSubmitLabel(): string {
    return this.approvalFlowMode === 'edit' ? 'Update flow' : 'Add flow';
  }

  get workflowRuleSubmitLabel(): string {
    return this.workflowRuleMode === 'edit' ? 'Update rule' : 'Add rule';
  }

  get policySubmitLabel(): string {
    return this.policyMode === 'edit' ? 'Update policy' : 'Add policy';
  }

  get leaveTypeSubmitLabel(): string {
    return this.leaveTypeMode === 'edit' ? 'Update leave type' : 'Add leave type';
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  saveThemePreferences(): void {
    if (this.themeForm.invalid) {
      this.themeForm.markAllAsTouched();
      return;
    }

    const saved = this.themePreferencesService.save(this.buildThemePreferencesPayload());
    this.themeForm.patchValue(saved, { emitEvent: false });
    super.show('Confirmation', 'Theme and graphical options updated.', 'success');
  }

  resetThemePreferences(): void {
    const defaults = this.themePreferencesService.getDefaults();
    this.themeForm.reset(defaults);
    this.themePreferencesService.save(defaults);
    super.show('Confirmation', 'Theme preferences reset to default.', 'success');
  }

  applyThemePreset(preset: ThemePresetOption): void {
    if (!preset) {
      return;
    }

    this.themeForm.patchValue(preset.preferences, { emitEvent: false });
    this.themePreferencesService.save(this.buildThemePreferencesPayload());
    super.show('Confirmation', preset.label + ' preset applied.', 'success');
  }

  trackByThemePreset(index: number, preset: ThemePresetOption): string {
    return preset.id || String(index);
  }

  async saveConfiguration(): Promise<void> {
    this.submitted = true;

    if (this.configurationForm.invalid) {
      this.configurationForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      const payload = this.buildConfigurationPayload();
      const saved = await this.httpService.putWithResponse<WorkspaceConfigurationState>(
        CONFIG.URL_BASE + '/api/workspace-configuration',
        payload
      );

      this.applyConfiguration(saved || payload);
      this.persistLocalConfiguration(saved || payload);
      super.show('Confirmation', 'Configuration saved successfully.', 'success');
      this.refreshAutomationData();
    } catch (error) {
      const fallbackPayload = {
        ...this.buildConfigurationPayload(),
        updatedAt: new Date().toISOString(),
      };
      this.applyConfiguration(fallbackPayload);
      this.persistLocalConfiguration(fallbackPayload);
      super.show('Warning', 'Configuration was stored locally because the backend request failed.', 'warning');
    } finally {
      this.saving = false;
    }
  }

  resetConfiguration(): void {
    this.submitted = false;
    const defaults = this.buildDefaultConfiguration();
    this.applyConfiguration(defaults);
  }

  async runPayroll(): Promise<void> {
    if (this.payrollRunForm.invalid) {
      this.payrollRunForm.markAllAsTouched();
      return;
    }

    this.payrollRunning = true;

    try {
      const payload: PayrollRunRequest = {
        cycleMonth: this.normalizeText(this.payrollRunForm.value.cycleMonth),
        generatePayslips: Boolean(this.payrollRunForm.value.generatePayslips),
        overwriteExisting: Boolean(this.payrollRunForm.value.overwriteExisting),
      };
      this.payrollRunResult = this.normalizePayrollRunResult(
        await this.httpService.postWithResponse<PayrollRunResponse>(
          CONFIG.URL_BASE + '/api/payrolls/run',
          payload
        )
      );
      super.show('Confirmation', 'Payroll generation completed successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Payroll generation could not be completed.', 'error');
    } finally {
      this.payrollRunning = false;
    }
  }

  editCustomField(item: CustomFieldDefinition): void {
    this.customFieldMode = 'edit';
    this.activeCustomFieldId = item.id || null;
    this.customFieldForm.reset({
      label: item.label,
      fieldKey: item.fieldKey,
      targetModule: item.targetModule,
      fieldType: item.fieldType,
      required: item.required,
      active: item.active,
      placeholderText: item.placeholderText,
      optionsCsv: item.optionsCsv,
    });
  }

  resetCustomFieldEditor(): void {
    this.customFieldMode = 'create';
    this.activeCustomFieldId = null;
    this.customFieldForm.reset({
      label: '',
      fieldKey: '',
      targetModule: '',
      fieldType: '',
      required: false,
      active: true,
      placeholderText: '',
      optionsCsv: '',
    });
  }

  async saveCustomField(): Promise<void> {
    if (this.customFieldForm.invalid) {
      this.customFieldForm.markAllAsTouched();
      return;
    }

    const payload = this.buildCustomFieldPayload();

    try {
      const saved = this.customFieldMode === 'edit' && this.activeCustomFieldId !== null
        ? await this.httpService.putWithResponse<CustomFieldDefinition>(
            CONFIG.URL_BASE + '/api/custom-fields/' + this.activeCustomFieldId,
            payload
          )
        : await this.httpService.postWithResponse<CustomFieldDefinition>(
            CONFIG.URL_BASE + '/api/custom-fields',
            payload
          );

      this.customFields = this.sortCustomFields(this.upsertItem(this.customFields, saved));
      this.resetCustomFieldEditor();
      super.show('Confirmation', 'Custom field saved successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Custom field could not be saved.', 'error');
    }
  }

  async deleteCustomField(item: CustomFieldDefinition): Promise<void> {
    if (!item.id || !window.confirm('Delete this custom field?')) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/custom-fields/' + item.id);
      this.customFields = this.customFields.filter((entry) => entry.id !== item.id);
      this.resetCustomFieldEditor();
      super.show('Confirmation', 'Custom field deleted successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Custom field could not be deleted.', 'error');
    }
  }

  editApprovalFlow(item: ApprovalFlowDefinition): void {
    this.approvalFlowMode = 'edit';
    this.activeApprovalFlowId = item.id || null;
    this.approvalFlowForm.reset({
      name: item.name,
      targetModule: item.targetModule,
      stageSequence: item.stageSequence,
      description: item.description,
      active: item.active,
    });
  }

  resetApprovalFlowEditor(): void {
    this.approvalFlowMode = 'create';
    this.activeApprovalFlowId = null;
    this.approvalFlowForm.reset({
      name: '',
      targetModule: '',
      stageSequence: '',
      description: '',
      active: true,
    });
  }

  async saveApprovalFlow(): Promise<void> {
    if (this.approvalFlowForm.invalid) {
      this.approvalFlowForm.markAllAsTouched();
      return;
    }

    const payload = this.buildApprovalFlowPayload();

    try {
      const saved = this.approvalFlowMode === 'edit' && this.activeApprovalFlowId !== null
        ? await this.httpService.putWithResponse<ApprovalFlowDefinition>(
            CONFIG.URL_BASE + '/api/approval-flows/' + this.activeApprovalFlowId,
            payload
          )
        : await this.httpService.postWithResponse<ApprovalFlowDefinition>(
            CONFIG.URL_BASE + '/api/approval-flows',
            payload
          );

      this.approvalFlows = this.sortApprovalFlows(this.upsertItem(this.approvalFlows, saved));
      this.resetApprovalFlowEditor();
      super.show('Confirmation', 'Approval flow saved successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Approval flow could not be saved.', 'error');
    }
  }

  async deleteApprovalFlow(item: ApprovalFlowDefinition): Promise<void> {
    if (!item.id || !window.confirm('Delete this approval flow?')) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/approval-flows/' + item.id);
      this.approvalFlows = this.approvalFlows.filter((entry) => entry.id !== item.id);
      this.resetApprovalFlowEditor();
      super.show('Confirmation', 'Approval flow deleted successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Approval flow could not be deleted.', 'error');
    }
  }

  editWorkflowRule(item: WorkflowRuleDefinition): void {
    this.workflowRuleMode = 'edit';
    this.activeWorkflowRuleId = item.id || null;
    this.workflowRuleForm.reset({
      name: item.name,
      targetModule: item.targetModule,
      triggerEvent: item.triggerEvent,
      conditionExpression: item.conditionExpression,
      actionExpression: item.actionExpression,
      description: item.description,
      active: item.active,
    });
  }

  resetWorkflowRuleEditor(): void {
    this.workflowRuleMode = 'create';
    this.activeWorkflowRuleId = null;
    this.workflowRuleForm.reset({
      name: '',
      targetModule: '',
      triggerEvent: '',
      conditionExpression: '',
      actionExpression: '',
      description: '',
      active: true,
    });
  }

  async saveWorkflowRule(): Promise<void> {
    if (this.workflowRuleForm.invalid) {
      this.workflowRuleForm.markAllAsTouched();
      return;
    }

    const payload = this.buildWorkflowRulePayload();

    try {
      const saved = this.workflowRuleMode === 'edit' && this.activeWorkflowRuleId !== null
        ? await this.httpService.putWithResponse<WorkflowRuleDefinition>(
            CONFIG.URL_BASE + '/api/workflow-rules/' + this.activeWorkflowRuleId,
            payload
          )
        : await this.httpService.postWithResponse<WorkflowRuleDefinition>(
            CONFIG.URL_BASE + '/api/workflow-rules',
            payload
          );

      this.workflowRules = this.sortWorkflowRules(this.upsertItem(this.workflowRules, saved));
      this.resetWorkflowRuleEditor();
      super.show('Confirmation', 'Workflow rule saved successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Workflow rule could not be saved.', 'error');
    }
  }

  async deleteWorkflowRule(item: WorkflowRuleDefinition): Promise<void> {
    if (!item.id || !window.confirm('Delete this workflow rule?')) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/workflow-rules/' + item.id);
      this.workflowRules = this.workflowRules.filter((entry) => entry.id !== item.id);
      this.resetWorkflowRuleEditor();
      super.show('Confirmation', 'Workflow rule deleted successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Workflow rule could not be deleted.', 'error');
    }
  }

  editPolicy(item: PolicyRecord): void {
    this.policyMode = 'edit';
    this.activePolicyId = item.id || null;
    this.policyForm.reset({
      title: item.title,
      description: item.description,
      effectiveDate: item.effectiveDate,
      expiryDate: item.expiryDate,
      documentPath: item.documentPath,
    });
  }

  resetPolicyEditor(): void {
    this.policyMode = 'create';
    this.activePolicyId = null;
    this.policyForm.reset({
      title: '',
      description: '',
      effectiveDate: '',
      expiryDate: '',
      documentPath: '',
    });
  }

  async savePolicy(): Promise<void> {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPolicyPayload();

    try {
      const saved = this.policyMode === 'edit' && this.activePolicyId !== null
        ? await this.httpService.putWithResponse<PolicyRecord>(
            CONFIG.URL_BASE + '/api/policies/' + this.activePolicyId,
            payload
          )
        : await this.httpService.postWithResponse<PolicyRecord>(CONFIG.URL_BASE + '/api/policies', payload);

      this.policies = this.sortPolicies(this.upsertItem(this.policies, saved));
      this.resetPolicyEditor();
      super.show('Confirmation', 'Policy saved successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Policy could not be saved.', 'error');
    }
  }

  async deletePolicy(item: PolicyRecord): Promise<void> {
    if (!item.id || !window.confirm('Delete this policy?')) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/policies/' + item.id);
      this.policies = this.policies.filter((entry) => entry.id !== item.id);
      this.resetPolicyEditor();
      super.show('Confirmation', 'Policy deleted successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Policy could not be deleted.', 'error');
    }
  }

  editLeaveType(item: LeaveTypeRecord): void {
    this.leaveTypeMode = 'edit';
    this.activeLeaveTypeId = item.id || null;
    this.leaveTypeForm.reset({
      name: item.name,
      days: item.days,
    });
  }

  resetLeaveTypeEditor(): void {
    this.leaveTypeMode = 'create';
    this.activeLeaveTypeId = null;
    this.leaveTypeForm.reset({
      name: '',
      days: '',
    });
  }

  async saveLeaveType(): Promise<void> {
    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      return;
    }

    const payload = this.buildLeaveTypePayload();

    try {
      const saved = this.leaveTypeMode === 'edit' && this.activeLeaveTypeId !== null
        ? await this.httpService.putWithResponse<LeaveTypeRecord>(
            CONFIG.URL_BASE + '/typeleave/update/' + this.activeLeaveTypeId,
            payload
          )
        : await this.httpService.postWithResponse<LeaveTypeRecord>(
            CONFIG.URL_BASE + '/typeleave/create',
            payload
          );

      this.leaveTypes = this.sortLeaveTypes(this.upsertItem(this.leaveTypes, this.normalizeLeaveType(saved)));
      this.resetLeaveTypeEditor();
      super.show('Confirmation', 'Leave type saved successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Leave type could not be saved.', 'error');
    }
  }

  async deleteLeaveType(item: LeaveTypeRecord): Promise<void> {
    if (!item.id || !window.confirm('Delete this leave type?')) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/typeleave/delete/' + item.id);
      this.leaveTypes = this.leaveTypes.filter((entry) => entry.id !== item.id);
      this.resetLeaveTypeEditor();
      super.show('Confirmation', 'Leave type deleted successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Leave type could not be deleted.', 'error');
    }
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

  trackById(index: number, item: { id?: number }): number {
    return item.id || index;
  }

  severityClass(severity: string): string {
    return 'severity-' + this.normalizeText(severity).toLowerCase();
  }

  statusClass(value: string): string {
    return 'status-' + this.normalizeText(value).toLowerCase().replace(/\s+/g, '-');
  }

  private loadWorkspace(showRefreshToast = false): void {
    this.loading = true;
    this.loadError = '';

    const localFallback = this.readLocalConfiguration();

    forkJoin({
      configuration: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/workspace-configuration')
        .pipe(catchError(() => of(localFallback))),
      leaveBalances: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/workspace-automation/leave-balances')
        .pipe(catchError(() => of([]))),
      reminders: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/workspace-automation/reminders')
        .pipe(catchError(() => of([]))),
      customFields: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/custom-fields')
        .pipe(catchError(() => of([]))),
      approvalFlows: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/approval-flows')
        .pipe(catchError(() => of([]))),
      workflowRules: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/workflow-rules')
        .pipe(catchError(() => of([]))),
      policies: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/policies')
        .pipe(catchError(() => of([]))),
      leaveTypes: this.httpService
        .getAll(CONFIG.URL_BASE + '/typeleave/all')
        .pipe(catchError(() => of([]))),
      companies: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/companies')
        .pipe(catchError(() => of([]))),
      accessPolicies: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/admin/access-policies')
        .pipe(catchError(() => of([]))),
      auditLogs: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/admin/audit-logs')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result) => {
          this.applyConfiguration(result.configuration as Partial<WorkspaceConfigurationState>);
          this.leaveBalances = this.normalizeLeaveBalances(result.leaveBalances);
          this.reminders = this.normalizeReminders(result.reminders);
          this.customFields = this.sortCustomFields(this.normalizeCustomFields(result.customFields));
          this.approvalFlows = this.sortApprovalFlows(this.normalizeApprovalFlows(result.approvalFlows));
          this.workflowRules = this.sortWorkflowRules(this.normalizeWorkflowRules(result.workflowRules));
          this.policies = this.sortPolicies(this.normalizePolicies(result.policies));
          this.leaveTypes = this.sortLeaveTypes(this.normalizeLeaveTypes(result.leaveTypes));
          this.companies = this.sortCompanies(this.normalizeCompanies(result.companies));
          this.accessPolicies = this.normalizeAccessPolicies(result.accessPolicies);
          this.auditLogs = this.normalizeAuditLogs(result.auditLogs);
          this.resetCustomFieldEditor();
          this.resetApprovalFlowEditor();
          this.resetWorkflowRuleEditor();
          this.resetPolicyEditor();
          this.resetLeaveTypeEditor();
          this.resetCompanyEditor();
          this.resetAccessPolicyEditor();

          if (showRefreshToast) {
            super.show('Confirmation', 'Configuration workspace refreshed.', 'success');
          }
        },
        error: () => {
          this.applyConfiguration(localFallback);
          this.leaveBalances = [];
          this.reminders = [];
          this.loadError = 'The automation workspace could not load from the backend. Local settings are still available.';
        },
      });
  }

  private refreshAutomationData(): void {
    forkJoin({
      leaveBalances: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/workspace-automation/leave-balances')
        .pipe(catchError(() => of([]))),
      reminders: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/workspace-automation/reminders')
        .pipe(catchError(() => of([]))),
    }).subscribe((result) => {
      this.leaveBalances = this.normalizeLeaveBalances(result.leaveBalances);
      this.reminders = this.normalizeReminders(result.reminders);
    });
  }

  private applyConfiguration(configuration: Partial<WorkspaceConfigurationState>): void {
    const normalized = this.normalizeConfigurationState(configuration);
    this.configurationId = normalized.id || null;
    this.configurationForm.reset({
      companyName: normalized.companyName,
      companyEmail: normalized.companyEmail,
      companyAddress: normalized.companyAddress,
      defaultCompanyId: normalized.defaultCompany && normalized.defaultCompany.id ? String(normalized.defaultCompany.id) : '',
      language: normalized.language,
      currency: normalized.currency,
      timezone: normalized.timezone,
      payrollCutoffDay: normalized.payrollCutoffDay,
      approvalMode: normalized.approvalMode,
      payslipSignature: normalized.payslipSignature,
      notificationMode: normalized.notificationMode,
      autoLeaveBalanceEnabled: normalized.autoLeaveBalanceEnabled,
      autoPayrollEnabled: normalized.autoPayrollEnabled,
      customApprovalFlowsEnabled: normalized.customApprovalFlowsEnabled,
      ruleBasedTriggersEnabled: normalized.ruleBasedTriggersEnabled,
      reminderWindowDays: normalized.reminderWindowDays,
      passwordMinLength: normalized.passwordMinLength,
      sessionTimeoutMinutes: normalized.sessionTimeoutMinutes,
      allowRememberMe: normalized.allowRememberMe,
      approvalStages: normalized.approvalStages,
    });
    this.lastSavedAt = normalized.updatedAt || '';
    this.persistLocalConfiguration(normalized);
  }

  private buildConfigurationPayload(): WorkspaceConfigurationState {
    const values = this.configurationForm.value;
    return {
      id: this.configurationId || undefined,
      companyName: this.normalizeText(values.companyName),
      companyEmail: this.normalizeText(values.companyEmail),
      companyAddress: this.normalizeText(values.companyAddress),
      defaultCompany: this.resolveCompanyById(values.defaultCompanyId),
      language: this.normalizeText(values.language),
      currency: this.normalizeText(values.currency),
      timezone: this.normalizeText(values.timezone),
      payrollCutoffDay: this.normalizeText(values.payrollCutoffDay),
      approvalMode: this.normalizeText(values.approvalMode),
      payslipSignature: this.normalizeText(values.payslipSignature),
      notificationMode: this.normalizeText(values.notificationMode),
      autoLeaveBalanceEnabled: Boolean(values.autoLeaveBalanceEnabled),
      autoPayrollEnabled: Boolean(values.autoPayrollEnabled),
      customApprovalFlowsEnabled: Boolean(values.customApprovalFlowsEnabled),
      ruleBasedTriggersEnabled: Boolean(values.ruleBasedTriggersEnabled),
      reminderWindowDays: this.normalizeText(values.reminderWindowDays),
      passwordMinLength: this.normalizeText(values.passwordMinLength),
      sessionTimeoutMinutes: this.normalizeText(values.sessionTimeoutMinutes),
      allowRememberMe: Boolean(values.allowRememberMe),
      approvalStages: this.normalizeText(values.approvalStages),
      updatedAt: new Date().toISOString(),
    };
  }

  editCompany(item: CompanyRecord): void {
    this.companyMode = 'edit';
    this.activeCompanyId = item.id || null;
    this.companyForm.reset({
      code: item.code,
      name: item.name,
      email: item.email,
      address: item.address,
      currency: item.currency,
      timezone: item.timezone,
      active: item.active,
      defaultCompany: item.defaultCompany,
    });
  }

  resetCompanyEditor(): void {
    this.companyMode = 'create';
    this.activeCompanyId = null;
    this.companyForm.reset({
      code: '',
      name: '',
      email: '',
      address: '',
      currency: this.configurationForm.value.currency || 'USD',
      timezone: this.configurationForm.value.timezone || 'UTC',
      active: true,
      defaultCompany: false,
    });
  }

  async saveCompany(): Promise<void> {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const payload = this.buildCompanyPayload();

    try {
      const saved = this.companyMode === 'edit' && this.activeCompanyId !== null
        ? await this.httpService.putWithResponse<CompanyRecord>(CONFIG.URL_BASE + '/api/companies/' + this.activeCompanyId, payload)
        : await this.httpService.postWithResponse<CompanyRecord>(CONFIG.URL_BASE + '/api/companies', payload);
      this.companies = this.sortCompanies(this.upsertItem(this.companies, this.normalizeCompany(saved)));
      if (saved && saved.defaultCompany) {
        this.configurationForm.patchValue({ defaultCompanyId: String(saved.id || '') });
      }
      this.resetCompanyEditor();
      super.show('Confirmation', 'Company saved successfully.', 'success');
    } catch (error) {
      super.show('Error', 'Company could not be saved.', 'error');
    }
  }

  editAccessPolicy(item: RoleAccessPolicyRecord): void {
    this.activeAccessPolicyRole = item.roleName;
    this.accessPolicyForm.reset({
      roleName: item.roleName,
      allowedRoutePrefixes: item.allowedRoutePrefixes,
      canViewSensitiveData: item.canViewSensitiveData,
      canManageUsers: item.canManageUsers,
      canManageConfiguration: item.canManageConfiguration,
      canManageCompanies: item.canManageCompanies,
      canViewAuditLogs: item.canViewAuditLogs,
      defaultLandingRoute: item.defaultLandingRoute,
    });
  }

  trackByModulePrefix(index: number, item: AccessModuleOption): string {
    return item.prefix || String(index);
  }

  isAccessPrefixEnabled(prefix: string): boolean {
    return this.selectedAccessRoutePrefixes.includes(prefix);
  }

  onAccessPrefixToggle(prefix: string, enabled: boolean): void {
    const current = this.selectedAccessRoutePrefixes;
    const next = enabled
      ? Array.from(new Set([...current, prefix]))
      : current.filter((value) => value !== prefix);

    this.updateAllowedRoutePrefixes(next);
  }

  grantAllModuleAccess(): void {
    this.updateAllowedRoutePrefixes(this.accessModuleOptions.map((item) => item.prefix));
  }

  revokeAllModuleAccess(): void {
    this.updateAllowedRoutePrefixes([]);
  }

  resetAccessPolicyEditor(): void {
    const defaultPolicy = this.accessPolicies.find((item) => item.roleName === this.activeAccessPolicyRole)
      || this.accessPolicies[0]
      || this.buildDefaultAccessPolicy('ADMIN');
    this.editAccessPolicy(defaultPolicy);
  }

  async saveAccessPolicy(): Promise<void> {
    if (this.accessPolicyForm.invalid) {
      this.accessPolicyForm.markAllAsTouched();
      return;
    }

    const payload = this.buildAccessPolicyPayload();

    try {
      const saved = await this.httpService.putWithResponse<RoleAccessPolicyRecord>(
        CONFIG.URL_BASE + '/api/admin/access-policies/' + payload.roleName,
        payload
      );
      this.accessPolicies = this.upsertItem(this.accessPolicies, this.normalizeAccessPolicy(saved));
      this.persistLocalAccessPolicies(this.accessPolicies);
      this.editAccessPolicy(this.normalizeAccessPolicy(saved));
      super.show('Confirmation', 'Access policy updated successfully.', 'success');
    } catch (error) {
      this.accessPolicies = this.upsertItem(this.accessPolicies, payload);
      this.persistLocalAccessPolicies(this.accessPolicies);
      this.editAccessPolicy(payload);
      super.show('Warning', 'Backend update failed. Policy changes were saved locally for route visibility.', 'warning');
    }
  }

  private buildCustomFieldPayload(): CustomFieldDefinition {
    const values = this.customFieldForm.value;
    const label = this.normalizeText(values.label);
    return {
      label,
      fieldKey: this.normalizeText(values.fieldKey) || this.buildFieldKey(label),
      targetModule: this.normalizeText(values.targetModule),
      fieldType: this.normalizeText(values.fieldType),
      required: Boolean(values.required),
      active: Boolean(values.active),
      placeholderText: this.normalizeText(values.placeholderText),
      optionsCsv: this.normalizeText(values.optionsCsv),
    };
  }

  private buildApprovalFlowPayload(): ApprovalFlowDefinition {
    const values = this.approvalFlowForm.value;
    return {
      name: this.normalizeText(values.name),
      targetModule: this.normalizeText(values.targetModule),
      stageSequence: this.normalizeText(values.stageSequence),
      description: this.normalizeText(values.description),
      active: Boolean(values.active),
    };
  }

  private buildWorkflowRulePayload(): WorkflowRuleDefinition {
    const values = this.workflowRuleForm.value;
    return {
      name: this.normalizeText(values.name),
      targetModule: this.normalizeText(values.targetModule),
      triggerEvent: this.normalizeText(values.triggerEvent),
      conditionExpression: this.normalizeText(values.conditionExpression),
      actionExpression: this.normalizeText(values.actionExpression),
      description: this.normalizeText(values.description),
      active: Boolean(values.active),
    };
  }

  private buildPolicyPayload(): PolicyRecord {
    const values = this.policyForm.value;
    return {
      title: this.normalizeText(values.title),
      description: this.normalizeText(values.description),
      effectiveDate: this.normalizeText(values.effectiveDate),
      expiryDate: this.normalizeText(values.expiryDate),
      documentPath: this.normalizeText(values.documentPath),
    };
  }

  private buildLeaveTypePayload(): LeaveTypeRecord {
    const values = this.leaveTypeForm.value;
    return {
      name: this.normalizeText(values.name),
      days: this.normalizeText(values.days),
    };
  }

  private normalizeConfigurationState(value: Partial<WorkspaceConfigurationState>): WorkspaceConfigurationState {
    const defaults = this.buildDefaultConfiguration();
    return {
      ...defaults,
      ...value,
      id: value && value.id ? Number(value.id) : defaults.id,
      companyName: this.normalizeText(value && value.companyName) || defaults.companyName,
      companyEmail: this.normalizeText(value && value.companyEmail) || defaults.companyEmail,
      companyAddress: this.normalizeText(value && value.companyAddress) || defaults.companyAddress,
      defaultCompany: value && value.defaultCompany ? this.normalizeCompany(value.defaultCompany) : defaults.defaultCompany,
      language: this.normalizeText(value && value.language) || defaults.language,
      currency: this.normalizeText(value && value.currency) || defaults.currency,
      timezone: this.normalizeText(value && value.timezone) || defaults.timezone,
      payrollCutoffDay: this.normalizeScalar(value && value.payrollCutoffDay, defaults.payrollCutoffDay),
      approvalMode: this.normalizeText(value && value.approvalMode) || defaults.approvalMode,
      payslipSignature: this.normalizeText(value && value.payslipSignature) || defaults.payslipSignature,
      notificationMode: this.normalizeText(value && value.notificationMode) || defaults.notificationMode,
      autoLeaveBalanceEnabled: this.normalizeBoolean(value && value.autoLeaveBalanceEnabled, true),
      autoPayrollEnabled: this.normalizeBoolean(value && value.autoPayrollEnabled, true),
      customApprovalFlowsEnabled: this.normalizeBoolean(value && value.customApprovalFlowsEnabled, true),
      ruleBasedTriggersEnabled: this.normalizeBoolean(value && value.ruleBasedTriggersEnabled, true),
      reminderWindowDays: this.normalizeScalar(value && value.reminderWindowDays, defaults.reminderWindowDays),
      passwordMinLength: this.normalizeScalar(value && value.passwordMinLength, defaults.passwordMinLength),
      sessionTimeoutMinutes: this.normalizeScalar(value && value.sessionTimeoutMinutes, defaults.sessionTimeoutMinutes),
      allowRememberMe: this.normalizeBoolean(value && value.allowRememberMe, true),
      approvalStages: this.normalizeText(value && value.approvalStages) || defaults.approvalStages,
      updatedAt: this.normalizeText(value && value.updatedAt) || defaults.updatedAt,
    };
  }

  private buildCompanyPayload(): CompanyRecord {
    const values = this.companyForm.value;
    return {
      code: this.normalizeText(values.code).toLowerCase(),
      name: this.normalizeText(values.name),
      email: this.normalizeText(values.email),
      address: this.normalizeText(values.address),
      currency: this.normalizeText(values.currency),
      timezone: this.normalizeText(values.timezone),
      active: Boolean(values.active),
      defaultCompany: Boolean(values.defaultCompany),
    };
  }

  private buildAccessPolicyPayload(): RoleAccessPolicyRecord {
    const values = this.accessPolicyForm.value;
    return {
      roleName: this.normalizeText(values.roleName),
      allowedRoutePrefixes: this.normalizeText(values.allowedRoutePrefixes),
      canViewSensitiveData: Boolean(values.canViewSensitiveData),
      canManageUsers: Boolean(values.canManageUsers),
      canManageConfiguration: Boolean(values.canManageConfiguration),
      canManageCompanies: Boolean(values.canManageCompanies),
      canViewAuditLogs: Boolean(values.canViewAuditLogs),
      defaultLandingRoute: this.normalizeText(values.defaultLandingRoute),
    };
  }

  private normalizeCompanies(value: unknown): CompanyRecord[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.normalizeCompany(item));
  }

  private normalizeCompany(value: Partial<CompanyRecord>): CompanyRecord {
    return {
      id: value && value.id ? Number(value.id) : undefined,
      code: this.normalizeText(value && value.code),
      name: this.normalizeText(value && value.name),
      email: this.normalizeText(value && value.email),
      address: this.normalizeText(value && value.address),
      currency: this.normalizeText(value && value.currency) || 'USD',
      timezone: this.normalizeText(value && value.timezone) || 'UTC',
      active: this.normalizeBoolean(value && value.active, true),
      defaultCompany: this.normalizeBoolean(value && value.defaultCompany, false),
    };
  }

  private normalizeAccessPolicies(value: unknown): RoleAccessPolicyRecord[] {
    if (!Array.isArray(value) || !value.length) {
      return this.readLocalAccessPolicies();
    }

    const normalized = value.map((item) => this.normalizeAccessPolicy(item));
    this.persistLocalAccessPolicies(normalized);
    return normalized;
  }

  private normalizeAccessPolicy(value: Partial<RoleAccessPolicyRecord>): RoleAccessPolicyRecord {
    return {
      id: value && value.id ? Number(value.id) : undefined,
      roleName: this.normalizeText(value && value.roleName) || 'EMPLOYEE',
      allowedRoutePrefixes: this.normalizeText(value && value.allowedRoutePrefixes),
      canViewSensitiveData: this.normalizeBoolean(value && value.canViewSensitiveData, false),
      canManageUsers: this.normalizeBoolean(value && value.canManageUsers, false),
      canManageConfiguration: this.normalizeBoolean(value && value.canManageConfiguration, false),
      canManageCompanies: this.normalizeBoolean(value && value.canManageCompanies, false),
      canViewAuditLogs: this.normalizeBoolean(value && value.canViewAuditLogs, false),
      defaultLandingRoute: this.normalizeText(value && value.defaultLandingRoute) || '/dashboard',
      updatedAt: this.normalizeText(value && value.updatedAt),
    };
  }

  private normalizeAuditLogs(value: unknown): AuditLogRecord[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      id: item && item.id ? Number(item.id) : undefined,
      actorUsername: this.normalizeText(item && item.actorUsername) || 'system',
      actorRole: this.normalizeText(item && item.actorRole) || 'SYSTEM',
      actionType: this.normalizeText(item && item.actionType) || 'UPDATE',
      targetType: this.normalizeText(item && item.targetType) || 'SYSTEM',
      targetId: this.normalizeText(item && item.targetId),
      summary: this.normalizeText(item && item.summary),
      details: this.normalizeText(item && item.details),
      requestPath: this.normalizeText(item && item.requestPath),
      companyCode: this.normalizeText(item && item.companyCode),
      createdAt: this.normalizeText(item && item.createdAt),
    }));
  }

  private normalizeLeaveBalances(value: unknown): LeaveBalanceSummary[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      employeeId: item && item.employeeId !== undefined ? Number(item.employeeId) : null,
      employeeName: this.normalizeText(item && item.employeeName) || 'Employee',
      leaveTypeId: item && item.leaveTypeId !== undefined ? Number(item.leaveTypeId) : null,
      leaveTypeName: this.normalizeText(item && item.leaveTypeName) || 'Leave type',
      allocatedDays: Number(item && item.allocatedDays) || 0,
      usedDays: Number(item && item.usedDays) || 0,
      remainingDays: Number(item && item.remainingDays) || 0,
      usagePercent: Number(item && item.usagePercent) || 0,
      status: this.normalizeText(item && item.status) || 'Healthy',
    }));
  }

  private normalizeReminders(value: unknown): AutomationReminder[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      reminderType: this.normalizeText(item && item.reminderType) || 'Reminder',
      employeeId: item && item.employeeId !== undefined ? Number(item.employeeId) : null,
      employeeName: this.normalizeText(item && item.employeeName) || 'Employee',
      title: this.normalizeText(item && item.title) || 'Reminder',
      subject: this.normalizeText(item && item.subject),
      dueDate: this.normalizeText(item && item.dueDate),
      daysRemaining: Number(item && item.daysRemaining) || 0,
      severity: this.normalizeText(item && item.severity) || 'Low',
      route: this.normalizeText(item && item.route),
    }));
  }

  private normalizeCustomFields(value: unknown): CustomFieldDefinition[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      id: item && item.id ? Number(item.id) : undefined,
      label: this.normalizeText(item && item.label),
      fieldKey: this.normalizeText(item && item.fieldKey),
      targetModule: this.normalizeText(item && item.targetModule),
      fieldType: this.normalizeText(item && item.fieldType),
      required: this.normalizeBoolean(item && item.required, false),
      active: this.normalizeBoolean(item && item.active, true),
      placeholderText: this.normalizeText(item && item.placeholderText),
      optionsCsv: this.normalizeText(item && item.optionsCsv),
    }));
  }

  private normalizeApprovalFlows(value: unknown): ApprovalFlowDefinition[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      id: item && item.id ? Number(item.id) : undefined,
      name: this.normalizeText(item && item.name),
      targetModule: this.normalizeText(item && item.targetModule),
      stageSequence: this.normalizeText(item && item.stageSequence),
      description: this.normalizeText(item && item.description),
      active: this.normalizeBoolean(item && item.active, true),
    }));
  }

  private normalizeWorkflowRules(value: unknown): WorkflowRuleDefinition[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      id: item && item.id ? Number(item.id) : undefined,
      name: this.normalizeText(item && item.name),
      targetModule: this.normalizeText(item && item.targetModule),
      triggerEvent: this.normalizeText(item && item.triggerEvent),
      conditionExpression: this.normalizeText(item && item.conditionExpression),
      actionExpression: this.normalizeText(item && item.actionExpression),
      description: this.normalizeText(item && item.description),
      active: this.normalizeBoolean(item && item.active, true),
    }));
  }

  private normalizePolicies(value: unknown): PolicyRecord[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => ({
      id: item && item.id ? Number(item.id) : undefined,
      title: this.normalizeText(item && item.title),
      description: this.normalizeText(item && item.description),
      effectiveDate: this.normalizeText(item && item.effectiveDate),
      expiryDate: this.normalizeText(item && item.expiryDate),
      documentPath: this.normalizeText(item && item.documentPath),
    }));
  }

  private normalizeLeaveTypes(value: unknown): LeaveTypeRecord[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.normalizeLeaveType(item));
  }

  private normalizeLeaveType(value: Partial<LeaveTypeRecord>): LeaveTypeRecord {
    return {
      id: value && value.id ? Number(value.id) : undefined,
      name: this.normalizeText(value && value.name),
      days: this.normalizeScalar(value && value.days, ''),
    };
  }

  private normalizePayrollRunResult(value: Partial<PayrollRunResponse>): PayrollRunResponse {
    return {
      cycleMonth: this.normalizeText(value && value.cycleMonth),
      generatedOn: this.normalizeText(value && value.generatedOn),
      createdPayrollCount: Number(value && value.createdPayrollCount) || 0,
      updatedPayrollCount: Number(value && value.updatedPayrollCount) || 0,
      createdPaySlipCount: Number(value && value.createdPaySlipCount) || 0,
      updatedPaySlipCount: Number(value && value.updatedPaySlipCount) || 0,
      skippedEmployees: Number(value && value.skippedEmployees) || 0,
      employeesProcessed: Number(value && value.employeesProcessed) || 0,
      totalGrossPay: Number(value && value.totalGrossPay) || 0,
      totalNetPay: Number(value && value.totalNetPay) || 0,
      warnings: Array.isArray(value && value.warnings) ? (value.warnings as string[]) : [],
    };
  }

  private buildDefaultConfiguration(): WorkspaceConfigurationState {
    return {
      companyName: 'Humant HR Workspace',
      companyEmail: 'operations@humant.local',
      companyAddress: 'Head office administration floor',
      defaultCompany: null,
      language: 'English',
      currency: 'USD',
      timezone: 'UTC',
      payrollCutoffDay: '25',
      approvalMode: 'Two-step review',
      payslipSignature: 'HR Operations Lead',
      notificationMode: 'Email and in-app alerts',
      autoLeaveBalanceEnabled: true,
      autoPayrollEnabled: true,
      customApprovalFlowsEnabled: true,
      ruleBasedTriggersEnabled: true,
      reminderWindowDays: '30',
      passwordMinLength: '8',
      sessionTimeoutMinutes: '480',
      allowRememberMe: true,
      approvalStages: 'Manager review -> HR approval',
      updatedAt: '',
    };
  }

  private buildDefaultAccessPolicy(roleName: string): RoleAccessPolicyRecord {
    return {
      roleName,
      allowedRoutePrefixes: '/dashboard',
      canViewSensitiveData: roleName === 'ADMIN' || roleName === 'HR',
      canManageUsers: roleName === 'ADMIN',
      canManageConfiguration: roleName === 'ADMIN' || roleName === 'HR',
      canManageCompanies: roleName === 'ADMIN',
      canViewAuditLogs: roleName === 'ADMIN',
      defaultLandingRoute: roleName === 'EMPLOYEE' ? '/profile' : roleName === 'RECRUITER' ? '/job' : '/dashboard',
    };
  }

  private sortCompanies(items: CompanyRecord[]): CompanyRecord[] {
    return [...items].sort((left, right) => Number(right.defaultCompany) - Number(left.defaultCompany) || (left.name || '').localeCompare(right.name || ''));
  }

  private resolveCompanyById(value: unknown): CompanyRecord | null {
    const normalizedId = Number(value);

    if (!Number.isFinite(normalizedId)) {
      return null;
    }

    return this.companies.find((item) => item.id === normalizedId) || null;
  }

  private readLocalConfiguration(): WorkspaceConfigurationState {
    const fallback = this.buildDefaultConfiguration();
    const storedValue = localStorage.getItem(this.storageKey);

    if (!storedValue) {
      return fallback;
    }

    try {
      return this.normalizeConfigurationState(JSON.parse(storedValue) as Partial<WorkspaceConfigurationState>);
    } catch (error) {
      return fallback;
    }
  }

  private persistLocalConfiguration(configuration: Partial<WorkspaceConfigurationState>): void {
    const normalized = this.normalizeConfigurationState(configuration);
    localStorage.setItem(this.storageKey, JSON.stringify(normalized));
  }

  private parseRoutePrefixes(value: string): string[] {
    return (value || '')
      .split(',')
      .map((item) => this.normalizeText(item))
      .filter((item) => item.length > 0)
      .filter((item, index, source) => source.indexOf(item) === index);
  }

  private updateAllowedRoutePrefixes(prefixes: string[]): void {
    const uniquePrefixes = prefixes
      .map((prefix) => this.normalizeText(prefix))
      .filter((prefix) => prefix.length > 0)
      .filter((prefix, index, source) => source.indexOf(prefix) === index);

    this.accessPolicyForm.patchValue({
      allowedRoutePrefixes: uniquePrefixes.join(','),
    });
  }

  private readLocalAccessPolicies(): RoleAccessPolicyRecord[] {
    const storedValue = localStorage.getItem(this.accessPolicyStorageKey);

    if (!storedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(storedValue);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item) => this.normalizeAccessPolicy(item));
    } catch (_error) {
      return [];
    }
  }

  private persistLocalAccessPolicies(items: RoleAccessPolicyRecord[]): void {
    localStorage.setItem(
      this.accessPolicyStorageKey,
      JSON.stringify((items || []).map((item) => this.normalizeAccessPolicy(item)))
    );
  }

  private loadThemePreferences(): void {
    const currentPreferences = this.themePreferencesService.initialize();
    this.themeForm.reset(currentPreferences, { emitEvent: false });
  }

  private buildThemePreferencesPayload(): ThemePreferences {
    const values = this.themeForm.value;

    return {
      primaryColor: this.normalizeHexColor(values.primaryColor, '#1c4e80'),
      accentColor: this.normalizeHexColor(values.accentColor, '#1d7874'),
      surfaceStyle: values.surfaceStyle === 'solid' ? 'solid' : 'glass',
      density: values.density === 'compact' ? 'compact' : 'comfortable',
      reducedMotion: Boolean(values.reducedMotion),
      highContrast: Boolean(values.highContrast),
      graphStyle: values.graphStyle === 'vivid' ? 'vivid' : 'soft',
    };
  }

  private normalizeHexColor(value: unknown, fallback: string): string {
    const normalized = this.normalizeText(value).toLowerCase();
    return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback;
  }

  private areThemePreferencesEqual(left: ThemePreferences, right: ThemePreferences): boolean {
    return left.primaryColor === right.primaryColor
      && left.accentColor === right.accentColor
      && left.surfaceStyle === right.surfaceStyle
      && left.density === right.density
      && left.reducedMotion === right.reducedMotion
      && left.highContrast === right.highContrast
      && left.graphStyle === right.graphStyle;
  }

  private sortCustomFields(items: CustomFieldDefinition[]): CustomFieldDefinition[] {
    return [...items].sort((left, right) =>
      (left.targetModule || '').localeCompare(right.targetModule || '') || (left.label || '').localeCompare(right.label || '')
    );
  }

  private sortApprovalFlows(items: ApprovalFlowDefinition[]): ApprovalFlowDefinition[] {
    return [...items].sort((left, right) =>
      (left.targetModule || '').localeCompare(right.targetModule || '') || (left.name || '').localeCompare(right.name || '')
    );
  }

  private sortWorkflowRules(items: WorkflowRuleDefinition[]): WorkflowRuleDefinition[] {
    return [...items].sort((left, right) =>
      (left.targetModule || '').localeCompare(right.targetModule || '') || (left.name || '').localeCompare(right.name || '')
    );
  }

  private sortPolicies(items: PolicyRecord[]): PolicyRecord[] {
    return [...items].sort((left, right) =>
      (right.effectiveDate || '').localeCompare(left.effectiveDate || '') || (left.title || '').localeCompare(right.title || '')
    );
  }

  private sortLeaveTypes(items: LeaveTypeRecord[]): LeaveTypeRecord[] {
    return [...items].sort((left, right) => (left.name || '').localeCompare(right.name || ''));
  }

  private upsertItem<T extends { id?: number }>(items: T[], item: T): T[] {
    if (!item) {
      return items;
    }

    if (!item.id) {
      return [...items, item];
    }

    const existingIndex = items.findIndex((entry) => entry.id === item.id);

    if (existingIndex === -1) {
      return [...items, item];
    }

    return items.map((entry) => (entry.id === item.id ? item : entry));
  }

  private buildFieldKey(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  private buildCurrentCycleMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return year + '-' + month;
  }

  private isUrgentSeverity(severity: string): boolean {
    const normalizedSeverity = this.normalizeText(severity).toLowerCase();
    return normalizedSeverity === 'critical' || normalizedSeverity === 'high';
  }

  private normalizeBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
  }

  private normalizeScalar(value: unknown, fallback: string): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    const normalized = String(value).trim();
    return normalized || fallback;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}
