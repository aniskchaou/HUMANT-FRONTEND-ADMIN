#!/usr/bin/env node
'use strict';

// ─── IMPORTS ─────────────────────────────────────────────────────────────────

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { exec, execSync, spawn } = require('child_process');

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PORT         = Number(process.env.HUMANT_LAUNCHER_PORT || 3030);
const ROOT_DIR     = __dirname;
const BACKEND_DIR  = path.join(ROOT_DIR, 'backend');
const LAUNCHER_CFG = path.join(ROOT_DIR, 'backend', 'launcher-config.json');

const DEFAULT_CFG = {
  dialect:       'sqlite',
  sqliteStorage: './humant.db',
  host:          'localhost',
  port:          '5432',
  dbName:        'humant',
  username:      'postgres',
  password:      '',
};

// ─── STATE ───────────────────────────────────────────────────────────────────

let backendProcess   = null;
let frontendProcess  = null;
let isInstalling     = false;
let installProgress  = 0;
let activeLogs       = [];

function addLog(source, text) {
  const clean = String(text || '').replace(/\r/g, '');
  for (const line of clean.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    activeLogs.push({ timestamp: new Date().toLocaleTimeString(), source, text: t });
  }
  if (activeLogs.length > 500) activeLogs.shift();
}

// ─── PREREQUISITES ───────────────────────────────────────────────────────────

function checkCommand(cmd, arg) {
  const a = arg || '--version';
  try { execSync(cmd + ' ' + a, { stdio: 'ignore' }); return true; } catch (_) { return false; }
}

function commandVersion(cmd, arg) {
  const a = arg || '--version';
  try { return execSync(cmd + ' ' + a + ' 2>&1', { encoding: 'utf8' }).trim(); } catch (_) { return null; }
}

function getPreReqStatus() {
  const nodeOk = checkCommand('node');
  const npmOk  = checkCommand('npm');
  const gitOk  = checkCommand('git');
  const javaOk = checkCommand('java', '-version');
  return {
    node: { installed: nodeOk, version: nodeOk ? commandVersion('node') : 'Not Installed' },
    npm:  { installed: npmOk,  version: npmOk  ? commandVersion('npm')  : 'Not Installed' },
    git:  { installed: gitOk,  version: gitOk  ? 'Installed'            : 'Not Installed' },
    java: { installed: javaOk, version: javaOk ? commandVersion('java', '-version') : 'Not Installed' },
    allPassed: nodeOk && npmOk && javaOk,
  };
}

// ─── AUTO-INSTALL ─────────────────────────────────────────────────────────────

function autoInstallSoftware(software) {
  addLog('Software Installer', 'Attempting to automatically install ' + software + '...');
  return new Promise(function(resolve) {
    var cmd = '';
    if (process.platform === 'win32') {
      if (software === 'node')     cmd = 'winget install OpenJS.NodeJS -h --accept-source-agreements --accept-package-agreements';
      else if (software === 'git') cmd = 'winget install Git.Git -h --accept-source-agreements --accept-package-agreements';
      else if (software === 'java') cmd = 'winget install EclipseAdoptium.Temurin.11.JDK -h --accept-source-agreements --accept-package-agreements';
      else if (software === 'postgres') cmd = 'winget install PostgreSQL.PostgreSQL -h --accept-source-agreements --accept-package-agreements';
      else if (software === 'mysql')    cmd = 'winget install Oracle.MySQL -h --accept-source-agreements --accept-package-agreements';
    } else if (process.platform === 'darwin') {
      if (software === 'node')     cmd = 'brew install node';
      else if (software === 'git') cmd = 'brew install git';
      else if (software === 'java') cmd = 'brew install openjdk@11';
      else if (software === 'postgres') cmd = 'brew install postgresql';
      else if (software === 'mysql')    cmd = 'brew install mysql';
    } else {
      if (software === 'node')     cmd = 'sudo apt-get update && sudo apt-get install -y nodejs npm';
      else if (software === 'git') cmd = 'sudo apt-get update && sudo apt-get install -y git';
      else if (software === 'java') cmd = 'sudo apt-get update && sudo apt-get install -y openjdk-11-jdk';
      else if (software === 'postgres') cmd = 'sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib';
      else if (software === 'mysql')    cmd = 'sudo apt-get update && sudo apt-get install -y mysql-server';
    }
    if (!cmd) {
      addLog('Software Installer', 'Auto-install not supported for ' + software + ' on this platform.');
      return resolve(false);
    }
    addLog('Software Installer', 'Running: ' + cmd);
    exec(cmd, function(err, stdout, stderr) {
      if (err) { addLog('Software Installer', 'Installation failed: ' + err.message); resolve(false); }
      else      { addLog('Software Installer', software + ' installed successfully.'); resolve(true); }
    });
  });
}

// ─── LAUNCHER DB CONFIG ───────────────────────────────────────────────────────

function readLauncherConfig() {
  if (fs.existsSync(LAUNCHER_CFG)) {
    try { return Object.assign({}, DEFAULT_CFG, JSON.parse(fs.readFileSync(LAUNCHER_CFG, 'utf8'))); } catch (_) {}
  }
  return Object.assign({}, DEFAULT_CFG);
}

function writeLauncherConfig(cfg) {
  try {
    fs.mkdirSync(path.dirname(LAUNCHER_CFG), { recursive: true });
    fs.writeFileSync(LAUNCHER_CFG, JSON.stringify(Object.assign({}, DEFAULT_CFG, cfg), null, 2), 'utf8');
    return true;
  } catch (err) {
    addLog('Launcher', 'Error saving config: ' + err.message);
    return false;
  }
}

