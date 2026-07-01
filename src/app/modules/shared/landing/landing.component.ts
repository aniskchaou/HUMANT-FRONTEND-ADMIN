import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  menuOpen = false;
  currentYear = new Date().getFullYear();

  readonly features = [
    {
      icon: 'bi-people-fill',
      title: 'Employee Management',
      description:
        'Full employee profiles, contracts, documents, onboarding checklists, and organisational chart — all in one place.',
    },
    {
      icon: 'bi-wallet2',
      title: 'Payroll & Compensation',
      description:
        'Automated payroll runs, pay slips, salary structures, advances, loans, and expense claims handled end-to-end.',
    },
    {
      icon: 'bi-calendar2-check',
      title: 'Leave & Attendance',
      description:
        'Policy-based leave management, real-time attendance tracking, holiday calendars, and balance reports.',
    },
    {
      icon: 'bi-briefcase-fill',
      title: 'Recruitment Pipeline',
      description:
        'Post jobs, manage candidates, schedule interviews, generate offer letters, and track pipeline conversion.',
    },
    {
      icon: 'bi-bar-chart-line-fill',
      title: 'Performance & Training',
      description:
        'Set goals, run performance reviews, collect 360° feedback, assign training programmes, and track completions.',
    },
    {
      icon: 'bi-shield-check',
      title: 'Compliance & Policies',
      description:
        'Centralised policy library, role-based access control, audit logs, and configurable approval workflows.',
    },
  ];

  readonly plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '14 days',
      highlight: false,
      badge: '',
      features: [
        'All modules unlocked',
        'Up to 5 users',
        'Email support',
        'No credit card required',
      ],
      cta: 'Start free trial',
      route: '/register',
    },
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      highlight: false,
      badge: '',
      features: [
        'Up to 10 users',
        'Core HR modules',
        'Payroll & Leave',
        'Email support',
      ],
      cta: 'Get started',
      route: '/register',
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      highlight: true,
      badge: 'Most popular',
      features: [
        'Up to 50 users',
        'All modules',
        'Recruitment & Training',
        'Priority support',
        'Custom approval flows',
      ],
      cta: 'Get started',
      route: '/register',
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      highlight: false,
      badge: '',
      features: [
        'Unlimited users',
        'All modules',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
      cta: 'Contact us',
      route: '/register',
    },
  ];

  readonly stats = [
    { value: '30+', label: 'HR modules' },
    { value: '14-day', label: 'Free trial' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '5 min', label: 'Setup time' },
  ];

  readonly testimonials = [
    {
      quote:
        'Humant replaced three separate tools for us. Onboarding, payroll, and leave are all in one place now.',
      author: 'Sarah K.',
      role: 'HR Director, TechStart',
    },
    {
      quote:
        'The recruitment pipeline alone saved us hours every week. Offer letters generate in seconds.',
      author: 'James M.',
      role: 'Talent Acquisition Lead, FinCorp',
    },
    {
      quote:
        'Setup was under five minutes. Our team was using it the same day we signed up.',
      author: 'Fatima A.',
      role: 'Operations Manager, BuildCo',
    },
  ];

  constructor(private router: Router) {}

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    this.menuOpen = false;
  }
}
