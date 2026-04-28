import { Component } from '@angular/core';
import { Router } from '@angular/router';
import '@fortawesome/fontawesome-free/js/all.js';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { ThemePreferencesService } from 'src/app/main/services/theme-preferences.service';

interface RouteMeta {
  tag: string;
  title: string;
  summary: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends URLLoader {
  title = 'Humant';

  private readonly routeMeta: Record<string, RouteMeta> = {
    dashboard: {
      tag: 'Executive overview',
      title: 'Operations Dashboard',
      summary:
        'Track workforce health, payroll exposure, and delivery priorities in one place.',
    },
    employee: {
      tag: 'People operations',
      title: 'Employee Directory',
      summary:
        'Review employee records, core details, and ongoing workforce changes with clarity.',
    },
    salary: {
      tag: 'Compensation',
      title: 'Payroll Control',
      summary:
        'Keep salary operations visible, auditable, and ready for finance review.',
    },
    training: {
      tag: 'Capability growth',
      title: 'Learning Programs',
      summary:
        'Manage training cycles, participation, and capability-building initiatives.',
    },
    job: {
      tag: 'Talent pipeline',
      title: 'Recruitment Flow',
      summary:
        'Monitor open roles, hiring activity, and talent acquisition momentum.',
    },
    departement: {
      tag: 'Org design',
      title: 'Department Workspace',
      summary:
        'Shape operating teams, leadership ownership, and department coverage with more clarity.',
    },
    designation: {
      tag: 'Role structure',
      title: 'Designation Library',
      summary:
        'Maintain a cleaner designation catalog and keep each title anchored to the right team.',
    },
    'education-level': {
      tag: 'Talent profile',
      title: 'Education Levels',
      summary:
        'Track qualifications, program depth, and credential standards across the people system.',
    },
    contract: {
      tag: 'Employment terms',
      title: 'Contract Desk',
      summary:
        'Review employee agreements, timelines, and working terms from one controlled workspace.',
    },
    'contract-type': {
      tag: 'Policy framework',
      title: 'Contract Types',
      summary:
        'Curate the agreement models used across hiring, consulting, and fixed-term engagements.',
    },
    leave: {
      tag: 'Time management',
      title: 'Leave Administration',
      summary:
        'Coordinate leave requests, policy alignment, and team coverage decisions.',
    },
    profile: {
      tag: 'Workspace identity',
      title: 'Profile',
      summary:
        'Adjust personal context and keep the workspace aligned with your operating role.',
    },
    configuration: {
      tag: 'Workspace controls',
      title: 'Configuration',
      summary:
        'Refine settings, defaults, and admin behavior across the platform.',
    },
  };

  constructor(
    private _router: Router,
    private themePreferencesService: ThemePreferencesService
  ) {
    super();
  }

  ngOnInit() {
    this.themePreferencesService.initialize();
    //this.loadScripts();
  }

  hasRoute(route: string) {
    return this._router.url.includes(route);
  }

  getCurrentPageTag(): string {
    return this.getCurrentRouteMeta().tag;
  }

  getCurrentPageTitle(): string {
    return this.getCurrentRouteMeta().title;
  }

  getCurrentPageSummary(): string {
    return this.getCurrentRouteMeta().summary;
  }

  private getCurrentRouteMeta(): RouteMeta {
    const routeKey =
      this._router.url.split('?')[0].replace(/^\/+/, '').split('/')[0] ||
      'dashboard';

    return (
      this.routeMeta[routeKey] || {
        tag: 'Workspace',
        title: this.humanizeRouteSegment(routeKey),
        summary:
          'Manage operational data with a cleaner, more focused workflow surface.',
      }
    );
  }

  private humanizeRouteSegment(segment: string): string {
    return segment
      .split('-')
      .filter(Boolean)
      .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
      .join(' ');
  }
}
