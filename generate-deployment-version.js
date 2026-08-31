#!/usr/bin/env node
'use strict';

// ─── IMPORTS ──────────────────────────────────────────────────────────────────

const http = require('http');
const fs   = require('fs');
const path = require('path');
const https = require('https');
const { exec, execSync, spawn } = require('child_process');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PORT         = Number(process.env.HUMANT_DEPLOYMENT_PORT || 3040);
const ROOT_DIR     = __dirname;
const BACKEND_DIR  = path.join(ROOT_DIR, 'backend');
const DIST_DIR     = path.join(ROOT_DIR, 'dist', 'my-app-angular');
const LAUNCHER_CFG = path.join(ROOT_DIR, 'backend', 'launcher-config.json');
const PROPS_FILE   = path.join(BACKEND_DIR, 'src', 'main', 'resources', 'application.properties');
const OUTPUT_PARENT = path.join(ROOT_DIR, 'deployment-builds');

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  running:    false,
  phase:      'idle',
  progress:   0,
  outputDir:  '',
  error:      '',
  logs:       [],
};

function addLog(level, message) {
  const clean = String(message || '').replace(/\r/g, '');
  for (const line of clean.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    state.logs.push({ at: new Date().toLocaleTimeString(), level, text: t });
  }
  if (state.logs.length > 800) state.logs.shift();
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function checkCommand(cmd, arg) {
  try { execSync((cmd + ' ' + (arg || '--version')), { stdio: 'ignore' }); return true; } catch (_) { return false; }
}

function cmdVersion(cmd, arg) {
  try { return execSync((cmd + ' ' + (arg || '--version') + ' 2>&1'), { encoding: 'utf8' }).trim(); } catch (_) { return null; }
}

function sanitize(name) {
  return String(name || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function nowTs() {
  return new Date().toISOString().replace(/[:]/g, '-').slice(0, 19);
}

function openPath(p) {
  if (!p) return;
  if (process.platform === 'win32') exec('start "" "' + p + '"');
  else if (process.platform === 'darwin') exec('open "' + p + '"');
  else exec('xdg-open "' + p + '"');
}

function openUrl(url) {
  if (process.platform === 'win32') exec('start ' + url);
  else if (process.platform === 'darwin') exec('open ' + url);
  else exec('xdg-open ' + url);
}

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────

function readLauncherConfig() {
  if (fs.existsSync(LAUNCHER_CFG)) {
    try { return JSON.parse(fs.readFileSync(LAUNCHER_CFG, 'utf8')); } catch (_) {}
  }
  return {};
}

function parsePropsFile(p) {
  const map = {};
  if (!fs.existsSync(p)) return map;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) map[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return map;
}

function stripSpringPlaceholder(v) {
  const m = String(v || '').match(/^\$\{[^:]+:(.*)\}$/);
  return m ? m[1] : (v || '');
}

function getDefaults() {
  const cfg   = readLauncherConfig();
  const props = parsePropsFile(PROPS_FILE);
  const dialect = cfg.dialect || 'postgres';
  return {
    deploymentName:   'humant-deployment-' + nowTs(),
    outputParent:     'deployment-builds',
    db: {
      dialect:  dialect,
      storage:  cfg.sqliteStorage || './humant.db',
      host:     cfg.host     || stripSpringPlaceholder(props['spring.datasource.url'] ? 'localhost' : 'localhost'),
      port:     cfg.port     || (dialect === 'mysql' ? '3306' : '5432'),
      name:     cfg.dbName   || 'humant',
      user:     cfg.username || 'postgres',
      password: cfg.password || '',
    },
    server: {
      port:       '8080',
      publicUrl:  'https://your-domain.example',
      stripeSecretKey:      '',
      stripeWebhookSecret:  '',
      stripePublishableKey: '',
      smtpHost:   '',
      smtpPort:   '587',
      smtpUser:   '',
      smtpPass:   '',
      smtpFrom:   '',
    },
  };
}

function getPrerequisites() {
  const nodeOk = checkCommand('node');
  const npmOk  = checkCommand('npm');
  const javaOk = checkCommand('java', '-version');
  return {
    node:  { installed: nodeOk, version: nodeOk ? cmdVersion('node') : null },
    npm:   { installed: npmOk,  version: npmOk  ? cmdVersion('npm')  : null },
    java:  { installed: javaOk, version: javaOk ? cmdVersion('java', '-version') : null },
    mvnw:  { installed: fs.existsSync(path.join(BACKEND_DIR, process.platform === 'win32' ? 'mvnw.cmd' : 'mvnw')) },
    angularBuild: { present: fs.existsSync(DIST_DIR) },
  };
}

// ─── BUILD PIPELINE ───────────────────────────────────────────────────────────

function runChildCommand(command, cwd) {
  return new Promise(function(resolve, reject) {
    addLog('info', 'Running: ' + command);
    var child = spawn(command, { shell: true, cwd: cwd || ROOT_DIR });
    child.stdout.on('data', function(d) { addLog('out', d.toString()); });
    child.stderr.on('data', function(d) { addLog('err', d.toString()); });
    child.on('close', function(code) {
      if (code === 0) resolve();
      else reject(new Error('Command failed (exit ' + code + '): ' + command));
    });
    child.on('error', reject);
  });
}

function buildPropertiesContent(payload) {
  var db     = payload.db     || {};
  var server = payload.server || {};
  var lines  = [
    '# Generated by generate-deployment-version.js',
    'server.port=' + (server.port || '8080'),
    '',
    '# Database',
  ];
  if (db.dialect === 'sqlite') {
    lines.push('spring.datasource.url=jdbc:sqlite:' + (db.storage || './humant.db'));
    lines.push('spring.datasource.driver-class-name=org.sqlite.JDBC');
    lines.push('spring.jpa.database-platform=org.sqlite.hibernate.dialect.SQLiteDialect');
    lines.push('spring.datasource.username=SA');
    lines.push('spring.datasource.password=');
  } else if (db.dialect === 'mysql') {
    lines.push('spring.datasource.url=jdbc:mysql://' + db.host + ':' + db.port + '/' + db.name + '?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true');
    lines.push('spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver');
    lines.push('spring.jpa.database-platform=org.hibernate.dialect.MySQL5InnoDBDialect');
    lines.push('spring.datasource.username=' + (db.user || ''));
    lines.push('spring.datasource.password=' + (db.password || ''));
  } else {
    lines.push('spring.datasource.url=jdbc:postgresql://' + (db.host || 'localhost') + ':' + (db.port || '5432') + '/' + (db.name || 'humant'));
    lines.push('spring.datasource.driver-class-name=org.postgresql.Driver');
    lines.push('spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect');
    lines.push('spring.datasource.username=' + (db.user || 'postgres'));
    lines.push('spring.datasource.password=' + (db.password || ''));
  }
  lines.push('spring.jpa.hibernate.ddl-auto=update');
  lines.push('spring.datasource.initialization-mode=always');
  lines.push('spring.sql.init.mode=always');
  lines.push('spring.jpa.defer-datasource-initialization=true');
  lines.push('');
  lines.push('# Payments');
  lines.push('stripe.secret-key=' + (server.stripeSecretKey || 'sk_live_replace_me'));
  lines.push('stripe.webhook-secret=' + (server.stripeWebhookSecret || 'whsec_replace_me'));
  lines.push('stripe.publishable-key=' + (server.stripePublishableKey || 'pk_live_replace_me'));
  lines.push('');
  lines.push('# Public URL');
  lines.push('app.base-url=' + (server.publicUrl || 'https://your-domain.example'));
  return lines.join('\n') + '\n';
}

function buildNginxConfig(port) {
  return [
    'server {',
    '    listen 80;',
    '    server_name _;',
    '    root /var/www/humant/frontend;',
    '    index index.html;',
    '    location / { try_files $uri $uri/ /index.html; }',
    '    location /api/ {',
    '        proxy_pass http://127.0.0.1:' + (port || '8080') + ';',
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '    }',
    '}',
  ].join('\n') + '\n';
}

function buildStartBat(port) {
  return '@echo off\r\nsetlocal\r\nwhere java >nul 2>nul\r\nif %errorlevel% neq 0 (\r\n  echo Java not detected. Install Java 11+\r\n  start https://adoptium.net/\r\n  exit /b 1\r\n)\r\njava -jar "%~dp0backend\\humant.jar" "--spring.config.location=file:%~dp0config\\application-production.properties" --server.port=' + (port || '8080') + '\r\npause\r\n';
}

function buildStartSh(port) {
  return '#!/usr/bin/env bash\nset -e\nROOT="$(cd "$(dirname \'${BASH_SOURCE[0]}\')" && pwd)"\nif ! command -v java >/dev/null 2>&1; then echo "Java not detected. Install Java 11+"; exit 1; fi\njava -jar "$ROOT/backend/humant.jar" "--spring.config.location=file:$ROOT/config/application-production.properties" --server.port=' + (port || '8080') + '\n';
}

function pickLatestJar() {
  var tgt = path.join(BACKEND_DIR, 'target');
  if (!fs.existsSync(tgt)) throw new Error('backend/target not found. Package the backend first.');
  var jars = fs.readdirSync(tgt).filter(function(f) { return f.endsWith('.jar') && !f.startsWith('original-'); }).map(function(f) {
    var abs = path.join(tgt, f);
    return { abs: abs, mtime: fs.statSync(abs).mtimeMs };
  }).sort(function(a, b) { return b.mtime - a.mtime; });
  if (!jars.length) throw new Error('No JAR found in backend/target. Run mvnw package first.');
  return jars[0].abs;
}

async function runGeneration(payload) {
  state.running   = true;
  state.phase     = 'Preparing';
  state.progress  = 0;
  state.error     = '';
  state.outputDir = '';
  state.logs      = [];

  var name = sanitize(payload.deploymentName || ('humant-deployment-' + nowTs()));
  var outParent = path.resolve(ROOT_DIR, payload.outputParent || 'deployment-builds');
  var outDir    = path.join(outParent, name);

  try {
    addLog('info', 'Starting deployment generation: ' + name);
    fs.mkdirSync(outParent, { recursive: true });
    if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });

    state.phase = 'Building Angular frontend'; state.progress = 10;
    await runChildCommand('npm run build -- --prod', ROOT_DIR);

    if (!fs.existsSync(DIST_DIR)) throw new Error('Angular build did not produce dist/my-app-angular.');

    state.phase = 'Packaging Spring Boot backend'; state.progress = 40;
    var mvn = process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw';
    await runChildCommand(mvn + ' -DskipTests package', BACKEND_DIR);

    state.phase = 'Assembling deployment bundle'; state.progress = 75;

    var frontendOut = path.join(outDir, 'frontend');
    var backendOut  = path.join(outDir, 'backend');
    var configOut   = path.join(outDir, 'config');
    [frontendOut, backendOut, configOut].forEach(function(d) { fs.mkdirSync(d, { recursive: true }); });

    fs.cpSync(DIST_DIR, frontendOut, { recursive: true });
    var jarSrc = pickLatestJar();
    fs.copyFileSync(jarSrc, path.join(backendOut, 'humant.jar'));

    fs.writeFileSync(path.join(configOut, 'application-production.properties'), buildPropertiesContent(payload), 'utf8');
    fs.writeFileSync(path.join(configOut, 'nginx.conf.example'), buildNginxConfig(payload.server && payload.server.port), 'utf8');
    fs.writeFileSync(path.join(outDir, 'start-backend.bat'), buildStartBat(payload.server && payload.server.port), 'utf8');
    fs.writeFileSync(path.join(outDir, 'start-backend.sh'), buildStartSh(payload.server && payload.server.port), 'utf8');
    fs.writeFileSync(path.join(outDir, 'deployment-manifest.json'), JSON.stringify({
      generatedAt:    new Date().toISOString(),
      deploymentName: name,
      outputDir:      outDir,
      publicUrl:      (payload.server || {}).publicUrl || '',
      backendPort:    (payload.server || {}).port || '8080',
      dbDialect:      (payload.db    || {}).dialect  || 'postgres',
    }, null, 2) + '\n', 'utf8');

    state.phase     = 'Completed';
    state.progress  = 100;
    state.outputDir = outDir;
    addLog('info', 'Deployment bundle created at: ' + outDir);
  } catch (err) {
    state.phase  = 'Failed';
    state.error  = err.message;
    addLog('err', 'Generation failed: ' + err.message);
  } finally {
    state.running = false;
  }
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function sendJson(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise(function(resolve, reject) {
    var buf = '';
    req.on('data', function(c) { buf += c; });
    req.on('end', function() {
      try { resolve(buf ? JSON.parse(buf) : {}); } catch (e) { reject(e); }
    });
  });
}

// ─── HTML PAGE ────────────────────────────────────────────────────────────────

function getUiHtml() {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>Humant Deployment Version Generator</title>',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />',
    '  <style>',
    '    :root { --bg:#0b1220; --panel:#101a2f; --panel2:#16233f; --line:rgba(255,255,255,0.12); --text:#f8fafc; --muted:#a5b4c8; --accent:#38bdf8; --ok:#22c55e; --warn:#f59e0b; --danger:#ef4444; }',
    '    * { box-sizing: border-box; }',
    '    body { margin:0; font-family:Manrope,system-ui,sans-serif; background:radial-gradient(circle at 0% 0%,rgba(56,189,248,0.18),transparent 35%),radial-gradient(circle at 100% 100%,rgba(34,197,94,0.12),transparent 30%),var(--bg); color:var(--text); min-height:100vh; padding:28px 18px; }',
    '    .shell { max-width:1100px; margin:0 auto; }',
    '    .hero { background:linear-gradient(135deg,rgba(56,189,248,0.16),rgba(16,26,47,0.95)); border:1px solid var(--line); border-radius:16px; padding:20px; margin-bottom:18px; }',
    '    .hero h1 { margin:0 0 8px; font-size:26px; }',
    '    .hero p { margin:0; color:var(--muted); }',
    '    .layout { display:grid; gap:16px; }',
    '    .card { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:16px; }',
    '    .card h2 { margin:0 0 12px; font-size:18px; }',
    '    .muted { color:var(--muted); font-size:13px; }',
    '    .grid { display:grid; gap:12px; }',
    '    .grid.two { grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }',
    '    .grid.three { grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); }',
    '    label { display:block; font-weight:700; font-size:12px; margin-bottom:6px; color:#d9e7ff; }',
    '    input,select,textarea { width:100%; border:1px solid var(--line); border-radius:10px; padding:10px 11px; background:var(--panel2); color:#fff; font-family:inherit; font-size:14px; }',
    '    textarea { min-height:90px; font-family:"IBM Plex Mono",Consolas,monospace; }',
    '    .row { margin-bottom:10px; }',
    '    .inline { display:flex; align-items:center; gap:8px; margin:4px 0; }',
    '    .inline input[type="checkbox"] { width:auto; }',
    '    .db-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:12px; }',
    '    .db-card { border:1px solid var(--line); border-radius:12px; padding:16px; text-align:center; cursor:pointer; transition:all .2s; }',
    '    .db-card:hover { border-color:var(--accent); background:rgba(56,189,248,.06); }',
    '    .db-card.sel { border-color:var(--accent); background:rgba(56,189,248,.12); }',
    '    .db-card span { font-size:28px; display:block; margin-bottom:6px; }',
    '    .db-card strong { font-size:14px; display:block; }',
    '    .db-card small { color:var(--muted); font-size:11px; }',
    '    .prereq-grid { display:grid; gap:8px; }',
    '    .prereq-row { display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,.15); border:1px solid var(--line); border-radius:10px; padding:12px 14px; }',
    '    .prereq-row h5 { margin:0 0 2px; font-size:14px; }',
    '    .prereq-row p  { margin:0; font-size:11px; color:var(--muted); }',
    '    .ok   { color:#86efac; } .warn { color:#fcd34d; } .danger { color:#fca5a5; }',
    '    .prog-bar-bg { width:100%; height:10px; border-radius:99px; background:rgba(255,255,255,.06); border:1px solid var(--line); overflow:hidden; margin:10px 0; }',
    '    .prog-bar-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--ok)); transition:width .4s; }',
    '    .log-box { background:#020408; border:1px solid var(--line); border-radius:10px; height:220px; overflow-y:auto; padding:12px; font-family:"IBM Plex Mono",Consolas,monospace; font-size:11px; color:#10b981; white-space:pre-wrap; }',
    '    .result { border:1px solid var(--line); border-radius:12px; padding:12px; background:rgba(0,0,0,.22); font-family:"IBM Plex Mono",Consolas,monospace; font-size:12px; white-space:pre-wrap; min-height:60px; color:var(--muted); }',
    '    .actions { position:sticky; bottom:0; background:rgba(11,18,32,.95); backdrop-filter:blur(6px); border:1px solid var(--line); border-radius:12px; padding:12px; display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }',
    '    button { border:0; border-radius:10px; padding:10px 16px; font-weight:800; cursor:pointer; color:#06213a; background:var(--accent); font-family:inherit; font-size:14px; }',
    '    button.secondary { color:#fff; background:rgba(255,255,255,.08); border:1px solid var(--line); }',
    '    button:disabled { opacity:.5; cursor:not-allowed; }',
    '    @media(max-width:640px){ .db-cards,.grid.two,.grid.three { grid-template-columns:1fr; } }',
    '  </style>',
    '</head>',
    '<body>',
    '<div class="shell">',
    '',
    '  <div class="hero">',
    '    <h1>&#128640; Humant Deployment Version Generator</h1>',
    '    <p>Builds the Angular frontend, packages the Spring Boot backend JAR, and exports a ready-to-deploy bundle with config templates and start scripts.</p>',
    '  </div>',
    '',
    '  <div class="layout">',
    '',
    '    <!-- PREREQUISITES -->',
    '    <div class="card">',
    '      <h2>System Prerequisites</h2>',
    '      <div class="prereq-grid" id="prereq-grid">',
    '        <div class="prereq-row"><div><h5>Checking...</h5></div></div>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- DATABASE -->',
    '    <div class="card">',
    '      <h2>Database Configuration</h2>',
    '      <p class="muted" style="margin-bottom:14px;">Choose the database dialect for the deployment. SQLite requires no external server. PostgreSQL and MySQL need host credentials.</p>',
    '      <div class="db-cards">',
    '        <div id="db-sqlite"   class="db-card sel"   onclick="selectDb(\'sqlite\')">   <span>&#128447;&#65039;</span><strong>SQLite</strong><small>Zero-config file database</small></div>',
    '        <div id="db-postgres" class="db-card"       onclick="selectDb(\'postgres\')"> <span>&#128309;</span><strong>PostgreSQL</strong><small>Enterprise production DB</small></div>',
    '        <div id="db-mysql"    class="db-card"       onclick="selectDb(\'mysql\')">    <span>&#128044;</span><strong>MySQL</strong><small>Widely-supported server DB</small></div>',
    '      </div>',
    '      <div id="form-sqlite">',
    '        <div class="row"><label>SQLite Storage File Path</label><input id="db-storage" value="./humant.db" /></div>',
    '      </div>',
    '      <div id="form-network" style="display:none;">',
    '        <div class="grid two">',
    '          <div class="row"><label>Host</label><input id="db-host" value="localhost" /></div>',
    '          <div class="row"><label>Port</label><input id="db-port" value="5432" /></div>',
    '        </div>',
    '        <div class="row"><label>Database Name</label><input id="db-name" value="humant" /></div>',
    '        <div class="grid two">',
    '          <div class="row"><label>Username</label><input id="db-user" value="postgres" /></div>',
    '          <div class="row"><label>Password</label><input id="db-pass" type="password" value="" /></div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- SERVER SETTINGS -->',
    '    <div class="card">',
    '      <h2>Server &amp; Deployment Settings</h2>',
    '      <div class="grid two">',
    '        <div class="row"><label>Deployment Name</label><input id="dep-name" /></div>',
    '        <div class="row"><label>Output Parent Folder</label><input id="dep-parent" value="deployment-builds" /></div>',
    '        <div class="row"><label>Public Base URL</label><input id="srv-url" placeholder="https://your-domain.example" /></div>',
    '        <div class="row"><label>Backend Port</label><input id="srv-port" value="8080" /></div>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- CREDENTIALS -->',
    '    <div class="card">',
    '      <h2>Payment &amp; Email Credentials</h2>',
    '      <p class="muted" style="margin-bottom:14px;">These values are written into application-production.properties inside the bundle. Leave blank to use placeholder values you can fill in later.</p>',
    '      <div class="grid three">',
    '        <div class="row"><label>Stripe Secret Key</label><input id="stripe-sk" placeholder="sk_live_..." /></div>',
    '        <div class="row"><label>Stripe Publishable Key</label><input id="stripe-pk" placeholder="pk_live_..." /></div>',
    '        <div class="row"><label>Stripe Webhook Secret</label><input id="stripe-wh" placeholder="whsec_..." /></div>',
    '        <div class="row"><label>SMTP Host</label><input id="smtp-host" placeholder="smtp.example.com" /></div>',
    '        <div class="row"><label>SMTP Port</label><input id="smtp-port" value="587" /></div>',
    '        <div class="row"><label>SMTP User</label><input id="smtp-user" placeholder="you@example.com" /></div>',
    '        <div class="row"><label>SMTP Password</label><input id="smtp-pass" type="password" /></div>',
    '        <div class="row"><label>SMTP From Address</label><input id="smtp-from" placeholder="no-reply@example.com" /></div>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- PROGRESS -->',
    '    <div class="card" id="progress-card" style="display:none;">',
    '      <h2>Generation Progress</h2>',
    '      <p id="phase-label" class="muted">Initializing...</p>',
    '      <div class="prog-bar-bg"><div id="prog-fill" class="prog-bar-fill" style="width:0%"></div></div>',
    '      <div class="log-box" id="log-box">Ready...</div>',
    '    </div>',
    '',
    '    <!-- RESULT -->',
    '    <div class="card" id="result-card" style="display:none;">',
    '      <h2>Generation Result</h2>',
    '      <div id="result-box" class="result"></div>',
    '    </div>',
    '',
    '    <div class="actions">',
    '      <button id="btn-generate" onclick="startGeneration()">&#9889; Generate Deployment Bundle</button>',
    '      <button class="secondary" id="btn-open" onclick="openOutput()" disabled>Open Output Folder</button>',
    '      <button class="secondary" onclick="refreshPrereqs()">&#8635; Refresh</button>',
    '    </div>',
    '',
    '  </div>',
    '</div>',
    '',
    '<script>',
    '  var selectedDb = "sqlite";',
    '  var pollTimer  = null;',
    '',
    '  window.addEventListener("DOMContentLoaded", function() {',
    '    refreshPrereqs();',
    '    fillDefaults();',
    '  });',
    '',
    '  function fillDefaults() {',
    '    fetch("/api/status").then(function(r) { return r.json(); }).then(function(data) {',
    '      var d = data.defaults;',
    '      if (!d) return;',
    '      document.getElementById("dep-name").value   = d.deploymentName || "";',
    '      document.getElementById("dep-parent").value = d.outputParent   || "deployment-builds";',
    '      document.getElementById("srv-url").value    = (d.server && d.server.publicUrl) || "";',
    '      document.getElementById("srv-port").value   = (d.server && d.server.port)      || "8080";',
    '      if (d.db) {',
    '        selectDb(d.db.dialect || "sqlite");',
    '        document.getElementById("db-storage").value = d.db.storage || "./humant.db";',
    '        document.getElementById("db-host").value    = d.db.host    || "localhost";',
    '        document.getElementById("db-port").value    = d.db.port    || "5432";',
    '        document.getElementById("db-name").value    = d.db.name    || "humant";',
    '        document.getElementById("db-user").value    = d.db.user    || "postgres";',
    '      }',
    '    }).catch(function() {});',
    '  }',
    '',
    '  function selectDb(d) {',
    '    selectedDb = d;',
    '    ["sqlite","postgres","mysql"].forEach(function(c) {',
    '      var el = document.getElementById("db-" + c);',
    '      if (c === d) el.classList.add("sel"); else el.classList.remove("sel");',
    '    });',
    '    var sf = document.getElementById("form-sqlite");',
    '    var nf = document.getElementById("form-network");',
    '    if (d === "sqlite") { sf.style.display = "block"; nf.style.display = "none"; }',
    '    else {',
    '      sf.style.display = "none"; nf.style.display = "block";',
    '      document.getElementById("db-port").value = (d === "mysql") ? "3306" : "5432";',
    '    }',
    '  }',
    '',
    '  function refreshPrereqs() {',
    '    fetch("/api/status").then(function(r) { return r.json(); }).then(function(data) {',
    '      var p = data.prerequisites;',
    '      var html = "";',
    '      function row(name, desc, ok, ver) {',
    '        var badge = ok ? "<span class=\\"ok\\">&#10003; " + (ver || "Installed") + "</span>" : "<span class=\\"danger\\">&#10060; Missing</span>";',
    '        return "<div class=\\"prereq-row\\"><div><h5>" + name + "</h5><p>" + desc + "</p></div><div>" + badge + "</div></div>";',
    '      }',
    '      html += row("Node.js", "Required to run this generator and npm scripts.", p.node.installed, p.node.version);',
    '      html += row("npm",     "Required to build the Angular frontend.", p.npm.installed, p.npm.version);',
    '      html += row("Java 11+", "Required to package the Spring Boot backend.", p.java.installed, p.java.version);',
    '      html += row("Maven Wrapper", "backend/mvnw or mvnw.cmd for packaging without global Maven.", p.mvnw.installed, p.mvnw.installed ? "Detected" : null);',
    '      html += row("Angular Build", "dist/my-app-angular (will be built fresh if missing).", p.angularBuild.present, p.angularBuild.present ? "Present" : null);',
    '      document.getElementById("prereq-grid").innerHTML = html;',
    '    }).catch(function() {});',
    '  }',
    '',
    '  function collectPayload() {',
    '    var payload = {',
    '      deploymentName: document.getElementById("dep-name").value,',
    '      outputParent:   document.getElementById("dep-parent").value,',
    '      db: { dialect: selectedDb },',
    '      server: {',
    '        port:      document.getElementById("srv-port").value,',
    '        publicUrl: document.getElementById("srv-url").value,',
    '        stripeSecretKey:      document.getElementById("stripe-sk").value,',
    '        stripePublishableKey: document.getElementById("stripe-pk").value,',
    '        stripeWebhookSecret:  document.getElementById("stripe-wh").value,',
    '        smtpHost: document.getElementById("smtp-host").value,',
    '        smtpPort: document.getElementById("smtp-port").value,',
    '        smtpUser: document.getElementById("smtp-user").value,',
    '        smtpPass: document.getElementById("smtp-pass").value,',
    '        smtpFrom: document.getElementById("smtp-from").value,',
    '      },',
    '    };',
    '    if (selectedDb === "sqlite") {',
    '      payload.db.storage = document.getElementById("db-storage").value;',
    '    } else {',
    '      payload.db.host     = document.getElementById("db-host").value;',
    '      payload.db.port     = document.getElementById("db-port").value;',
    '      payload.db.name     = document.getElementById("db-name").value;',
    '      payload.db.user     = document.getElementById("db-user").value;',
    '      payload.db.password = document.getElementById("db-pass").value;',
    '    }',
    '    return payload;',
    '  }',
    '',
    '  async function startGeneration() {',
    '    var btn = document.getElementById("btn-generate");',
    '    btn.disabled = true;',
    '    document.getElementById("progress-card").style.display = "block";',
    '    document.getElementById("result-card").style.display   = "none";',
    '    try {',
    '      await fetch("/api/generate", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(collectPayload()) });',
    '      pollTimer = setInterval(pollState, 1000);',
    '    } catch(e) {',
    '      btn.disabled = false;',
    '      alert("Error starting generation: " + e.message);',
    '    }',
    '  }',
    '',
    '  function pollState() {',
    '    fetch("/api/status").then(function(r) { return r.json(); }).then(function(data) {',
    '      var g = data.generation;',
    '      document.getElementById("phase-label").innerText = g.phase || "...";',
    '      document.getElementById("prog-fill").style.width = (g.progress || 0) + "%";',
    '      var box = document.getElementById("log-box");',
    '      var near = box.scrollHeight - box.clientHeight - box.scrollTop < 40;',
    '      box.innerText = g.logs.map(function(l) { return "[" + l.at + "] " + l.text; }).join("\\n");',
    '      if (near) box.scrollTop = box.scrollHeight;',
    '      if (!g.running) {',
    '        clearInterval(pollTimer);',
    '        document.getElementById("btn-generate").disabled = false;',
    '        document.getElementById("result-card").style.display = "block";',
    '        var rb = document.getElementById("result-box");',
    '        if (g.error) {',
    '          rb.innerHTML = "<span class=\\"danger\\">&#10060; Generation failed:</span>\\n" + g.error;',
    '        } else {',
    '          rb.innerHTML = "<span class=\\"ok\\">&#10003; Bundle created at:</span>\\n" + g.outputDir;',
    '          document.getElementById("btn-open").disabled = false;',
    '        }',
    '      }',
    '    }).catch(function() {});',
    '  }',
    '',
    '  function openOutput() {',
    '    fetch("/api/open-output", { method: "POST" }).catch(function() {});',
    '  }',
    '</' + 'script>',
    '</body>',
    '</html>',
  ].join('\n');
}

// ─── HTTP SERVER ──────────────────────────────────────────────────────────────

var server = http.createServer(function(req, res) {
  var urlObj   = new URL(req.url, 'http://' + req.headers.host);
  var pathname = urlObj.pathname;
  var method   = req.method;

  if (pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      defaults:      getDefaults(),
      prerequisites: getPrerequisites(),
      generation: {
        running:   state.running,
        phase:     state.phase,
        progress:  state.progress,
        outputDir: state.outputDir,
        error:     state.error,
        logs:      state.logs.slice(-200),
      },
    }));
  }

  if (pathname === '/api/generate' && method === 'POST') {
    if (!state.running) {
      readBody(req).then(function(payload) {
        runGeneration(payload).catch(function() {});
      }).catch(function() {});
    }
    res.writeHead(202, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (pathname === '/api/open-output' && method === 'POST') {
    openPath(state.outputDir);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(getUiHtml());
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// ─── STARTUP ──────────────────────────────────────────────────────────────────

server.listen(PORT, 'localhost', function() {
  console.log('================================================================');
  console.log(' Humant Deployment Version Generator is active!');
  console.log('================================================================');
  console.log(' URL: http://localhost:' + PORT);
  console.log('================================================================');
  try { openUrl('http://localhost:' + PORT); } catch (_) {}
});
