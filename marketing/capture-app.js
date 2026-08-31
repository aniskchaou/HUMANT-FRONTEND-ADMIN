/**
 * capture-app.js
 * Captures screenshots of the live Angular app at http://localhost:4201
 * Run: node marketing/capture-app.js
 */
'use strict';

const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const BASE_URL = 'http://localhost:4201';
const OUT_DIR  = path.resolve(__dirname, '..', 'screenshots', 'app');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { name: '01-login',        url: '/login',          label: 'Login' },
  { name: '02-dashboard',    url: '/dashboard',      label: 'Dashboard' },
  { name: '03-employees',    url: '/employee',       label: 'Employees' },
  { name: '04-attendance',   url: '/attendance',     label: 'Attendance' },
  { name: '05-pay-slip',     url: '/pay-slip',       label: 'Payslip' },
  { name: '06-leave',        url: '/leave',          label: 'Leave' },
  { name: '07-salary',       url: '/salary',         label: 'Salary' },
  { name: '08-job',          url: '/job',            label: 'Jobs' },
  { name: '09-candidate',    url: '/candidate',      label: 'Candidates' },
  { name: '10-interview',    url: '/interview',      label: 'Interviews' },
  { name: '11-performance',  url: '/performance',    label: 'Performance' },
  { name: '12-announcement', url: '/announcement',   label: 'Announcements' },
  { name: '13-complain',     url: '/complain',       label: 'Complaints' },
  { name: '14-departement',  url: '/departement',    label: 'Departments' },
  { name: '15-training',     url: '/training',       label: 'Training' },
  { name: '16-onboarding',   url: '/onboarding',     label: 'Onboarding' },
  { name: '17-resignation',  url: '/resignation',    label: 'Resignation' },
  { name: '18-award',        url: '/award',          label: 'Awards' },
  { name: '19-holiday',      url: '/holiday',        label: 'Holidays' },
  { name: '20-event',        url: '/event',          label: 'Events' },
];

(async () => {
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Log in first
  await page.goto(BASE_URL + '/login');
  await page.waitForTimeout(1000);
  await page.fill('input[name="username"], input[type="text"]', 'admin');
  await page.fill('input[name="password"], input[type="password"]', 'admin');

  // Screenshot the login page before submitting
  await page.screenshot({ path: path.join(OUT_DIR, '01-login.png') });
  console.log('  01-login.png  — Login');

  await page.click('button[type="submit"], button:has-text("Enter workspace")');
  await page.waitForTimeout(2000);

  // Screenshot the dashboard (first page after login)
  await page.screenshot({ path: path.join(OUT_DIR, '02-dashboard.png'), fullPage: false });
  console.log('  02-dashboard.png  — Dashboard');

  // Navigate to each page
  for (const p of PAGES.slice(2)) {
    try {
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle', timeout: 8000 });
      await page.waitForTimeout(800);
      const outPath = path.join(OUT_DIR, p.name + '.png');
      await page.screenshot({ path: outPath, fullPage: false });
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log('  ' + p.name + '.png  (' + kb + ' KB)  — ' + p.label);
    } catch (e) {
      console.warn('  SKIP ' + p.name + ' — ' + e.message.split('\n')[0]);
    }
  }

  await browser.close();
  console.log('\nAll screenshots saved to: ' + OUT_DIR);
})();
