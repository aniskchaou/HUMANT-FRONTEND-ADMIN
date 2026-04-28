import { Component, HostListener, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface DashboardSummaryCard {
  label: string;
  value: string;
  delta: string;
  detail: string;
  icon: string;
  tone: string;
  route: string;
}

interface DashboardFocusArea {
  label: string;
  progress: number;
  description: string;
}

interface DashboardActivityItem {
  title: string;
  description: string;
  meta: string;
  route: string;
}

interface DashboardTimelineItem {
  stamp: string;
  title: string;
  description: string;
  tone: string;
}

interface DashboardHeroMetric {
  value: string;
  label: string;
}

interface DashboardModuleLink {
  label: string;
  detail: string;
  count: string;
  route: string;
  icon: string;
  tone: string;
}

interface ChartDatum {
  name: string;
  value: number;
}

interface DashboardChartState {
  mode: 'live' | 'preview';
  note: string;
}

interface DashboardSummaryResponse {
  employeeCount: number;
  jobCount: number;
  salaryCount: number;
  trainingCount: number;
  announcementCount: number;
  activeAnnouncementCount: number;
  liveTrainingCount: number;
  terminationCount: number;
  trackedRecords: number;
  activeModules: number;
  attentionCount: number;
  fullyCompletedProfiles: number;
  payrollTotal: number;
  averagePackage: number;
  profileCompletion: number;
  featuredJobNames: string[];
  payrollDistribution: ChartDatum[];
  workforceDistribution: ChartDatum[];
  priorityItems: DashboardActivityItem[];
  timeline: DashboardTimelineItem[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent extends URLLoader implements OnInit {
  loading = false;
  partialData = false;
  loadError = '';
  lastUpdatedLabel = 'Waiting for first sync';
  recordFootprintLabel = '0';
  activeModuleCount = '0';
  attentionCountLabel = '0';

  barChartView: [number, number] = [640, 320];
  pieChartView: [number, number] = [520, 320];

  summaryCards: DashboardSummaryCard[] = [];
  focusAreas: DashboardFocusArea[] = [];
  priorityItems: DashboardActivityItem[] = [];
  timeline: DashboardTimelineItem[] = [];
  heroMetrics: DashboardHeroMetric[] = [];
  moduleLinks: DashboardModuleLink[] = [];
  payrollDistribution: ChartDatum[] = [];
  workforceDistribution: ChartDatum[] = [];
  payrollChartData: ChartDatum[] = [];
  workforceChartData: ChartDatum[] = [];
  payrollChartState: DashboardChartState = {
    mode: 'preview',
    note: 'Preview data is showing until salary records are available.',
  };
  workforceChartState: DashboardChartState = {
    mode: 'preview',
    note: 'Preview data is showing until employee records are available.',
  };

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Salary packages';
  showYAxisLabel = true;
  yAxisLabel = 'Total value';

  colorScheme = {
    domain: ['#143a5a', '#1c4e80', '#1d7874', '#c38b2c'],
  };

  gradient2 = false;
  showLegend2 = false;
  showLabels2 = true;
  isDoughnut2 = true;
  legendPosition2 = 'below';

  colorScheme2 = {
    domain: ['#143a5a', '#1d7874', '#c38b2c', '#d06a4f'],
  };

  constructor(private httpService: HTTPService) {
    super();
    this.applySummary(this.createEmptySummary());
  }

  ngOnInit(): void {
    this.updateChartViews();
    super.loadScripts();
    this.loadDashboard();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateChartViews();
  }

  reloadDashboard(): void {
    this.loadDashboard(true);
  }

  private loadDashboard(showNotification = false): void {
    this.loading = true;
    this.partialData = false;
    this.loadError = '';

    this.httpService
      .getAll(CONFIG.URL_BASE + '/dashboard/summary')
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.partialData = true;
          this.loadError = 'Unable to load dashboard data right now.';
          this.payrollChartData = this.buildPayrollPreview(0, 0);
          this.workforceChartData = this.buildWorkforcePreview(0);
          this.payrollChartState = {
            mode: 'preview',
            note: 'Preview data is showing while the backend summary is unavailable.',
          };
          this.workforceChartState = {
            mode: 'preview',
            note: 'Preview data is showing while the backend summary is unavailable.',
          };

          if (showNotification) {
            super.show('Error', error.message, 'warning');
          }

          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.lastUpdatedLabel = this.formatLastUpdated(new Date());
        })
      )
      .subscribe((summary: DashboardSummaryResponse | null) => {
        if (!summary) {
          return;
        }

        const normalizedSummary = this.normalizeSummary(summary);

        this.applySummary(normalizedSummary);
        this.loadError = normalizedSummary.trackedRecords
          ? ''
          : 'No records are available yet. Create employees, jobs, salaries, or announcements to populate the dashboard.';

        if (showNotification) {
          super.show(
            'Dashboard refreshed',
            this.partialData
              ? 'Live dashboard data refreshed with preview chart fallbacks for incomplete records.'
              : 'Live dashboard data was refreshed from the backend.',
            this.partialData ? 'warning' : 'success'
          );
        }
      });
  }

  private applySummary(summary: DashboardSummaryResponse): void {
    this.summaryCards = [
      {
        label: 'Active employees',
        value: this.formatCount(summary.employeeCount),
        delta: summary.profileCompletion + '% complete',
        detail:
          summary.fullyCompletedProfiles > 0
            ? summary.fullyCompletedProfiles +
              ' employee profiles include core contact and identity fields.'
            : 'Start enriching employee records with phone, gender, and address data.',
        icon: 'bi bi-people-fill',
        tone: 'navy',
        route: '/employee',
      },
      {
        label: 'Open roles',
        value: this.formatCount(summary.jobCount),
        delta: summary.featuredJobNames.length
          ? summary.featuredJobNames.slice(0, 2).join(' • ')
          : 'No vacancies',
        detail:
          summary.jobCount > 0
            ? summary.jobCount + ' recruiting entries are available for the hiring workflow.'
            : 'Create job records to surface recruiting demand here.',
        icon: 'bi bi-briefcase-fill',
        tone: 'teal',
        route: '/job',
      },
      {
        label: 'Payroll volume',
        value: this.formatAmount(summary.payrollTotal),
        delta:
          summary.salaryCount > 0
            ? this.formatAmount(summary.averagePackage) + ' avg'
            : 'Awaiting setup',
        detail:
          summary.salaryCount > 0
            ? summary.salaryCount + ' salary packages are configured in the platform.'
            : 'No salary packages were found yet.',
        icon: 'bi bi-wallet2',
        tone: 'gold',
        route: '/salary',
      },
      {
        label: 'Learning plans',
        value: this.formatCount(summary.trainingCount),
        delta: summary.liveTrainingCount
          ? summary.liveTrainingCount + ' live now'
          : 'No live sessions',
        detail:
          summary.activeAnnouncementCount > 0
            ? summary.activeAnnouncementCount +
              ' active announcements are currently visible to teams.'
            : 'Publish announcements to keep operational communication visible.',
        icon: 'bi bi-calendar2-week-fill',
        tone: 'coral',
        route: '/training',
      },
    ];

    this.heroMetrics = [
      {
        value: this.formatCount(summary.activeAnnouncementCount),
        label: 'Active announcements',
      },
      {
        value: this.formatCount(summary.liveTrainingCount),
        label: 'Live trainings',
      },
      {
        value: this.formatCount(summary.terminationCount),
        label: 'Termination records',
      },
      {
        value: summary.salaryCount ? this.formatAmount(summary.averagePackage) : '0',
        label: 'Average salary package',
      },
    ];

    this.moduleLinks = [
      {
        label: 'Employees',
        detail: 'Profiles, contact details, and people records.',
        count: this.formatCount(summary.employeeCount),
        route: '/employee',
        icon: 'bi bi-people-fill',
        tone: 'navy',
      },
      {
        label: 'Jobs',
        detail: 'Recruitment demand and open hiring entries.',
        count: this.formatCount(summary.jobCount),
        route: '/job',
        icon: 'bi bi-briefcase-fill',
        tone: 'teal',
      },
      {
        label: 'Salaries',
        detail: 'Compensation packages and payroll setup.',
        count: this.formatCount(summary.salaryCount),
        route: '/salary',
        icon: 'bi bi-wallet2',
        tone: 'gold',
      },
      {
        label: 'Training',
        detail: 'Scheduled development and learning sessions.',
        count: this.formatCount(summary.trainingCount),
        route: '/training',
        icon: 'bi bi-calendar2-week-fill',
        tone: 'coral',
      },
      {
        label: 'Announcements',
        detail: 'Internal communication visible across teams.',
        count: this.formatCount(summary.announcementCount),
        route: '/announcement',
        icon: 'bi bi-megaphone-fill',
        tone: 'navy',
      },
      {
        label: 'Termination',
        detail: 'Exit records and termination follow-up.',
        count: this.formatCount(summary.terminationCount),
        route: '/termination',
        icon: 'bi bi-shield-check',
        tone: 'teal',
      },
    ];

    this.focusAreas = [
      {
        label: 'Profile completeness',
        progress: summary.profileCompletion,
        description:
          summary.employeeCount > 0
            ? summary.fullyCompletedProfiles +
              ' of ' +
              summary.employeeCount +
              ' employee records contain the full core profile set.'
            : 'Add employee records to start measuring workforce data quality.',
      },
      {
        label: 'Compensation coverage',
        progress: this.toPercent(summary.salaryCount, Math.max(summary.employeeCount, 1)),
        description:
          summary.salaryCount > 0
            ? summary.salaryCount + ' compensation packages are available for payroll operations.'
            : 'Create salary packages to establish payroll coverage.',
      },
      {
        label: 'Communication cadence',
        progress: this.toPercent(
          summary.activeAnnouncementCount,
          Math.max(summary.announcementCount, 1)
        ),
        description:
          summary.announcementCount > 0
            ? summary.activeAnnouncementCount +
              ' of ' +
              summary.announcementCount +
              ' announcements are active right now.'
            : 'No announcement records were found yet.',
      },
      {
        label: 'Learning activation',
        progress: this.toPercent(summary.trainingCount, Math.max(summary.employeeCount, 1)),
        description:
          summary.trainingCount > 0
            ? summary.trainingCount +
              ' training records are supporting current workforce growth.'
            : 'No training records are available yet.',
      },
    ];

    this.priorityItems = summary.priorityItems;
    this.timeline = summary.timeline;
    this.payrollDistribution = summary.payrollDistribution;
    this.workforceDistribution = summary.workforceDistribution;
    this.payrollChartData = this.payrollDistribution.length
      ? this.payrollDistribution
      : this.buildPayrollPreview(summary.salaryCount, summary.payrollTotal);
    this.workforceChartData = this.workforceDistribution.length
      ? this.workforceDistribution
      : this.buildWorkforcePreview(summary.employeeCount);
    this.payrollChartState = this.payrollDistribution.length
      ? {
          mode: 'live',
          note: 'Live salary package data from the backend payroll summary.',
        }
      : {
          mode: 'preview',
          note:
            summary.salaryCount > 0
              ? 'Preview breakdown is showing because salary totals are still incomplete.'
              : 'Preview breakdown is showing until salary records are created.',
        };
    this.workforceChartState = this.workforceDistribution.length
      ? {
          mode: 'live',
          note: 'Live workforce mix based on backend employee records.',
        }
      : {
          mode: 'preview',
          note:
            summary.employeeCount > 0
              ? 'Preview mix is showing because employee demographic fields are still incomplete.'
              : 'Preview mix is showing until employee records are created.',
        };

    this.partialData =
      (summary.salaryCount > 0 && !this.payrollDistribution.length) ||
      (summary.employeeCount > 0 && !this.workforceDistribution.length);
    this.recordFootprintLabel = this.formatCount(summary.trackedRecords);
    this.activeModuleCount = this.formatCount(summary.activeModules);
    this.attentionCountLabel = this.formatCount(summary.attentionCount);
  }

  private normalizeSummary(
    summary: Partial<DashboardSummaryResponse>
  ): DashboardSummaryResponse {
    const emptySummary = this.createEmptySummary();

    return {
      ...emptySummary,
      ...summary,
      featuredJobNames: Array.isArray(summary.featuredJobNames)
        ? summary.featuredJobNames.filter((item) => !!item)
        : emptySummary.featuredJobNames,
      payrollDistribution: this.normalizeChartData(summary.payrollDistribution),
      workforceDistribution: this.normalizeChartData(summary.workforceDistribution),
      priorityItems: Array.isArray(summary.priorityItems)
        ? summary.priorityItems
        : emptySummary.priorityItems,
      timeline: Array.isArray(summary.timeline) ? summary.timeline : emptySummary.timeline,
    };
  }

  private normalizeChartData(data: ChartDatum[] | undefined): ChartDatum[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((item) => !!item && typeof item.name === 'string')
      .map((item) => ({
        name: item.name,
        value: Number(item.value) || 0,
      }))
      .filter((item) => item.value > 0);
  }

  private createEmptySummary(): DashboardSummaryResponse {
    return {
      employeeCount: 0,
      jobCount: 0,
      salaryCount: 0,
      trainingCount: 0,
      announcementCount: 0,
      activeAnnouncementCount: 0,
      liveTrainingCount: 0,
      terminationCount: 0,
      trackedRecords: 0,
      activeModules: 0,
      attentionCount: 0,
      fullyCompletedProfiles: 0,
      payrollTotal: 0,
      averagePackage: 0,
      profileCompletion: 0,
      featuredJobNames: [],
      payrollDistribution: [],
      workforceDistribution: [],
      priorityItems: [],
      timeline: [],
    };
  }

  private buildPayrollPreview(recordCount: number, payrollTotal: number): ChartDatum[] {
    const safeTotal = payrollTotal > 0 ? payrollTotal : Math.max(recordCount, 1) * 1200;

    return [
      { name: 'Base pay', value: Math.round(safeTotal * 0.58) },
      { name: 'Allowances', value: Math.round(safeTotal * 0.24) },
      { name: 'Benefits', value: Math.round(safeTotal * 0.18) },
    ];
  }

  private buildWorkforcePreview(recordCount: number): ChartDatum[] {
    const seed = Math.max(recordCount, 12);
    const primary = Math.max(Math.round(seed * 0.46), 1);
    const secondary = Math.max(Math.round(seed * 0.34), 1);
    const tertiary = Math.max(seed - primary - secondary, 1);

    return [
      { name: 'Core team', value: primary },
      { name: 'Growth team', value: secondary },
      { name: 'Leadership', value: tertiary },
    ];
  }

  private updateChartViews(): void {
    const width = window.innerWidth;
    const horizontalPadding = width < 768 ? 72 : width < 1200 ? 120 : 180;
    const chartWidth = Math.max(280, width - horizontalPadding);
    const compactWidth = Math.max(280, Math.min(chartWidth, 520));

    this.barChartView = [Math.min(720, chartWidth), width < 768 ? 280 : 320];
    this.pieChartView = [compactWidth, width < 768 ? 280 : 320];
  }

  private toPercent(value: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  private formatAmount(value: number): string {
    const absoluteValue = Math.abs(value || 0);
    const sign = value < 0 ? '-' : '';

    if (absoluteValue >= 1000000000) {
      return sign + (absoluteValue / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }

    if (absoluteValue >= 1000000) {
      return sign + (absoluteValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }

    if (absoluteValue >= 1000) {
      return sign + (absoluteValue / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }

    return sign + this.formatCount(absoluteValue);
  }

  private formatLastUpdated(date: Date): string {
    return (
      'Synced ' +
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)
    );
  }
}