function buildDbEnvVars(cfg) {
  if (cfg.dialect === 'sqlite') {
    return {
      HUMANT_DATASOURCE_URL:      'jdbc:sqlite:' + (cfg.sqliteStorage || './humant.db'),
      HUMANT_DATASOURCE_DRIVER:   'org.sqlite.JDBC',
      HUMANT_JPA_DIALECT:         'org.sqlite.hibernate.dialect.SQLiteDialect',
      HUMANT_DATASOURCE_USERNAME: 'SA',
      HUMANT_DATASOURCE_PASSWORD: '',
    };
  }
  if (cfg.dialect === 'mysql') {
    return {
      HUMANT_DATASOURCE_URL:      'jdbc:mysql://' + cfg.host + ':' + cfg.port + '/' + cfg.dbName + '?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true',
      HUMANT_DATASOURCE_DRIVER:   'com.mysql.cj.jdbc.Driver',
      HUMANT_JPA_DIALECT:         'org.hibernate.dialect.MySQL5InnoDBDialect',
      HUMANT_DATASOURCE_USERNAME: cfg.username,
      HUMANT_DATASOURCE_PASSWORD: cfg.password,
    };
  }
  return {
    HUMANT_DATASOURCE_URL:      'jdbc:postgresql://' + cfg.host + ':' + cfg.port + '/' + cfg.dbName,
    HUMANT_DATASOURCE_DRIVER:   'org.postgresql.Driver',
    HUMANT_JPA_DIALECT:         'org.hibernate.dialect.PostgreSQLDialect',
    HUMANT_DATASOURCE_USERNAME: cfg.username,
    HUMANT_DATASOURCE_PASSWORD: cfg.password,
  };
}

// ─── DEPENDENCY INSTALLER ─────────────────────────────────────────────────────

function runDependencyInstaller() {
  if (isInstalling) return;
  isInstalling    = true;
  installProgress = 5;
  addLog('Installer', 'Starting npm install --legacy-peer-deps for Angular frontend dependencies...');

  // --legacy-peer-deps required: angular-datatables@10 has a peer dep conflict with Angular 11
  const child = spawn('npm', ['install', '--legacy-peer-deps'], { shell: true, cwd: ROOT_DIR });

  child.stdout.on('data', function(d) { addLog('NPM', d.toString()); if (installProgress < 90) installProgress += 4; });
  child.stderr.on('data', function(d) { addLog('NPM Warning', d.toString()); });
  child.on('close', function(code) {
    isInstalling = false;
    if (code === 0) {
      installProgress = 100;
      addLog('Installer', 'Frontend dependencies installed successfully.');
    } else {
      installProgress = 0;
      addLog('Installer', 'Dependency install failed (exit code ' + code + ').');
    }
  });
}

// ─── APP START / STOP ─────────────────────────────────────────────────────────

function startApplication() {
  if (backendProcess || frontendProcess) {
    addLog('Launcher', 'Application is already running.');
    return;
  }

  const cfg    = readLauncherConfig();
  const dbEnv  = buildDbEnvVars(cfg);
  const spawnEnv = Object.assign({}, process.env, dbEnv);

  addLog('Launcher', 'Starting Spring Boot backend on port 8080 (dialect: ' + cfg.dialect + ')...');

  const mvnCmd = process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw';
  backendProcess = spawn(mvnCmd, ['spring-boot:run'], { shell: true, cwd: BACKEND_DIR, env: spawnEnv });
  backendProcess.stdout.on('data', function(d) { addLog('Backend', d.toString()); });
  backendProcess.stderr.on('data', function(d) { addLog('Backend', d.toString()); });
  backendProcess.on('close', function(code) {
    addLog('Backend', 'Backend stopped (exit code ' + code + ').');
    backendProcess = null;
  });

  addLog('Launcher', 'Starting Angular frontend on port 4201...');
  frontendProcess = spawn('npm', ['run', 'serve', '--', '--port', '4201'], { shell: true, cwd: ROOT_DIR });
  frontendProcess.stdout.on('data', function(d) { addLog('Frontend', d.toString()); });
  frontendProcess.stderr.on('data', function(d) { addLog('Frontend', d.toString()); });
  frontendProcess.on('close', function(code) {
    addLog('Frontend', 'Frontend stopped (exit code ' + code + ').');
    frontendProcess = null;
  });
}

