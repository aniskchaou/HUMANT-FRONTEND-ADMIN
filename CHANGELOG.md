# Changelog

All notable changes to Humant are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] — 2026-08-02

### Added

**GUI Launcher (`launcher.js` / `launcher.bat` / `launcher.sh`)**
- Zero-dependency Node.js server at port 3030 with a 4-step browser wizard.
- Step 1: Prerequisites check — Node.js, npm, Java 11, Git with version display and one-click auto-install via Winget (Windows), Homebrew (macOS), or apt-get (Linux).
- Step 2: Database selector — SQLite, PostgreSQL, or MySQL card UI with host/port/credentials form. Auto-install suggestion for PostgreSQL/MySQL server. Config saved to `backend/launcher-config.json`.
- Step 3: Dependency installer — runs `npm install --legacy-peer-deps` with live progress bar.
- Step 4: Launch Center — start/stop button pair that boots the Angular dev server on port 4201 and the Spring Boot backend on port 8080 simultaneously. Database env vars injected into backend process.
- Retro green activity terminal at the bottom with per-source colour coding.
- Same API route surface as the reference project: `/api/status`, `/api/save-db`, `/api/install`, `/api/auto-install`, `/api/start`, `/api/stop`, `/api/logs`, `/api/clear-logs`.
- `npm run launcher` script added.

**Deployment Generator (`generate-deployment-version.js` / wrappers)**
- Browser UI at port 3040 matching reference dark theme (`#0b1220` bg, Manrope font).
- Prerequisites strip with version badges.
- Database dialect selector — SQLite / PostgreSQL / MySQL with credentials form.
- Server settings panel — deployment name, output folder, public base URL, backend port.
- Payment & email credentials panel — Stripe keys, SMTP settings.
- Live progress bar and retro log box during generation.
- Builds Angular production bundle (`npm run build`).
- Packages Spring Boot backend with Maven wrapper (`mvnw -DskipTests package`).
- Exports deployment bundle to `deployment-builds/<name>/` containing: `frontend/` (Angular dist), `backend/humant.jar`, `config/application-production.properties`, `config/nginx.conf.example`, `start-backend.bat`, `start-backend.sh`, `deployment-manifest.json`.
- "Open Output Folder" button after successful generation.
- `npm run generate:deployment` script added.

**Multi-database support (Spring Boot)**
- `org.xerial:sqlite-jdbc:3.45.3.0` and `com.github.gwenn:sqlite-dialect:0.1.4` added to `pom.xml`.
- `application.properties` now uses `HUMANT_DATASOURCE_*` and `HUMANT_JPA_DIALECT` environment variable placeholders with PostgreSQL as the default fallback.
- Launcher writes correct env vars for each dialect on backend start.
- MySQL JDBC driver was already bundled; dialect switch now fully automated.

**Marketing kit (`marketing/`)**
- `index.html` — multi-section landing page: hero with browser mockup, stats strip, 6-feature pillar grid, 35+ module chip map, 5-role cards, tech stack, quick-start steps with code blocks, comparison table, FAQ accordion, and footer CTA.
- `cover-banner.html` — 590 × 300 dark banner with 3D-perspective browser frame and animated glow mesh.
- `poster.html` — 1600 × 800 poster with dual browser mockup, stat grid, and pill feature list.
- `presentation.html` — sticky-header pitch deck with 8 content sections, hero browser mockup, code examples, and lifecycle journey diagram.
- `capture.js` — Playwright script to capture all marketing sections as PNG.
- `capture_cover_banner.js` — captures cover banner as 590 × 300 JPEG.
- `capture_poster.js` — captures poster as 1600 × 800 PNG and JPEG.

**Premium documentation site (`premium-docs/`)**
- `index.html` — 20-section offline docs with sticky sidebar navigation.
- Sections: Product Overview, Features (9 categories), User Roles table, System Requirements, Quick Start (Launcher + CLI), GUI Launcher wizard reference, CLI Setup details, Database Setup (all 3 dialects), Deployment Generator, VPS Deployment walkthrough, Nginx Configuration example, Environment Variables table, HR Modules (9 cards), Payroll Modules (5 cards), Recruitment Modules (6 cards), Configuration Modules (6 cards), Architecture, API Overview, FAQ (5 entries), Change Log.
- `assets/styles.css` — Manrope font, dark green brand, responsive two-column layout, callout variants, table styles.
- `assets/app.js` — sidebar active-link tracking on scroll, mobile open/close toggle.

**`src/app/main/urls/urls.ts` — deployment-aware API base**
- `URL_BASE` now calls `CONFIG.resolveBaseUrl()` at class load time.
- Returns `localhost:8080` when the frontend is on a local Angular dev port (4200/4201).
- Returns `window.location.origin` in all other environments, enabling same-origin production deployment without code changes.

**Repository housekeeping**
- `deployment-builds/` added to `.gitignore`.
- `npm run install:frontend` script (`npm install --legacy-peer-deps`) added for direct CLI use.
- README completely rewritten with quick-start table, module overview, environment variable reference, common issues section, and npm scripts table.
- `CHANGELOG.md` created.

### Fixed

- `npm install` in the launcher now passes `--legacy-peer-deps` to resolve the `angular-datatables@10` / Angular 11 peer dependency conflict on npm 7+.

---

## [1.0.0] — Initial release

### Added

- Angular 11 SPA frontend at repository root — Bootstrap 4, RxJS 6, ngx-charts, Angular DataTables.
- Spring Boot 2.5 backend in `backend/` — Spring Data JPA, Spring Security JWT, Spring Batch, Stripe SDK, SpringDoc OpenAPI.
- PostgreSQL default configuration with commented MySQL legacy setup.
- 35+ HR business modules: Employee, Department, Designation, Attendance, Leave, Holiday, Salary, Payslip, Loan, Advance Salary, Expense, Job, Candidate, Job Application, Pipeline, Interview, Offer Letter, Contract, Document, Onboarding, Warning, Complaint, Notice, Resign, Termination, Transfer, Training, Performance, Award, Event, Announcement, Communication, Country, City, Education Level, Contract Type, Leave Type, Award Type, Training Type, Termination Type, User, Shared.
- Role-based access model: Admin, HR Manager, Payroll/Finance, Department Manager, Employee.
- Angular dev proxy forwarding `/api/*` to `http://localhost:8080`.
- Express static server (`server.js`) to serve the Angular dist.
- `docs/MODULES_USER_GUIDE.md` and `docs/ROLE_BASED_USER_GUIDE.md`.
- `backend/src/main/resources/data.sql` for initial seed data.
