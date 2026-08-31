/**
 * capture_cover_banner.js
 * Captures the 590x300 cover banner as a JPEG.
 * Run: node marketing/capture_cover_banner.js
 */
'use strict';

const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const HTML_FILE = path.resolve(__dirname, 'cover-banner.html');
const OUT_DIR   = path.resolve(__dirname, 'images');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  await page.setViewportSize({ width: 590, height: 300 });
  await page.goto('file:///' + HTML_FILE.replace(/\\/g, '/'));
  await page.waitForTimeout(1000);

  const outPath = path.join(OUT_DIR, 'cover-banner.jpg');
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 92, omitBackground: false });

  console.log('Saved cover banner to ' + outPath);
  await browser.close();
})();