function stopApplication() {
  addLog('Launcher', 'Shutting down services...');
  if (backendProcess) {
    try {
      if (process.platform === 'win32') execSync('taskkill /pid ' + backendProcess.pid + ' /T /F', { stdio: 'ignore' });
      else backendProcess.kill();
    } catch (_) {}
    backendProcess = null;
    addLog('Launcher', 'Backend stopped.');
  }
  if (frontendProcess) {
    try {
      if (process.platform === 'win32') execSync('taskkill /pid ' + frontendProcess.pid + ' /T /F', { stdio: 'ignore' });
      else frontendProcess.kill();
    } catch (_) {}
    frontendProcess = null;
    addLog('Launcher', 'Frontend stopped.');
  }
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function sendJson(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
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

// ─── HTML PAGE ───────────────────────────────────────────────────────────────

function getHtmlContent() {
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>Humant \u2014 Universal GUI Launcher Panel</title>',
    '  <link rel="preconnect" href="https://fonts.googleapis.com">',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">',
    '  <style>',
    '    :root {',
    '      --bg-dim: #090e1a; --bg-card: #0f172a;',
    '      --text-main: #f8fafc; --text-muted: #94a3b8;',
    '      --accent-blue: #3b82f6; --accent-green: #10b981; --accent-red: #ef4444;',
    '      --border-soft: rgba(255,255,255,0.08);',
    '      --font-mono: "IBM Plex Mono", Consolas, monospace;',
    '    }',
    '    * { box-sizing: border-box; margin: 0; padding: 0; }',
    '    body {',
    '      background: var(--bg-dim);',
    '      background-image: radial-gradient(circle at 10% 10%, rgba(59,130,246,.12) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(16,185,129,.08) 0%, transparent 60%);',
    '      color: var(--text-main); font-family: "Manrope", system-ui, sans-serif; min-height: 100vh; padding: 40px 20px;',
    '    }',
    '    .launcher-shell { max-width: 900px; margin: 0 auto; }',
    '    header { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-soft); border-radius: 16px; padding: 24px; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(0,0,0,.5); }',
    '    .brand-group { display: flex; align-items: center; gap: 16px; }',
    '    .brand-icon { font-size: 38px; }',
    '    .brand-title { font-size: 26px; font-weight: 800; letter-spacing: -.02em; }',
    '    .status-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.04); padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; border: 1px solid var(--border-soft); }',
    '    .status-dot { width: 8px; height: 8px; border-radius: 50%; }',
    '    .status-dot.glowing-green { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green); }',
    '    .status-dot.glowing-red   { background: var(--accent-red);   box-shadow: 0 0 10px var(--accent-red); }',
    '    .wizard-card { background: var(--bg-card); border: 1px solid var(--border-soft); border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,.6); margin-bottom: 30px; }',
    '    .step-navigation { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 35px; border-bottom: 1.5px solid var(--border-soft); padding-bottom: 15px; }',
    '    .navigation-bullet { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; transition: all .2s; padding: 8px 12px; border-radius: 8px; }',
    '    .navigation-bullet:hover { color: #fff; background: rgba(255,255,255,.02); }',
    '    .navigation-bullet.active-bullet { color: var(--accent-blue); }',
    '    .navigation-bullet.active-bullet .bullet-digit { background: var(--accent-blue); color: #fff; }',
    '    .bullet-digit { background: rgba(255,255,255,.08); color: var(--text-muted); border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }',
    '    .wizard-pane { display: none; }',
    '    .wizard-pane.active-pane { display: block; }',
    '    .pane-title { font-size: 20px; font-weight: 800; margin-bottom: 10px; }',
    '    .pane-subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 25px; line-height: 1.5; }',
    '    .requirement-box { display: grid; gap: 15px; margin-bottom: 25px; }',
    '    .requirement-row { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,.15); border: 1px solid var(--border-soft); padding: 16px 20px; border-radius: 12px; }',
    '    .row-meta h5 { font-size: 15px; font-weight: 700; }',
    '    .row-meta p  { font-size: 12px; color: var(--text-muted); margin-top: 4px; }',
    '    .badge-passed { color: var(--accent-green); font-weight: bold; }',
    '    .badge-missing { color: var(--accent-red); font-weight: bold; }',
    '    .db-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }',
    '    .db-card-option { background: rgba(0,0,0,.15); border: 1px solid var(--border-soft); border-radius: 14px; padding: 24px; text-align: center; cursor: pointer; transition: all .2s; }',
    '    .db-card-option:hover { border-color: rgba(255,255,255,.15); background: rgba(255,255,255,.02); }',
    '    .db-card-option.selected-db { border-color: var(--accent-blue); background: rgba(59,130,246,.1); }',
    '    .db-card-icon { font-size: 32px; margin-bottom: 12px; display: block; }',
    '    .db-card-option h4 { font-weight: 800; font-size: 16px; }',
    '    .db-card-desc { font-size: 11px; color: var(--text-muted); margin-top: 6px; }',
    '    .db-form-fields { background: rgba(0,0,0,.1); border: 1px solid var(--border-soft); border-radius: 12px; padding: 24px; margin-top: 25px; }',
    '    .form-group { margin-bottom: 16px; }',
    '    .form-group label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }',
    '    .form-control { width: 100%; background: rgba(0,0,0,.3); border: 1px solid var(--border-soft); padding: 11px 14px; border-radius: 8px; color: #fff; font-family: inherit; font-size: 14px; }',
    '    .form-control:focus { outline: none; border-color: var(--accent-blue); }',
    '    .form-row-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }',
    '    .form-row-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }',
    '    .installer-container { text-align: center; padding: 40px 0; }',
    '    .install-bar-bg { width: 100%; height: 12px; background: rgba(255,255,255,.05); border-radius: 99px; overflow: hidden; margin: 20px 0; border: 1px solid var(--border-soft); }',
    '    .install-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-green) 100%); transition: width .3s; }',
    '    .launch-console { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }',
    '    .console-card { border-radius: 14px; padding: 24px; border: 1px solid var(--border-soft); background: rgba(0,0,0,.15); text-align: center; }',
    '    .link-box { background: rgba(16,185,129,.05); border: 1px solid rgba(16,185,129,.15); border-radius: 12px; padding: 20px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center; }',
    '    .btn { width: 100%; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: .05em; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: all .2s cubic-bezier(.4,0,.2,1); }',
    '    .btn-blue  { background: var(--accent-blue);  color: #fff; box-shadow: 0 4px 15px rgba(59,130,246,.3); }',
    '    .btn-blue:hover  { background: #2563eb; transform: translateY(-1px); }',
    '    .btn-green { background: var(--accent-green); color: #fff; box-shadow: 0 4px 15px rgba(16,185,129,.3); }',
    '    .btn-green:hover { background: #059669; transform: translateY(-1px); }',
    '    .btn-red   { background: var(--accent-red);   color: #fff; box-shadow: 0 4px 15px rgba(239,68,68,.3); }',
    '    .btn-red:hover   { background: #dc2626; transform: translateY(-1px); }',
    '    .btn-secondary { background: rgba(255,255,255,.06); color: #fff; border: 1px solid var(--border-soft); }',
    '    .btn-secondary:hover { background: rgba(255,255,255,.1); }',
    '    .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }',
    '    .db-suggest-box { background: rgba(16,185,129,.06); border: 1px solid rgba(16,185,129,.15); border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }',
    '    .log-panel { margin-top: 25px; }',
    '    .log-header { display: flex; justify-content: space-between; align-items: center; background: #090c15; padding: 10px 18px; border-radius: 10px 10px 0 0; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: .1em; border: 1px solid var(--border-soft); border-bottom: none; color: var(--text-muted); }',
    '    .log-console-box { background: #020408; border: 1px solid var(--border-soft); border-radius: 0 0 10px 10px; height: 280px; overflow-y: auto; padding: 15px; font-family: var(--font-mono); font-size: 12px; line-height: 1.5; color: #10b981; }',
    '    .log-row { margin-bottom: 4px; white-space: pre-wrap; word-break: break-all; }',
    '    .log-row .log-time   { color: #475569; margin-right: 10px; }',
    '    .log-row .log-source { background: rgba(255,255,255,.06); padding: 1px 6px; border-radius: 4px; margin-right: 10px; font-size: 10px; font-weight: bold; }',
    '    .log-row.src-Launcher  .log-source { color: #f19500; }',
    '    .log-row.src-Backend   .log-source { color: #3b82f6; }',
    '    .log-row.src-Frontend  .log-source { color: #b700f1; }',
    '    .log-row.src-Installer .log-source, .log-row.src-NPM .log-source { color: #10b981; }',
    '    .log-row.src-SoftwareInstaller .log-source { color: #f59e0b; }',
    '  </style>',
    '</head>',
    '<body>',
    '<div class="launcher-shell">',
    '',
    '  <header>',
    '    <div class="brand-group">',
    '      <span class="brand-icon">&#128640;</span>',
    '      <div>',
    '        <h1 class="brand-title">Humant</h1>',
    '        <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">Universal Control Panel Launcher</p>',
    '      </div>',
    '    </div>',
    '    <div>',
    '      <div class="status-badge">',
    '        <span id="app-status-dot" class="status-dot glowing-red"></span>',
    '        <span id="app-status-text">Stopped</span>',
    '      </div>',
    '    </div>',
    '  </header>',
    '',
    '  <div class="wizard-card">',
    '    <div class="step-navigation">',
    '      <button onclick="gotoStep(1)" id="bullet-1" class="navigation-bullet active-bullet"><span class="bullet-digit">1</span> Requirements Check</button>',
    '      <button onclick="gotoStep(2)" id="bullet-2" class="navigation-bullet"><span class="bullet-digit">2</span> Setup Database</button>',
    '      <button onclick="gotoStep(3)" id="bullet-3" class="navigation-bullet"><span class="bullet-digit">3</span> Install Packages</button>',
    '      <button onclick="gotoStep(4)" id="bullet-4" class="navigation-bullet"><span class="bullet-digit">4</span> Launch Centers</button>',
    '    </div>',
    '',
    '    <!-- STEP 1 -->',
    '    <div id="pane-1" class="wizard-pane active-pane">',
    '      <h3 class="pane-title">Prerequisites Scan &amp; Auto-Install</h3>',
    '      <p class="pane-subtitle">Before running Humant, your system must have Node.js, npm, and Java 11+ installed. Click <strong>Auto-Install</strong> next to any missing item to install it via your OS package manager.</p>',
    '      <div class="requirement-box">',
    '        <div class="requirement-row">',
    '          <div class="row-meta"><h5>Node.js Runtime</h5><p>Required to run this launcher and Angular CLI tooling.</p></div>',
    '          <div style="display:flex;align-items:center;gap:10px;">',
    '            <button id="btn-install-node" onclick="triggerAutoInstall(\'node\')" class="btn btn-secondary" style="width:auto;padding:6px 12px;font-size:11px;display:none;">Auto-Install</button>',
    '            <div id="node-badge">Scanning...</div>',
    '          </div>',
    '        </div>',
    '        <div class="requirement-row">',
    '          <div class="row-meta"><h5>NPM Package Manager</h5><p>Downloads Angular frontend packages.</p></div>',
    '          <div><div id="npm-badge">Scanning...</div></div>',
    '        </div>',
    '        <div class="requirement-row">',
    '          <div class="row-meta"><h5>Java 11+ JDK</h5><p>Required for the Spring Boot backend and Maven wrapper.</p></div>',
    '          <div style="display:flex;align-items:center;gap:10px;">',
    '            <button id="btn-install-java" onclick="triggerAutoInstall(\'java\')" class="btn btn-secondary" style="width:auto;padding:6px 12px;font-size:11px;display:none;">Auto-Install</button>',
    '            <div id="java-badge">Scanning...</div>',
    '          </div>',
    '        </div>',
    '        <div class="requirement-row">',
    '          <div class="row-meta"><h5>Git Source Control</h5><p>Used for version control and clone workflows.</p></div>',
    '          <div style="display:flex;align-items:center;gap:10px;">',
    '            <button id="btn-install-git" onclick="triggerAutoInstall(\'git\')" class="btn btn-secondary" style="width:auto;padding:6px 12px;font-size:11px;display:none;">Auto-Install</button>',
    '            <div id="git-badge">Scanning...</div>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div id="reqs-warning-box" style="display:none;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:20px;margin-bottom:20px;">',
    '        <h4 style="color:var(--accent-red);font-size:15px;font-weight:800;margin-bottom:6px;">&#9888;&#65039; Required software is missing!</h4>',
    '        <p style="font-size:13px;color:var(--text-muted);line-height:1.4;">Click <strong>Auto-Install</strong> next to missing items, or download manually:</p>',
    '        <a href="https://nodejs.org" target="_blank" style="display:inline-block;margin-top:8px;color:var(--accent-blue);font-weight:800;font-size:13px;text-decoration:none;">Node.js &rarr;</a>&nbsp;&nbsp;',
    '        <a href="https://adoptium.net/" target="_blank" style="display:inline-block;margin-top:8px;color:var(--accent-blue);font-weight:800;font-size:13px;text-decoration:none;">Java 11 &rarr;</a>',
    '      </div>',
    '      <div style="text-align:right;margin-top:25px;">',
    '        <button id="btn-next-1" onclick="gotoStep(2)" class="btn btn-blue" style="width:auto;">Continue to Database Setup &rarr;</button>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- STEP 2 -->',
    '    <div id="pane-2" class="wizard-pane">',
    '      <h3 class="pane-title">Configure Application Database</h3>',
    '      <p class="pane-subtitle">Humant supports SQLite, PostgreSQL, and MySQL. Choose SQLite for zero-configuration local testing, or configure a network database for production.</p>',
    '      <div class="db-cards-grid">',
    '        <div id="card-sqlite"   onclick="selectDialect(\'sqlite\')"   class="db-card-option selected-db"><span class="db-card-icon">&#128447;&#65039;</span><h4>SQLite</h4><span class="db-card-desc">Zero-config embedded file. Default &amp; recommended!</span></div>',
    '        <div id="card-postgres" onclick="selectDialect(\'postgres\')" class="db-card-option"><span class="db-card-icon">&#128309;</span><h4>PostgreSQL</h4><span class="db-card-desc">Robust enterprise database. Recommended for production.</span></div>',
    '        <div id="card-mysql"    onclick="selectDialect(\'mysql\')"    class="db-card-option"><span class="db-card-icon">&#128044;</span><h4>MySQL</h4><span class="db-card-desc">Fast, widely-supported MySQL server.</span></div>',
    '      </div>',
    '      <div id="form-sqlite" class="db-form-fields" style="display:block;">',
    '        <div class="form-group"><label>Database File Path</label><input type="text" id="sqlite-storage" class="form-control" value="./humant.db" /></div>',
    '      </div>',
    '      <div id="form-network-db" class="db-form-fields" style="display:none;">',
    '        <div id="db-suggest-box" class="db-suggest-box" style="display:none;">',
    '          <div><strong id="db-suggest-msg" style="color:#fff;font-size:14px;display:block;">Need a local database server?</strong><span style="font-size:12px;color:var(--text-muted);">One-click automated install via your OS package manager.</span></div>',
    '          <button id="btn-install-db" onclick="triggerDbAutoInstall()" class="btn btn-green" style="width:auto;padding:10px 20px;font-size:12px;margin-left:15px;">Auto-Install Database</button>',
    '        </div>',
    '        <div class="form-row-2">',
    '          <div class="form-group"><label>Host / IP</label><input type="text" id="db-host" class="form-control" value="localhost" /></div>',
    '          <div class="form-group"><label>Port</label><input type="text" id="db-port" class="form-control" value="5432" /></div>',
    '        </div>',
    '        <div class="form-group"><label>Database Name</label><input type="text" id="db-name" class="form-control" value="humant" /></div>',
    '        <div class="form-row-equal">',
    '          <div class="form-group"><label>Username</label><input type="text" id="db-user" class="form-control" value="postgres" /></div>',
    '          <div class="form-group"><label>Password</label><input type="password" id="db-password" class="form-control" value="" /></div>',
    '        </div>',
    '      </div>',
    '      <div style="display:flex;justify-content:space-between;margin-top:25px;">',
    '        <button onclick="gotoStep(1)" class="btn btn-secondary" style="width:auto;">&larr; Back</button>',
    '        <button onclick="saveDbConfig()" class="btn btn-blue" style="width:auto;">Save Database Configuration &rarr;</button>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- STEP 3 -->',
    '    <div id="pane-3" class="wizard-pane">',
    '      <h3 class="pane-title">Compile &amp; Install Frontend Dependencies</h3>',
    '      <p class="pane-subtitle">Press the button below to fetch Angular packages via npm. The Spring Boot backend resolves its Maven dependencies automatically when started.</p>',
    '      <div class="installer-container" id="install-ui-standard">',
    '        <button id="btn-run-installer" onclick="triggerCompilation()" class="btn btn-blue" style="width:auto;padding:16px 40px;">&#128296; Install &amp; Assemble Frontend Dependencies</button>',
    '      </div>',
    '      <div id="install-ui-active" style="display:none;text-align:center;padding:20px 0;">',
    '        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:800;font-size:14px;">',
    '          <span id="install-status-label" style="color:var(--accent-blue);">Installing... please wait.</span>',
    '          <span id="install-percent" style="color:var(--accent-green);">0%</span>',
    '        </div>',
    '        <div class="install-bar-bg"><div id="install-progress-bar" class="install-bar-fill"></div></div>',
    '        <p style="font-size:12px;color:var(--text-muted);">This process may take 1&ndash;3 minutes depending on your network speed.</p>',
    '      </div>',
    '      <div style="display:flex;justify-content:space-between;margin-top:25px;">',
    '        <button onclick="gotoStep(2)" class="btn btn-secondary" style="width:auto;">&larr; Back</button>',
    '        <button id="btn-next-3" onclick="gotoStep(4)" class="btn btn-blue" style="width:auto;" disabled>Run Launch Center &rarr;</button>',
    '      </div>',
    '    </div>',
    '',
    '    <!-- STEP 4 -->',
    '    <div id="pane-4" class="wizard-pane">',
    '      <h3 class="pane-title">Unified Application Operations Manager</h3>',
    '      <p class="pane-subtitle">Your environment is configured! Start or stop the Angular frontend and Spring Boot backend simultaneously.</p>',
    '      <div class="launch-console">',
    '        <div class="console-card">',
    '          <span style="font-size:36px;display:block;margin-bottom:12px;">&#127939;</span>',
    '          <h4 style="font-weight:800;margin-bottom:4px;">Start Full Stack</h4>',
    '          <p style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">Boots the Spring Boot REST API and the Angular dev server simultaneously using your saved database configuration.</p>',
    '          <button id="btn-control-start" onclick="startApp()" class="btn btn-green">&#128640; Spawn App Nodes</button>',
    '        </div>',
    '        <div class="console-card">',
    '          <span style="font-size:36px;display:block;margin-bottom:12px;">&#128721;</span>',
    '          <h4 style="font-weight:800;margin-bottom:4px;">Shutdown Gateway</h4>',
    '          <p style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">Cleanly terminates both backend and frontend child processes, freeing all reserved ports.</p>',
    '          <button id="btn-control-stop" onclick="stopApp()" class="btn btn-red" disabled>&#9209; Close App Nodes</button>',
    '        </div>',
    '      </div>',
    '      <div id="launched-urls-container" style="display:none;" class="link-box">',
    '        <div><strong style="color:#fff;font-size:15px;display:block;">&#10024; Humant is running!</strong><span style="font-size:13px;color:var(--text-muted);">Access dashboards or API health checks instantly:</span></div>',
    '        <div style="display:flex;gap:12px;">',
    '          <a href="http://localhost:4201" target="_blank" style="background:#0b6cff;color:#fff;padding:8px 16px;border-radius:6px;font-size:12px;">Open App (Frontend)</a>',
    '          <a href="http://localhost:8080" target="_blank" style="background:rgba(255,255,255,.06);border:1px solid var(--border-soft);color:#fff;padding:8px 16px;border-radius:6px;font-size:12px;">Backend API</a>',
    '        </div>',
    '      </div>',
    '      <div style="margin-top:25px;"><button onclick="gotoStep(3)" class="btn btn-secondary" style="width:auto;">&larr; Back</button></div>',
    '    </div>',
    '  </div>',
    '',
    '  <div class="log-panel">',
    '    <div class="log-header">',
    '      <span>&#129302; Activity Terminal Logs</span>',
    '      <button onclick="clearTerminalLogs()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-weight:800;text-transform:uppercase;font-size:10px;">Clear Console</button>',
    '    </div>',
    '    <div id="log-terminal" class="log-console-box">',
    '      <div class="log-row src-Launcher"><span class="log-time">00:00:00</span><span class="log-source">Launcher</span>Humant launcher panel loaded. Ready for executions.</div>',
    '    </div>',
    '  </div>',
    '',
    '</div>',
    '',
    '<script>',
    '  var activeStepNum = 1;',
    '  var selectedDialectVal = "sqlite";',
    '  var logsPollCounter = 0;',
    '',
    '  window.addEventListener("DOMContentLoaded", function() {',
    '    fetchStatus();',
    '    setInterval(fetchStatus, 2000);',
    '    setInterval(pollLogs, 1000);',
    '  });',
    '',
    '  function gotoStep(n) {',
    '    if (n === 4 && document.getElementById("btn-next-3").disabled) {',
    '      alert("Please complete Step 3 (Install Dependencies) before launching the application!");',
    '      return;',
    '    }',
    '    activeStepNum = n;',
    '    for (var i = 1; i <= 4; i++) {',
    '      var b = document.getElementById("bullet-" + i);',
    '      var p = document.getElementById("pane-" + i);',
    '      if (i === n) { b.classList.add("active-bullet"); p.classList.add("active-pane"); }',
    '      else         { b.classList.remove("active-bullet"); p.classList.remove("active-pane"); }',
    '    }',
    '  }',
    '',
    '  function selectDialect(d) {',
    '    selectedDialectVal = d;',
    '    ["sqlite","postgres","mysql"].forEach(function(c) {',
    '      var el = document.getElementById("card-" + c);',
    '      if (c === d) el.classList.add("selected-db"); else el.classList.remove("selected-db");',
    '    });',
    '    var sf = document.getElementById("form-sqlite");',
    '    var nf = document.getElementById("form-network-db");',
    '    var sb = document.getElementById("db-suggest-box");',
    '    var sm = document.getElementById("db-suggest-msg");',
    '    if (d === "sqlite") { sf.style.display = "block"; nf.style.display = "none"; sb.style.display = "none"; }',
    '    else {',
    '      sf.style.display = "none"; nf.style.display = "block";',
    '      document.getElementById("db-port").value = (d === "mysql") ? "3306" : "5432";',
    '      sb.style.display = "flex";',
    '      sm.innerText = "Need to install " + (d === "postgres" ? "PostgreSQL" : "MySQL") + " locally?";',
    '    }',
    '  }',
    '',
    '  async function fetchStatus() {',
    '    try {',
    '      var res = await fetch("/api/status");',
    '      var data = await res.json();',
    '',
    '      renderBadge("node", data.prerequisites.node.installed, data.prerequisites.node.version);',
    '      renderBadge("npm",  data.prerequisites.npm.installed,  data.prerequisites.npm.version);',
    '      renderBadge("java", data.prerequisites.java.installed, data.prerequisites.java.version);',
    '      renderBadge("git",  data.prerequisites.git.installed,  "Installed");',
    '',
    '      var warn = document.getElementById("reqs-warning-box");',
    '      if (!data.prerequisites.allPassed) { warn.style.display = "block"; document.getElementById("btn-next-1").disabled = true; }',
    '      else                               { warn.style.display = "none";  document.getElementById("btn-next-1").disabled = false; }',
    '',
    '      if (logsPollCounter === 0 && data.database) {',
    '        selectDialect(data.database.dialect || "sqlite");',
    '        document.getElementById("sqlite-storage").value = data.database.sqliteStorage || "./humant.db";',
    '        if (data.database.dialect !== "sqlite") {',
    '          document.getElementById("db-host").value     = data.database.host     || "localhost";',
    '          document.getElementById("db-port").value     = data.database.port     || "5432";',
    '          document.getElementById("db-name").value     = data.database.dbName   || "humant";',
    '          document.getElementById("db-user").value     = data.database.username || "postgres";',
    '          document.getElementById("db-password").value = data.database.password || "";',
    '        }',
    '      }',
    '',
    '      var btnRun = document.getElementById("btn-run-installer");',
    '      var actUI  = document.getElementById("install-ui-active");',
    '      var bar    = document.getElementById("install-progress-bar");',
    '      var pct    = document.getElementById("install-percent");',
    '      var btnN3  = document.getElementById("btn-next-3");',
    '      if (data.isInstalling) {',
    '        btnRun.disabled = true; actUI.style.display = "block";',
    '        bar.style.width = data.installProgress + "%"; pct.innerText = data.installProgress + "%";',
    '      } else {',
    '        btnRun.disabled = false;',
    '        if (data.installProgress === 100) {',
    '          bar.style.width = "100%"; pct.innerText = "100% (Completed)";',
    '          document.getElementById("install-status-label").innerText = "Installation completed! Ready to launch.";',
    '          document.getElementById("install-status-label").style.color = "var(--accent-green)";',
    '          btnN3.disabled = false;',
    '        }',
    '      }',
    '',
    '      var running = data.running.backend || data.running.frontend;',
    '      var dot  = document.getElementById("app-status-dot");',
    '      var lbl  = document.getElementById("app-status-text");',
    '      var bs   = document.getElementById("btn-control-start");',
    '      var bstp = document.getElementById("btn-control-stop");',
    '      var ub   = document.getElementById("launched-urls-container");',
    '      if (running) { dot.className = "status-dot glowing-green"; lbl.innerText = "Running"; bs.disabled = true; bstp.disabled = false; ub.style.display = "flex"; }',
    '      else         { dot.className = "status-dot glowing-red";   lbl.innerText = "Stopped"; bs.disabled = false; bstp.disabled = true; ub.style.display = "none"; }',
    '    } catch(e) {}',
    '  }',
    '',
    '  function renderBadge(key, installed, info) {',
    '    var badge = document.getElementById(key + "-badge");',
    '    var btn   = document.getElementById("btn-install-" + key);',
    '    if (installed) {',
    '      badge.innerHTML = "<span class=\\"badge-passed\\">&#10003; Passed</span> <span style=\\"font-size:11px;color:var(--text-muted)\\">(" + info + ")</span>";',
    '      if (btn) btn.style.display = "none";',
    '    } else {',
    '      badge.innerHTML = "<span class=\\"badge-missing\\">&#10060; Missing</span>";',
    '      if (btn) btn.style.display = "inline-block";',
    '    }',
    '  }',
    '',
    '  async function triggerAutoInstall(sw) {',
    '    var btn = document.getElementById("btn-install-" + sw);',
    '    if (btn) { btn.disabled = true; btn.innerText = "Installing..."; }',
    '    try {',
    '      var res = await fetch("/api/auto-install", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ software: sw }) });',
    '      var d = await res.json();',
    '      if (d.success) alert(sw.toUpperCase() + " installed successfully!");',
    '      else alert("Auto-installation failed. Please install " + sw.toUpperCase() + " manually.");',
    '    } catch(e) { alert("Error: " + e.message); }',
    '    finally { if (btn) { btn.disabled = false; btn.innerText = "Auto-Install"; } fetchStatus(); }',
    '  }',
    '',
    '  async function triggerDbAutoInstall() {',
    '    var btn = document.getElementById("btn-install-db");',
    '    if (btn) { btn.disabled = true; btn.innerText = "Installing..."; }',
    '    try {',
    '      var res = await fetch("/api/auto-install", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ software: selectedDialectVal }) });',
    '      var d = await res.json();',
    '      if (d.success) alert(selectedDialectVal.toUpperCase() + " installed successfully!");',
    '      else alert("Auto-installation failed. Please install the database server manually.");',
    '    } catch(e) { alert("Error: " + e.message); }',
    '    finally { if (btn) { btn.disabled = false; btn.innerText = "Auto-Install Database"; } }',
    '  }',
    '',
    '  async function saveDbConfig() {',
    '    var payload = { dialect: selectedDialectVal };',
    '    if (selectedDialectVal === "sqlite") { payload.sqliteStorage = document.getElementById("sqlite-storage").value; }',
    '    else {',
    '      payload.host = document.getElementById("db-host").value;',
    '      payload.port = document.getElementById("db-port").value;',
    '      payload.dbName   = document.getElementById("db-name").value;',
    '      payload.username = document.getElementById("db-user").value;',
    '      payload.password = document.getElementById("db-password").value;',
    '    }',
    '    try {',
    '      var res = await fetch("/api/save-db", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });',
    '      var d = await res.json();',
    '      if (d.success) { alert("Database configuration saved!"); gotoStep(3); }',
    '      else alert("Config save failed.");',
    '    } catch(e) { alert("Error: " + e.message); }',
    '  }',
    '',
    '  async function triggerCompilation() {',
    '    try { document.getElementById("install-ui-active").style.display = "block"; document.getElementById("btn-run-installer").disabled = true; await fetch("/api/install", { method: "POST" }); } catch(e) {}',
    '  }',
    '',
    '  async function startApp() {',
    '    try { await fetch("/api/start", { method: "POST" }); fetchStatus(); setTimeout(function() { window.open("http://localhost:4201", "_blank"); }, 1500); } catch(e) {}',
    '  }',
    '',
    '  async function stopApp() {',
    '    try { await fetch("/api/stop", { method: "POST" }); fetchStatus(); } catch(e) {}',
    '  }',
    '',
    '  async function pollLogs() {',
    '    try {',
    '      var res = await fetch("/api/logs");',
    '      var list = await res.json();',
    '      var box  = document.getElementById("log-terminal");',
    '      var near = box.scrollHeight - box.clientHeight - box.scrollTop < 40;',
    '      box.innerHTML = "";',
    '      list.forEach(function(item) {',
    '        var row = document.createElement("div");',
    '        row.className = "log-row src-" + item.source.replace(/\\s+/g, "");',
    '        var ts  = document.createElement("span"); ts.className = "log-time";   ts.innerText = item.timestamp;',
    '        var src = document.createElement("span"); src.className = "log-source"; src.innerText = item.source;',
    '        row.appendChild(ts); row.appendChild(src); row.appendChild(document.createTextNode(item.text));',
    '        box.appendChild(row);',
    '      });',
    '      if (near && list.length) box.scrollTop = box.scrollHeight;',
    '      logsPollCounter++;',
    '    } catch(e) {}',
    '  }',
    '',
    '  async function clearTerminalLogs() {',
    '    try { await fetch("/api/clear-logs", { method: "POST" }); document.getElementById("log-terminal").innerHTML = ""; } catch(e) {}',
    '  }',
    '</' + 'script>',
    '</body>',
    '</html>',
  ].join('\n');
}

// ─── HTTP SERVER ─────────────────────────────────────────────────────────────

var server = http.createServer(function(req, res) {
  var urlObj = new URL(req.url, 'http://' + req.headers.host);
  var pathname = urlObj.pathname;
  var method   = req.method;

  if (pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      prerequisites: getPreReqStatus(),
      database:      readLauncherConfig(),
      isInstalling:  isInstalling,
      installProgress: installProgress,
      running: { backend: !!backendProcess, frontend: !!frontendProcess },
    }));
  }

  if (pathname === '/api/save-db' && method === 'POST') {
    readBody(req).then(function(payload) {
      var ok = writeLauncherConfig(payload);
      res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: ok }));
    }).catch(function(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    });
    return;
  }

  if (pathname === '/api/install' && method === 'POST') {
    runDependencyInstaller();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  if (pathname === '/api/auto-install' && method === 'POST') {
    readBody(req).then(function(payload) {
      return autoInstallSoftware(payload.software);
    }).then(function(ok) {
      res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: ok }));
    }).catch(function(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    });
    return;
  }

  if (pathname === '/api/start' && method === 'POST') {
    startApplication();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  if (pathname === '/api/stop' && method === 'POST') {
    stopApplication();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  if (pathname === '/api/logs') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(activeLogs));
  }

  if (pathname === '/api/clear-logs' && method === 'POST') {
    activeLogs = [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(getHtmlContent());
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// ─── STARTUP ─────────────────────────────────────────────────────────────────

server.listen(PORT, 'localhost', function() {
  console.log('================================================================');
  console.log(' Humant Dashboard Server is now active!');
  console.log('================================================================');
  console.log(' URL: http://localhost:' + PORT);
  console.log('================================================================');
  addLog('Launcher', 'Humant launcher is ready on http://localhost:' + PORT);
  try {
    if (process.platform === 'win32') exec('start http://localhost:' + PORT);
    else if (process.platform === 'darwin') exec('open http://localhost:' + PORT);
    else exec('xdg-open http://localhost:' + PORT);
  } catch (_) {}
});

function shutdown() { stopApplication(); process.exit(0); }
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
