/**
 * capture_poster.js
 * Captures the 1600x800 poster as PNG and JPEG.
 * Run: node marketing/capture_poster.js
 */
'use strict';

const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const HTML_FILE = path.resolve(__dirname, 'poster.html');
const OUT_DIR   = path.resolve(__dirname, 'images');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  await page.setViewportSize({ width: 1600, height: 800 });
  await page.goto('file:///' + HTML_FILE.replace(/\\/g, '/'));
  await page.waitForTimeout(1000);

  const pngPath = path.join(OUT_DIR, 'product-poster.png');
  const jpgPath = path.join(OUT_DIR, 'product-poster-1600x800.jpg');

  await page.screenshot({ path: pngPath, fullPage: false, omitBackground: false });
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 92, fullPage: false, omitBackground: false });

  console.log('Saved poster PNG to ' + pngPath);
  console.log('Saved poster JPG to ' + jpgPath);
  await browser.close();
})();
