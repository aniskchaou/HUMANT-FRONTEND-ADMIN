import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AccessControlService } from 'src/app/main/security/access-control.service';
interface NavigationEntry {
  label: string;
  route: string;
}

interface NavigationSection {
  label: string;
  icon: string;
  items: NavigationEntry[];
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent extends URLLoader implements OnInit, OnDestroy {
  readonly sections: NavigationSection[] = [
    {
      label: 'People & Structure',
      icon: 'bi bi-people-fill',
      items: [
        { label: 'Employees', route: '/employee' },
        { label: 'Onboarding', route: '/onboarding' },
        { label: 'Documents', route: '/document' },
        { label: 'Users', route: '/user' },
        { label: 'Departments', route: '/departement' },
        { label: 'Designations', route: '/designation' },
        { label: 'Education Levels', route: '/education-level' },
        { label: 'Contracts', route: '/contract' },
        { label: 'Contract Types', route: '/contract-type' },
      ],
    },
    {
      label: 'Talent & Growth',
      icon: 'bi bi-briefcase-fill',
      items: [
        { label: 'Jobs', route: '/job' },
        { label: 'Candidates', route: '/candidate' },
        { label: 'Interviews', route: '/interview' },
        { label: 'Offer Letters', route: '/offer-letter' },
        { label: 'Recruitment Pipeline', route: '/pipeline' },
        { label: 'Training', route: '/training' },
        { label: 'Performance', route: '/performance' },
        { label: 'Training Types', route: '/training-type' },
        { label: 'Awards', route: '/award' },
        { label: 'Award Types', route: '/award-type' },
        { label: 'Announcements', route: '/announcement' },
        { label: 'Communications', route: '/communication' },
        { label: 'Events', route: '/event' },
        { label: 'Launch Plans', route: '/launch-plan' },
      ],
    },
    {
      label: 'Time & Mobility',
      icon: 'bi bi-calendar2-week-fill',
      items: [
        { label: 'Attendance', route: '/attendance' },
        { label: 'Leave', route: '/leave' },
        { label: 'Leave Types', route: '/leave-type' },
        { label: 'Holiday', route: '/holiday' },
        { label: 'Transfers', route: '/transfert' },
        { label: 'Notice', route: '/notice' },
      ],
    },
    {
      label: 'Compensation',
      icon: 'bi bi-wallet2',
      items: [
        { label: 'Salary', route: '/salary' },
        { label: 'Pay Slips', route: '/pay-slip' },
        { label: 'Expenses', route: '/expense' },
        { label: 'Loans', route: '/loan' },
        { label: 'Advance Salary', route: '/advance' },
      ],
    },
    {
      label: 'Risk & Exit',
      icon: 'bi bi-shield-check',
      items: [
        { label: 'Resignations', route: '/resignation' },
        { label: 'Terminations', route: '/termination' },
        { label: 'Warning', route: '/warning' },
      ],
    },
    {
      label: 'Settings',
      icon: 'bi bi-gear-fill',
      items: [
        { label: 'Configuration', route: '/configuration' },
        { label: 'Documentation', route: '/documentation' },
        { label: 'Profile', route: '/profile' },
      ],
    },
  ];

  constructor(
    private router: Router,
    public accessControlService: AccessControlService
  ) {
    super();
    //super.loadScripts();
  }

  private readonly expandedSectionLabels = new Set<string>();
  private routerEventsSubscription?: Subscription;

  ngOnInit(): void {
    this.expandActiveSection();
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.expandActiveSection();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }

  get visibleSections(): NavigationSection[] {
    return this.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          this.accessControlService.canAccessRoute(item.route)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }

  get visibleModuleCount(): number {
    return this.visibleSections.reduce(
      (total, section) => total + section.items.length,
      0
    );
  }

  isRouteActive(route: string): boolean {
    return this.router.url.split('?')[0] === route;
  }

  isSectionActive(section: NavigationSection): boolean {
    return section.items.some((item) => this.isRouteActive(item.route));
  }

  isSectionOpen(section: NavigationSection): boolean {
    return this.expandedSectionLabels.has(section.label);
  }

  toggleSection(section: NavigationSection, event: Event): void {
    event.preventDefault();

    if (this.isSectionOpen(section)) {
      this.expandedSectionLabels.delete(section.label);
      return;
    }

    this.expandedSectionLabels.add(section.label);
  }

  private expandActiveSection(): void {
    const activeSection = this.visibleSections.find((section) =>
      this.isSectionActive(section)
    );

    if (activeSection) {
      this.expandedSectionLabels.add(activeSection.label);
    }
  }
}
