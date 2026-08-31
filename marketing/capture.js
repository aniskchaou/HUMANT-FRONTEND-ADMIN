/**
 * capture.js
 * Captures each marketing section as a full-width PNG.
 * Run: node marketing/capture.js
 * Requires @playwright/test: npm install --save-dev @playwright/test
 */
'use strict';

const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const HTML_FILE = path.resolve(__dirname, 'index.html');
const OUT_DIR   = path.resolve(__dirname, 'images');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHOTS = [
  { name: '01-hero',        selector: '.hero',         label: 'Hero section' },
  { name: '02-stats',       selector: '.stats-banner', label: 'Stats strip' },
  { name: '03-pillars',     selector: '#pillars',      label: 'Functional pillars' },
  { name: '04-modules',     selector: '#modules',      label: 'Module map' },
  { name: '05-roles',       selector: '#roles',        label: 'Role model' },
  { name: '06-stack',       selector: '#stack',        label: 'Tech stack' },
  { name: '07-modules-alt', selector: '.alt-bg',       label: 'Alt-bg modules' },
  { name: '08-compare',     selector: '#compare',      label: 'Comparison table' },
  { name: '09-faq',         selector: '#faq',          label: 'FAQ' },
  { name: '10-footer-cta',  selector: '.footer-callband', label: 'Footer CTA' },
  { name: '00-full-page',   selector: null,            label: 'Full page' },
];

(async () => {
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('file:///' + HTML_FILE.replace(/\\/g, '/'));
  await page.waitForTimeout(800);

  for (const shot of SHOTS) {
    const outPath = path.join(OUT_DIR, shot.name + '.png');
    if (shot.selector === null) {
      await page.screenshot({ path: outPath, fullPage: true });
    } else {
      const el = await page.$(shot.selector);
      if (!el) { console.warn('  Selector not found: ' + shot.selector); continue; }
      await el.screenshot({ path: outPath });
    }
    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log('  ' + shot.name + '.png  (' + kb + ' KB)  — ' + shot.label);
  }

  await browser.close();
  console.log('\nAll images saved to: ' + OUT_DIR);
})();
