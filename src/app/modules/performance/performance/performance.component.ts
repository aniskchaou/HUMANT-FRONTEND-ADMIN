import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AuthentificationService } from 'src/app/main/security/authentification.service';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

type Tone = 'strong' | 'medium' | 'warning' | 'critical';
type GoalEditorMode = 'create' | 'edit';
type ReviewEditorMode = 'create' | 'edit';
type FeedbackEditorMode = 'create' | 'edit';

interface EmployeeOption {
  id: number;
  name: string;
}

interface PerformanceGoalView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  title: string;
  objective: string;
  reviewCycle: string;
  kpiName: string;
  kpiTarget: number;
  kpiCurrentValue: number;
  kpiUnit: string;
  priority: string;
  status: string;
  dueDate: string;
  dueDateLabel: string;
  progress: number;
  progressBarWidth: number;
  targetLabel: string;
  currentLabel: string;
  notes: string;
  summary: string;
  tone: Tone;
}

interface PerformanceReviewView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  reviewerName: string;
  reviewDate: string;
  reviewDateLabel: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewWindowLabel: string;
  reviewCycle: string;
  goalTitle: string;
  objective: string;
  kpiName: string;
  kpiTarget: number;
  kpiActual: number;
  kpiTargetLabel: string;
  kpiActualLabel: string;
  status: string;
  rating: number;
  ratingLabel: string;
  feedback: string;
  strengths: string;
  improvementAreas: string;
  summary: string;
  tone: Tone;
}

interface PerformanceFeedbackView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  givenBy: string;
  givenAt: string;
  givenAtLabel: string;
  type: string;
  typeLabel: string;
  comment: string;
  summary: string;
  tone: Tone;
}

interface PerformanceHistoryView {
  id: string;
  kindLabel: string;
  employeeName: string;
  title: string;
  cycle: string;
  dateLabel: string;
  statusLabel: string;
  ratingLabel: string;
  detail: string;
  tone: Tone;
  sortKey: string;
}

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css'],
})
export class PerformanceComponent extends URLLoader implements OnInit {
  loading = false;
  savingGoal = false;
  savingReview = false;
  savingFeedback = false;
  goalSubmitted = false;
  reviewSubmitted = false;
  feedbackSubmitted = false;
  loadError = '';

  selectedCycleMonth = this.createInitialCycleMonth();
  selectedEmployeeFilter = 'all';

  goalEditorMode: GoalEditorMode = 'create';
  reviewEditorMode: ReviewEditorMode = 'create';
  feedbackEditorMode: FeedbackEditorMode = 'create';
  activeGoalId: number = null;
  activeReviewId: number = null;
  activeFeedbackId: number = null;

  employees: EmployeeOption[] = [];
  currentEmployee: EmployeeOption = null;
  goals: PerformanceGoalView[] = [];
  reviews: PerformanceReviewView[] = [];
  feedbackEntries: PerformanceFeedbackView[] = [];

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly goalPriorityOptions = ['High', 'Medium', 'Low'];
  readonly goalStatusOptions = ['On track', 'Needs focus', 'At risk', 'Completed'];
  readonly reviewStatusOptions = ['Draft', 'In review', 'Completed'];
  readonly ratingOptions = [1, 2, 3, 4, 5];
  readonly feedbackTypeOptions = [
    { value: 'POSITIVE', label: 'Positive' },
    { value: 'CONSTRUCTIVE', label: 'Constructive' },
    { value: 'NEUTRAL', label: 'Neutral' },
  ];

  readonly goalForm: FormGroup;
  readonly reviewForm: FormGroup;
  readonly feedbackForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService
  ) {
    super();
    this.goalForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(120)]],
      objective: ['', [Validators.required, Validators.maxLength(2000)]],
      kpiName: ['', [Validators.required, Validators.maxLength(120)]],
      kpiTarget: ['', [Validators.required]],
      kpiCurrentValue: [''],
      kpiUnit: ['', [Validators.maxLength(40)]],
      priority: ['Medium', [Validators.required]],
      status: ['On track', [Validators.required]],
      dueDate: [this.createToday(), [Validators.required]],
      notes: ['', [Validators.maxLength(1200)]],
    });
    this.reviewForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      reviewerName: ['', [Validators.required, Validators.maxLength(120)]],
      reviewDate: [this.createToday(), [Validators.required]],
      reviewPeriodStart: [this.createMonthStart(this.selectedCycleMonth), [Validators.required]],
      reviewPeriodEnd: [this.createToday(), [Validators.required]],
      goalTitle: ['', [Validators.required, Validators.maxLength(160)]],
      objective: ['', [Validators.required, Validators.maxLength(2000)]],
      kpiName: ['', [Validators.required, Validators.maxLength(120)]],
      kpiTarget: ['', [Validators.required]],
      kpiActual: [''],
      status: ['Completed', [Validators.required]],
      rating: ['3', [Validators.required, Validators.min(1), Validators.max(5)]],
      feedback: ['', [Validators.required, Validators.maxLength(2000)]],
      strengths: ['', [Validators.maxLength(1200)]],
      improvementAreas: ['', [Validators.maxLength(1200)]],
    });
    this.feedbackForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      givenBy: ['Manager', [Validators.required, Validators.maxLength(120)]],
      givenAt: [this.createDateTimeLocalValue(), [Validators.required]],
      type: ['POSITIVE', [Validators.required]],
      comment: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get canManagePerformance(): boolean {
    return this.authentificationService.hasAnyRole(['ADMIN', 'HR', 'MANAGER']);
  }

  get isEmployeeWorkspace(): boolean {
    return this.authentificationService.hasRole('EMPLOYEE') && !this.canManagePerformance;
  }

  get cycleLabel(): string {
    return this.formatCycleLabel(this.selectedCycleMonth);
  }

  get filteredGoals(): PerformanceGoalView[] {
    return this.goals.filter(
      (item) =>
        this.matchesEmployeeFilter(item.employeeId) &&
        this.matchesSelectedCycle(item.reviewCycle, item.dueDate)
    );
  }

  get filteredReviews(): PerformanceReviewView[] {
    return this.reviews.filter(
      (item) =>
        this.matchesEmployeeFilter(item.employeeId) &&
        this.matchesSelectedCycle(item.reviewCycle, item.reviewDate || item.reviewPeriodEnd)
    );
  }

  get filteredFeedback(): PerformanceFeedbackView[] {
    return this.feedbackEntries.filter(
      (item) =>
        this.matchesEmployeeFilter(item.employeeId) &&
        this.matchesSelectedCycle('', item.givenAt)
    );
  }

  get activeGoalsCount(): number {
    return this.filteredGoals.filter((item) => !this.isClosedStatus(item.status)).length;
  }

  get atRiskGoalsCount(): number {
    return this.filteredGoals.filter((item) => item.tone === 'critical' || item.tone === 'warning')
      .length;
  }

  get completedReviewsCount(): number {
    return this.filteredReviews.filter(
      (item) => this.normalizeText(item.status).toLowerCase() === 'completed'
    ).length;
  }

  get averageRating(): number {
    if (!this.filteredReviews.length) {
      return 0;
    }

    const total = this.filteredReviews.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((total / this.filteredReviews.length) * 10) / 10;
  }

  get averageRatingLabel(): string {
    return this.averageRating > 0 ? this.averageRating.toFixed(1) + '/5' : 'No ratings yet';
  }

  get feedbackMomentCount(): number {
    return this.filteredFeedback.length;
  }

  get goalEditorTitle(): string {
    return this.goalEditorMode === 'create' ? 'Create goal & KPI' : 'Edit goal & KPI';
  }

  get reviewEditorTitle(): string {
    return this.reviewEditorMode === 'create' ? 'Conduct review' : 'Edit review';
  }

  get feedbackEditorTitle(): string {
    return this.feedbackEditorMode === 'create' ? 'Log feedback' : 'Edit feedback';
  }

  get historyItems(): PerformanceHistoryView[] {
    return [
      ...this.filteredGoals.map((item) => ({
        id: 'goal-' + item.id,
        kindLabel: 'Goal',
        employeeName: item.employeeName,
        title: item.title,
        cycle: item.reviewCycle,
        dateLabel: item.dueDateLabel,
        statusLabel: item.status,
        ratingLabel: item.progress + '% complete',
        detail: item.summary,
        tone: item.tone,
        sortKey: item.dueDate || item.reviewCycle,
      })),
      ...this.filteredReviews.map((item) => ({
        id: 'review-' + item.id,
        kindLabel: 'Review',
        employeeName: item.employeeName,
        title: item.goalTitle,
        cycle: item.reviewCycle,
        dateLabel: item.reviewDateLabel,
        statusLabel: item.status,
        ratingLabel: item.ratingLabel,
        detail: item.summary,
        tone: item.tone,
        sortKey: item.reviewDate || item.reviewPeriodEnd || item.reviewCycle,
      })),
      ...this.filteredFeedback.map((item) => ({
        id: 'feedback-' + item.id,
        kindLabel: 'Feedback',
        employeeName: item.employeeName,
        title: item.typeLabel,
        cycle: this.formatCycleLabel(this.toMonthValue(item.givenAt)),
        dateLabel: item.givenAtLabel,
        statusLabel: item.typeLabel,
        ratingLabel: item.givenBy,
        detail: item.summary,
        tone: item.tone,
        sortKey: item.givenAt,
      })),
    ].sort(
      (left, right) =>
        right.sortKey.localeCompare(left.sortKey) || left.employeeName.localeCompare(right.employeeName)
    );
  }

  onCycleMonthChange(value: string): void {
    this.selectedCycleMonth = value || this.createInitialCycleMonth();

    if (this.reviewEditorMode === 'create') {
      this.reviewForm.patchValue({
        reviewPeriodStart: this.createMonthStart(this.selectedCycleMonth),
      });
    }
  }

  onEmployeeFilterChange(value: string): void {
    if (this.isEmployeeWorkspace) {
      return;
    }

    this.selectedEmployeeFilter = value || 'all';
  }

  refreshWorkspace(): void {
    this.loadWorkspace(true);
  }

  startGoalCreate(): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.goalEditorMode = 'create';
    this.activeGoalId = null;
    this.goalSubmitted = false;
    this.goalForm.reset({
      employeeId: '',
      title: '',
      objective: '',
      kpiName: '',
      kpiTarget: '',
      kpiCurrentValue: '',
      kpiUnit: '',
      priority: 'Medium',
      status: 'On track',
      dueDate: this.createToday(),
      notes: '',
    });
  }

  editGoal(item: PerformanceGoalView): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.goalEditorMode = 'edit';
    this.activeGoalId = item.id;
    this.goalSubmitted = false;
    this.goalForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      title: item.title,
      objective: item.objective,
      kpiName: item.kpiName,
      kpiTarget: item.kpiTarget ? String(item.kpiTarget) : '',
      kpiCurrentValue: item.kpiCurrentValue ? String(item.kpiCurrentValue) : '',
      kpiUnit: item.kpiUnit,
      priority: item.priority,
      status: item.status,
      dueDate: item.dueDate,
      notes: item.notes,
    });
  }

  startReviewCreate(): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.reviewEditorMode = 'create';
    this.activeReviewId = null;
    this.reviewSubmitted = false;
    this.reviewForm.reset({
      employeeId: '',
      reviewerName: '',
      reviewDate: this.createToday(),
      reviewPeriodStart: this.createMonthStart(this.selectedCycleMonth),
      reviewPeriodEnd: this.createToday(),
      goalTitle: '',
      objective: '',
      kpiName: '',
      kpiTarget: '',
      kpiActual: '',
      status: 'Completed',
      rating: '3',
      feedback: '',
      strengths: '',
      improvementAreas: '',
    });
  }

  editReview(item: PerformanceReviewView): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.reviewEditorMode = 'edit';
    this.activeReviewId = item.id;
    this.reviewSubmitted = false;
    this.reviewForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      reviewerName: item.reviewerName,
      reviewDate: item.reviewDate,
      reviewPeriodStart: item.reviewPeriodStart,
      reviewPeriodEnd: item.reviewPeriodEnd,
      goalTitle: item.goalTitle,
      objective: item.objective,
      kpiName: item.kpiName,
      kpiTarget: item.kpiTarget ? String(item.kpiTarget) : '',
      kpiActual: item.kpiActual ? String(item.kpiActual) : '',
      status: item.status,
      rating: String(item.rating || 3),
      feedback: item.feedback,
      strengths: item.strengths,
      improvementAreas: item.improvementAreas,
    });
  }

  startReviewFromGoal(item: PerformanceGoalView): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.startReviewCreate();
    this.reviewForm.patchValue({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      goalTitle: item.title,
      objective: item.objective,
      kpiName: item.kpiName,
      kpiTarget: item.kpiTarget ? String(item.kpiTarget) : '',
      kpiActual: item.kpiCurrentValue ? String(item.kpiCurrentValue) : '',
      reviewPeriodEnd: item.dueDate || this.createToday(),
    });
  }

  startFeedbackCreate(): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.feedbackEditorMode = 'create';
    this.activeFeedbackId = null;
    this.feedbackSubmitted = false;
    this.feedbackForm.reset({
      employeeId: '',
      givenBy: 'Manager',
      givenAt: this.createDateTimeLocalValue(),
      type: 'POSITIVE',
      comment: '',
    });
  }

  editFeedback(item: PerformanceFeedbackView): void {
    if (!this.canManagePerformance) {
      return;
    }

    this.feedbackEditorMode = 'edit';
    this.activeFeedbackId = item.id;
    this.feedbackSubmitted = false;
    this.feedbackForm.reset({
      employeeId: item.employeeId !== null ? String(item.employeeId) : '',
      givenBy: item.givenBy,
      givenAt: item.givenAt,
      type: item.type,
      comment: item.comment,
    });
  }

  trackById(index: number, item: { id: number | string }): number | string {
    return item.id || index;
  }

  async saveGoal(): Promise<void> {
    if (!this.canManagePerformance) {
      return;
    }

    this.goalSubmitted = true;
    const payload = this.buildGoalPayload();

    if (!payload) {
      this.goalForm.markAllAsTouched();
      return;
    }

    this.savingGoal = true;

    try {
      if (this.goalEditorMode === 'edit' && this.activeGoalId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/performance-goals/' + this.activeGoalId,
          payload
        );
        super.show('Confirmation', 'Performance goal updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/performance-goals', payload);
        super.show('Confirmation', 'Performance goal created successfully.', 'success');
      }

      this.startGoalCreate();
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.savingGoal = false;
    }
  }

  async saveReview(): Promise<void> {
    if (!this.canManagePerformance) {
      return;
    }

    this.reviewSubmitted = true;
    const payload = this.buildReviewPayload();

    if (!payload) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.savingReview = true;

    try {
      if (this.reviewEditorMode === 'edit' && this.activeReviewId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/performance-reviews/' + this.activeReviewId,
          payload
        );
        super.show('Confirmation', 'Performance review updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/performance-reviews', payload);
        super.show('Confirmation', 'Performance review captured successfully.', 'success');
      }

      this.startReviewCreate();
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.savingReview = false;
    }
  }

  async saveFeedback(): Promise<void> {
    if (!this.canManagePerformance) {
      return;
    }

    this.feedbackSubmitted = true;
    const payload = this.buildFeedbackPayload();

    if (!payload) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.savingFeedback = true;

    try {
      if (this.feedbackEditorMode === 'edit' && this.activeFeedbackId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/feedbacks/' + this.activeFeedbackId,
          payload
        );
        super.show('Confirmation', 'Feedback updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/feedbacks', payload);
        super.show('Confirmation', 'Feedback logged successfully.', 'success');
      }

      this.startFeedbackCreate();
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.savingFeedback = false;
    }
  }

  async deleteGoal(item: PerformanceGoalView): Promise<void> {
    if (!this.canManagePerformance) {
      return;
    }

    const confirmed = confirm('Delete the goal "' + item.title + '" for ' + item.employeeName + '?');
    if (!confirmed) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/performance-goals/' + item.id);
      super.show('Confirmation', 'Performance goal deleted successfully.', 'success');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    }
  }

  async deleteReview(item: PerformanceReviewView): Promise<void> {
    if (!this.canManagePerformance) {
      return;
    }

    const confirmed = confirm(
      'Delete the review for "' + item.goalTitle + '" and ' + item.employeeName + '?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/performance-reviews/' + item.id);
      super.show('Confirmation', 'Performance review deleted successfully.', 'success');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    }
  }

  async deleteFeedback(item: PerformanceFeedbackView): Promise<void> {
    if (!this.canManagePerformance) {
      return;
    }

    const confirmed = confirm(
      'Delete the ' + item.typeLabel.toLowerCase() + ' feedback from ' + item.givenBy + '?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/feedbacks/' + item.id);
      super.show('Confirmation', 'Feedback deleted successfully.', 'success');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    }
  }

  private loadWorkspace(showRefreshNotice = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      employees: this.canManagePerformance
        ? this.httpService
            .getAll(CONFIG.URL_BASE + '/employee/all')
            .pipe(catchError(() => of([])))
        : of([]),
      currentEmployee: this.isEmployeeWorkspace
        ? this.httpService.get(CONFIG.URL_BASE + '/employee/me').pipe(catchError(() => of(null)))
        : of(null),
      goals: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/performance-goals')
        .pipe(catchError(() => of([]))),
      reviews: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/performance-reviews')
        .pipe(catchError(() => of([]))),
      feedbacks: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/feedbacks')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result: any) => {
          this.currentEmployee = this.normalizeEmployee(result && result.currentEmployee);
          this.employees = this.canManagePerformance
            ? this.normalizeEmployees(result && result.employees)
            : this.currentEmployee
            ? [this.currentEmployee]
            : [];

          if (this.isEmployeeWorkspace && this.currentEmployee) {
            this.selectedEmployeeFilter = String(this.currentEmployee.id);
          }

          this.goals = this.normalizeGoals(result && result.goals);
          this.reviews = this.normalizeReviews(result && result.reviews);
          this.feedbackEntries = this.normalizeFeedback(result && result.feedbacks);

          if (this.isEmployeeWorkspace && !this.currentEmployee) {
            this.loadError = 'Your employee profile could not be resolved for performance tracking.';
          }

          if (showRefreshNotice) {
            super.show('Workspace refreshed', 'Performance data has been refreshed.', 'success');
          }
        },
        error: (error: unknown) => {
          this.loadError = this.getErrorMessage(error);
        },
      });
  }

  private buildGoalPayload(): any | null {
    if (this.goalForm.invalid) {
      return null;
    }

    const employeeId = this.toNumericId(this.goalForm.value.employeeId);

    return {
      title: this.normalizeText(this.goalForm.value.title),
      objective: this.normalizeText(this.goalForm.value.objective),
      reviewCycle: this.cycleLabel,
      kpiName: this.normalizeText(this.goalForm.value.kpiName),
      kpiTarget: this.toAmount(this.goalForm.value.kpiTarget),
      kpiCurrentValue: this.toAmount(this.goalForm.value.kpiCurrentValue),
      kpiUnit: this.normalizeText(this.goalForm.value.kpiUnit),
      priority: this.normalizeText(this.goalForm.value.priority),
      status: this.normalizeText(this.goalForm.value.status),
      dueDate: this.normalizeText(this.goalForm.value.dueDate),
      notes: this.normalizeText(this.goalForm.value.notes),
      employee: employeeId !== null ? { id: employeeId } : null,
    };
  }

  private buildReviewPayload(): any | null {
    if (this.reviewForm.invalid) {
      return null;
    }

    const employeeId = this.toNumericId(this.reviewForm.value.employeeId);
    const rating = Math.max(1, Math.min(5, Math.round(this.toAmount(this.reviewForm.value.rating))));

    return {
      reviewerName: this.normalizeText(this.reviewForm.value.reviewerName),
      reviewDate: this.normalizeText(this.reviewForm.value.reviewDate),
      reviewCycle: this.cycleLabel,
      reviewPeriodStart: this.normalizeText(this.reviewForm.value.reviewPeriodStart),
      reviewPeriodEnd: this.normalizeText(this.reviewForm.value.reviewPeriodEnd),
      goalTitle: this.normalizeText(this.reviewForm.value.goalTitle),
      objective: this.normalizeText(this.reviewForm.value.objective),
      kpiName: this.normalizeText(this.reviewForm.value.kpiName),
      kpiTarget: this.toAmount(this.reviewForm.value.kpiTarget),
      kpiActual: this.toAmount(this.reviewForm.value.kpiActual),
      status: this.normalizeText(this.reviewForm.value.status),
      rating,
      feedback: this.normalizeText(this.reviewForm.value.feedback),
      strengths: this.normalizeText(this.reviewForm.value.strengths),
      improvementAreas: this.normalizeText(this.reviewForm.value.improvementAreas),
      employee: employeeId !== null ? { id: employeeId } : null,
    };
  }

  private buildFeedbackPayload(): any | null {
    if (this.feedbackForm.invalid) {
      return null;
    }

    const employeeId = this.toNumericId(this.feedbackForm.value.employeeId);

    return {
      givenBy: this.normalizeText(this.feedbackForm.value.givenBy),
      givenAt: this.normalizeText(this.feedbackForm.value.givenAt),
      type: this.normalizeText(this.feedbackForm.value.type),
      comment: this.normalizeText(this.feedbackForm.value.comment),
      employee: employeeId !== null ? { id: employeeId } : null,
    };
  }

  private normalizeEmployees(data: unknown): EmployeeOption[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record) => {
        const id = this.toNumericId(record && record.id);
        const fullName =
          this.normalizeText(record && record.fullName) ||
          [
            this.normalizeText(record && record.firstName),
            this.normalizeText(record && record.lastName),
          ]
            .filter((item) => item)
            .join(' ');

        return {
          id,
          name: fullName || (id !== null ? 'Employee #' + id : 'Employee pending'),
        };
      })
      .filter((item) => item.id !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private normalizeEmployee(record: unknown): EmployeeOption | null {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const id = this.toNumericId((record as any).id);
    const fullName =
      this.normalizeText((record as any).fullName) ||
      [
        this.normalizeText((record as any).firstName),
        this.normalizeText((record as any).lastName),
      ]
        .filter((item) => item)
        .join(' ');

    return id !== null ? { id, name: fullName || 'Employee #' + id } : null;
  }

  private normalizeGoals(data: unknown): PerformanceGoalView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const employeeId = this.toNumericId(record && record.employee && record.employee.id);
        const employeeName =
          this.normalizeText(record && record.employee && record.employee.fullName) ||
          this.lookupEmployeeName(employeeId) ||
          'Employee pending';
        const title = this.normalizeText(record && record.title) || 'Untitled goal';
        const objective = this.normalizeText(record && record.objective);
        const reviewCycle = this.defaultText(record && record.reviewCycle, this.cycleLabel);
        const kpiName = this.defaultText(record && record.kpiName, 'KPI');
        const kpiTarget = this.toAmount(record && record.kpiTarget);
        const kpiCurrentValue = this.toAmount(record && record.kpiCurrentValue);
        const kpiUnit = this.normalizeText(record && record.kpiUnit);
        const priority = this.defaultText(record && record.priority, 'Medium');
        const dueDate = this.normalizeDateString(record && record.dueDate);
        const dueDateLabel = dueDate ? this.formatDate(dueDate) : 'No due date set';
        const progress = kpiTarget > 0 ? Math.round((kpiCurrentValue / kpiTarget) * 100) : 0;
        const progressBarWidth = Math.max(0, Math.min(100, progress));
        const status = this.defaultText(
          record && record.status,
          this.deriveGoalStatus(progress, dueDate)
        );
        const tone = this.resolveGoalTone(status, progress, dueDate);
        const notes = this.normalizeText(record && record.notes);

        return {
          id,
          employeeId,
          employeeName,
          title,
          objective,
          reviewCycle,
          kpiName,
          kpiTarget,
          kpiCurrentValue,
          kpiUnit,
          priority,
          status,
          dueDate,
          dueDateLabel,
          progress,
          progressBarWidth,
          targetLabel: this.formatMetric(kpiTarget, kpiUnit),
          currentLabel: this.formatMetric(kpiCurrentValue, kpiUnit),
          notes,
          summary:
            employeeName +
            ' is tracking ' +
            title +
            ' through KPI ' +
            kpiName +
            ' with ' +
            this.formatMetric(kpiCurrentValue, kpiUnit) +
            ' delivered against ' +
            this.formatMetric(kpiTarget, kpiUnit) +
            '.',
          tone,
        };
      })
      .sort(
        (left, right) =>
          left.dueDate.localeCompare(right.dueDate) || left.employeeName.localeCompare(right.employeeName)
      );
  }

  private normalizeReviews(data: unknown): PerformanceReviewView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const employeeId = this.toNumericId(record && record.employee && record.employee.id);
        const employeeName =
          this.normalizeText(record && record.employee && record.employee.fullName) ||
          this.lookupEmployeeName(employeeId) ||
          'Employee pending';
        const reviewerName = this.defaultText(record && record.reviewerName, 'Reviewer');
        const reviewDate = this.normalizeDateString(record && record.reviewDate);
        const reviewPeriodStart = this.normalizeDateString(record && record.reviewPeriodStart);
        const reviewPeriodEnd = this.normalizeDateString(record && record.reviewPeriodEnd);
        const reviewCycle = this.defaultText(
          record && record.reviewCycle,
          this.formatCycleLabel(this.toMonthValue(reviewDate || reviewPeriodEnd || reviewPeriodStart))
        );
        const goalTitle = this.defaultText(record && record.goalTitle, 'Performance review');
        const objective = this.normalizeText(record && record.objective);
        const kpiName = this.defaultText(record && record.kpiName, 'KPI');
        const kpiTarget = this.toAmount(record && record.kpiTarget);
        const kpiActual = this.toAmount(record && record.kpiActual);
        const status = this.defaultText(record && record.status, 'Completed');
        const rating = Math.max(0, Math.round(this.toAmount(record && record.rating)));
        const feedback = this.normalizeText(record && record.feedback);
        const strengths = this.normalizeText(record && record.strengths);
        const improvementAreas = this.normalizeText(record && record.improvementAreas);
        const tone = this.resolveReviewTone(status, rating);

        return {
          id,
          employeeId,
          employeeName,
          reviewerName,
          reviewDate,
          reviewDateLabel: reviewDate ? this.formatDate(reviewDate) : 'Pending review date',
          reviewPeriodStart,
          reviewPeriodEnd,
          reviewWindowLabel: this.formatReviewWindow(reviewPeriodStart, reviewPeriodEnd),
          reviewCycle,
          goalTitle,
          objective,
          kpiName,
          kpiTarget,
          kpiActual,
          kpiTargetLabel: this.formatMetric(kpiTarget, ''),
          kpiActualLabel: this.formatMetric(kpiActual, ''),
          status,
          rating,
          ratingLabel: rating > 0 ? rating + '/5' : 'Unrated',
          feedback,
          strengths,
          improvementAreas,
          summary:
            reviewerName +
            ' rated ' +
            employeeName +
            ' at ' +
            (rating > 0 ? rating + '/5' : 'an unrated status') +
            ' for ' +
            goalTitle +
            '.',
          tone,
        };
      })
      .sort(
        (left, right) =>
          right.reviewDate.localeCompare(left.reviewDate) || left.employeeName.localeCompare(right.employeeName)
      );
  }

  private normalizeFeedback(data: unknown): PerformanceFeedbackView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((record, index) => {
        const id = this.toNumericId(record && record.id) || index + 1;
        const employeeId = this.toNumericId(record && record.employee && record.employee.id);
        const employeeName =
          this.normalizeText(record && record.employee && record.employee.fullName) ||
          this.lookupEmployeeName(employeeId) ||
          'Employee pending';
        const givenBy = this.defaultText(record && record.givenBy, 'Manager');
        const givenAt = this.normalizeDateTimeString(record && record.givenAt);
        const type = this.defaultText(record && record.type, 'NEUTRAL');
        const typeLabel = this.toDisplayLabel(type);
        const comment = this.normalizeText(record && record.comment);
        const tone = this.resolveFeedbackTone(type);

        return {
          id,
          employeeId,
          employeeName,
          givenBy,
          givenAt,
          givenAtLabel: givenAt ? this.formatDateTime(givenAt) : 'Pending timestamp',
          type,
          typeLabel,
          comment,
          summary: givenBy + ' shared ' + typeLabel.toLowerCase() + ' feedback for ' + employeeName + '.',
          tone,
        };
      })
      .sort(
        (left, right) =>
          right.givenAt.localeCompare(left.givenAt) || left.employeeName.localeCompare(right.employeeName)
      );
  }

  private matchesEmployeeFilter(employeeId: number | null): boolean {
    if (this.selectedEmployeeFilter === 'all') {
      return true;
    }

    return String(employeeId) === this.selectedEmployeeFilter;
  }

  private matchesSelectedCycle(reviewCycle: string, dateValue: string): boolean {
    const selectedMonth = this.selectedCycleMonth;
    if (!selectedMonth) {
      return true;
    }

    const cycleMatch = this.normalizeText(reviewCycle).toLowerCase() === this.cycleLabel.toLowerCase();
    const dateMatch = this.toMonthValue(dateValue) === selectedMonth;

    return cycleMatch || dateMatch;
  }

  private isClosedStatus(status: string): boolean {
    const normalizedStatus = this.normalizeText(status).toLowerCase();
    return normalizedStatus === 'completed' || normalizedStatus === 'closed';
  }

  private deriveGoalStatus(progress: number, dueDate: string): string {
    const today = this.createToday();

    if (progress >= 100) {
      return 'Completed';
    }

    if (dueDate && dueDate < today && progress < 100) {
      return 'At risk';
    }

    if (progress >= 70) {
      return 'On track';
    }

    return 'Needs focus';
  }

  private resolveGoalTone(status: string, progress: number, dueDate: string): Tone {
    const normalizedStatus = this.normalizeText(status).toLowerCase();
    const today = this.createToday();

    if (normalizedStatus === 'completed' || progress >= 100) {
      return 'strong';
    }

    if (normalizedStatus.indexOf('risk') !== -1 || (!!dueDate && dueDate < today && progress < 100)) {
      return 'critical';
    }

    if (normalizedStatus.indexOf('track') !== -1 || progress >= 70) {
      return 'medium';
    }

    return 'warning';
  }

  private resolveReviewTone(status: string, rating: number): Tone {
    const normalizedStatus = this.normalizeText(status).toLowerCase();

    if (normalizedStatus === 'completed' && rating >= 4) {
      return 'strong';
    }

    if (rating <= 2) {
      return 'critical';
    }

    if (normalizedStatus === 'in review' || normalizedStatus === 'draft') {
      return 'warning';
    }

    return 'medium';
  }

  private resolveFeedbackTone(type: string): Tone {
    const normalizedType = this.normalizeText(type).toUpperCase();

    if (normalizedType === 'POSITIVE') {
      return 'strong';
    }

    if (normalizedType === 'CONSTRUCTIVE') {
      return 'warning';
    }

    return 'medium';
  }

  private lookupEmployeeName(employeeId: number | null): string {
    return (
      this.employees.find((item) => item.id === employeeId)?.name ||
      (employeeId !== null ? 'Employee #' + employeeId : '')
    );
  }

  private formatMetric(value: number, unit: string): string {
    const normalizedUnit = this.normalizeText(unit);
    const roundedValue = value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1);
    return normalizedUnit ? roundedValue + ' ' + normalizedUnit : roundedValue;
  }

  private formatReviewWindow(start: string, end: string): string {
    if (start && end) {
      return this.formatDate(start) + ' to ' + this.formatDate(end);
    }

    if (end) {
      return 'Closed on ' + this.formatDate(end);
    }

    if (start) {
      return 'Opened on ' + this.formatDate(start);
    }

    return 'Review window not defined';
  }

  private formatCycleLabel(cycleMonth: string): string {
    const normalizedValue = this.normalizeText(cycleMonth);

    if (!/^\d{4}-\d{2}$/.test(normalizedValue)) {
      return normalizedValue || 'Current cycle';
    }

    const parts = normalizedValue.split('-');
    const year = Number(parts[0]);
    const monthIndex = Number(parts[1]) - 1;
    const cycleDate = new Date(year, monthIndex, 1);

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(cycleDate);
  }

  private formatDate(dateValue: string): string {
    const normalizedValue = this.normalizeText(dateValue);
    if (!normalizedValue) {
      return 'Pending';
    }

    const date = new Date(normalizedValue + 'T00:00:00');
    if (Number.isNaN(date.getTime())) {
      return normalizedValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private formatDateTime(dateTimeValue: string): string {
    const normalizedValue = this.normalizeText(dateTimeValue);
    if (!normalizedValue) {
      return 'Pending';
    }

    const date = new Date(normalizedValue.length === 16 ? normalizedValue + ':00' : normalizedValue);
    if (Number.isNaN(date.getTime())) {
      return normalizedValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  private toDisplayLabel(value: string): string {
    return this.normalizeText(value)
      .toLowerCase()
      .split('_')
      .map((item) => (item ? item.charAt(0).toUpperCase() + item.slice(1) : item))
      .join(' ');
  }

  private toMonthValue(dateValue: string): string {
    const normalizedValue = this.normalizeText(dateValue);
    return normalizedValue.length >= 7 ? normalizedValue.slice(0, 7) : '';
  }

  private normalizeDateString(value: unknown): string {
    const text = this.normalizeText(value);
    return text.length >= 10 ? text.slice(0, 10) : text;
  }

  private normalizeDateTimeString(value: unknown): string {
    const text = this.normalizeText(value);
    return text.length >= 16 ? text.slice(0, 16) : text;
  }

  private toNumericId(value: unknown): number | null {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private toAmount(value: unknown): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private defaultText(value: unknown, defaultValue: string): string {
    const normalizedValue = this.normalizeText(value);
    return normalizedValue || defaultValue;
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
  }

  private createInitialCycleMonth(): string {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  }

  private createMonthStart(cycleMonth: string): string {
    const normalizedValue = this.normalizeText(cycleMonth);
    return /^\d{4}-\d{2}$/.test(normalizedValue)
      ? normalizedValue + '-01'
      : this.createToday();
  }

  private createToday(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  private createDateTimeLocalValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return 'Unable to complete the performance request.';
  }
}