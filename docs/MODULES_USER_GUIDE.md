# HUMANT Product and Modules User Guide

## 1. Product Overview

HUMANT is an HRMS platform designed to centralize people operations across the employee lifecycle. It combines HR administration, recruitment, payroll workflows, employee development, and governance features in one solution.

The application has two main parts:

- Angular frontend (admin web app)
- Spring Boot backend API (business logic and persistence)

## 2. Technology Stack

- Frontend: Angular 11, Bootstrap, RxJS
- Backend: Spring Boot 2.5.4, Spring Data JPA, Spring Security
- Database: PostgreSQL (active default), MySQL (legacy commented setup)
- Build Tools: npm, Maven Wrapper (`mvnw`, `mvnw.cmd`)

## 3. High-Level Functional Areas

- Organization setup: country, city, department, designation, education levels
- Workforce administration: employee records, contracts, documents, leave, attendance
- Compensation and finance workflows: salary, payslip, loans, advances, expenses
- Talent acquisition: jobs, applications, candidate pipeline, interviews, offer letters
- Employee lifecycle events: onboarding, warning, complaint, resignations, terminations
- Engagement and development: announcements, events, training, performance

## 4. User Roles (Typical)

- Admin: full configuration and operational access
- HR Manager: workforce, recruitment, performance, and compliance operations
- Finance/Payroll User: salary, payslip, loans, expenses, advances
- Team Lead/Manager: attendance visibility, interview participation, training and performance inputs

Role permissions depend on backend role and security configuration.

## 5. Local Installation Guide

This section is written as a copy-paste runbook for first-time setup.

### 5.1 System Requirements

Install the following before you start:

1. Node.js 14.x or 16.x
2. npm (comes with Node.js)
3. Java 11 JDK
4. PostgreSQL 12+

Optional but useful:

1. Git
2. pgAdmin or another PostgreSQL client

### 5.2 One-Time Setup

1. Clone and open the project:

```bash
git clone <repository-url>
cd humant
```

2. Install frontend dependencies:

```bash
npm install
```

3. Create PostgreSQL database:

```sql
CREATE DATABASE humant;
```

4. Open configuration file:

- `backend/src/main/resources/application.properties`

5. Confirm or update these values:

- `spring.datasource.url=jdbc:postgresql://localhost:5432/humant`
- `spring.datasource.username=postgres`
- `spring.datasource.password=admin`
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.sql.init.mode=always`

If your local PostgreSQL user/password is different, update it here before running.

### 5.3 Start the Backend API

Windows:

```powershell
Push-Location .\backend
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
cd backend
./mvnw spring-boot:run
```

Backend health check:

1. Wait until log shows Tomcat started on port 8080.
2. Open `http://localhost:8080` in browser.

### 5.4 Start the Frontend

From project root:

```bash
npm run serve -- --port 4201
```

Frontend health check:

1. Wait until Angular shows compiled successfully.
2. Open `http://localhost:4201`.

### 5.5 First Login and Verification

After both services are running:

1. Open login page.
2. Sign in with your configured/admin account.
3. Verify Dashboard opens.
4. Open 3 to 5 modules from left navigation to confirm routing.
5. Verify API actions (create/list) in at least one module.

### 5.6 Common Local Issues and Fixes

1. Backend cannot connect to database
- Verify PostgreSQL service is running.
- Verify host/port/user/password in `application.properties`.
- Verify `humant` database exists.

2. Frontend fails to start
- Run `npm install` again.
- Use Node.js 14/16 (older Angular projects may fail on newer Node versions).

3. Port already in use
- Change frontend port: `npm run serve -- --port 4300`
- Or stop process using 4201/8080.

4. CORS or API errors in browser
- Ensure frontend calls the correct backend URL.
- Ensure reverse proxy configuration is correct in deployed environments.

### 5.7 Build for Release

Frontend build:

```bash
npm run build
```

Backend build:

```bash
cd backend
./mvnw clean package
```

Backend artifact output:

- `backend/target/*.jar`

## 6. Remote Installation Guide (Server and Cloud)

This section explains remote deployment paths for VPS, AWS, and Heroku-style hosting.

Remote installation options covered:

1. VPS (Linux server)
2. AWS (RDS + EC2/ECS/Beanstalk + S3/CloudFront)
3. Heroku-style hosting

### 6.1 Remote Deployment Topology

1. Frontend served as static files (Nginx/S3/CloudFront)
2. Backend running as a managed process/service
3. PostgreSQL hosted database
4. HTTPS termination at reverse proxy/load balancer

### 6.2 VPS Deployment (Recommended Simple Production)

Target stack:

1. Ubuntu 22.04+
2. Java 11
3. PostgreSQL
4. Nginx
5. systemd service for backend

Steps:

1. Prepare server packages.
2. Create database and database user.
3. Build frontend and backend artifacts.
4. Upload artifacts to server.
5. Configure backend as systemd service.
6. Configure Nginx for frontend and API proxy.
7. Enable TLS and firewall.
8. Run post-deploy verification.

#### 6.2.1 Prepare Server

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib openjdk-11-jre-headless ufw certbot python3-certbot-nginx
```

#### 6.2.2 Create Database

```bash
sudo -u postgres psql
CREATE DATABASE humant;
CREATE USER humant_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE humant TO humant_user;
\q
```

#### 6.2.3 Build Project Artifacts (on your build machine)

```bash
npm ci
npm run build
cd backend
./mvnw clean package
```

#### 6.2.4 Upload Artifacts to VPS

```bash
ssh <server-user>@<server-ip> "sudo mkdir -p /opt/humant/backend /var/www/humant"
scp backend/target/*.jar <server-user>@<server-ip>:/tmp/humant-backend.jar
scp -r dist/* <server-user>@<server-ip>:/tmp/humant-frontend/
ssh <server-user>@<server-ip> "sudo mv /tmp/humant-backend.jar /opt/humant/backend/app.jar"
ssh <server-user>@<server-ip> "sudo cp -r /tmp/humant-frontend/* /var/www/humant/"
```

#### 6.2.5 Configure Backend Service

Create file:

- `/etc/systemd/system/humant-backend.service`

systemd service example:

```ini
[Unit]
Description=Humant Backend
After=network.target

[Service]
User=humant
WorkingDirectory=/opt/humant/backend
ExecStart=/usr/bin/java -jar /opt/humant/backend/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5
Environment=SPRING_DATASOURCE_URL=jdbc:postgresql://<db-host>:5432/humant
Environment=SPRING_DATASOURCE_USERNAME=<db-user>
Environment=SPRING_DATASOURCE_PASSWORD=<db-password>

[Install]
WantedBy=multi-user.target
```

Apply service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable humant-backend
sudo systemctl restart humant-backend
sudo systemctl status humant-backend
```

#### 6.2.6 Configure Nginx

Create file:

- `/etc/nginx/sites-available/humant`

```nginx
server {
    listen 80;
    server_name your-domain.example.com;

    root /var/www/humant;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/humant /etc/nginx/sites-enabled/humant
sudo nginx -t
sudo systemctl reload nginx
```

#### 6.2.7 Enable TLS and Firewall

```bash
sudo certbot --nginx -d your-domain.example.com
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 6.2.8 Verify Deployment

```bash
curl -I https://your-domain.example.com
curl -I http://127.0.0.1:8080
sudo journalctl -u humant-backend -n 100 --no-pager
```

### 6.3 AWS Deployment Runbook

Recommended AWS pattern:

1. Frontend: S3 + CloudFront
2. Backend: EC2, ECS, or Elastic Beanstalk
3. Database: Amazon RDS PostgreSQL
4. Certificates: ACM

Steps:

1. Provision network and security groups.
2. Create RDS PostgreSQL.
3. Deploy backend on EC2 (or ECS/Beanstalk).
4. Deploy frontend to S3 + CloudFront.
5. Configure API domain and HTTPS.
6. Verify health checks and monitoring.

#### 6.3.1 Create RDS PostgreSQL

1. Create RDS PostgreSQL instance.
2. Create database name `humant`.
3. Create DB user/password.
4. Allow inbound 5432 from backend security group only.

#### 6.3.2 Deploy Backend on EC2 (reference path)

On EC2 instance:

```bash
sudo apt update
sudo apt install -y openjdk-11-jre-headless nginx
sudo mkdir -p /opt/humant/backend
```

Upload jar from CI/local:

```bash
scp backend/target/*.jar ubuntu@<ec2-public-ip>:/tmp/humant-backend.jar
ssh ubuntu@<ec2-public-ip> "sudo mv /tmp/humant-backend.jar /opt/humant/backend/app.jar"
```

Create systemd service with RDS values:

```ini
[Service]
Environment=SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/humant
Environment=SPRING_DATASOURCE_USERNAME=<rds-user>
Environment=SPRING_DATASOURCE_PASSWORD=<rds-password>
```

Start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable humant-backend
sudo systemctl restart humant-backend
```

#### 6.3.3 Deploy Frontend to S3 + CloudFront

Build frontend:

```bash
npm ci
npm run build
```

Upload to S3 bucket:

```bash
aws s3 sync dist/ s3://<your-frontend-bucket> --delete
```

CloudFront:

1. Create distribution with S3 origin.
2. Configure default root object `index.html`.
3. Add custom error response to map 403/404 to `/index.html` for Angular routing.
4. Attach ACM certificate and custom domain.

#### 6.3.4 Verify AWS Deployment

1. Open frontend domain and verify login page.
2. Test backend API from load balancer/public endpoint.
3. Check CloudWatch logs and alarms.
4. Confirm RDS connectivity and query response.

### 6.4 Heroku Deployment Runbook

Use case:

1. Good for demo/staging and quick validation.
2. Production requires stricter ops controls.

Steps:

1. Create Heroku backend app.
2. Add Heroku Postgres addon.
3. Configure backend runtime and environment variables.
4. Deploy backend and verify logs.
5. Deploy frontend to a static host (recommended) or separate Heroku app.
6. Verify end-to-end behavior.

#### 6.4.1 Backend Deployment on Heroku

Install and login:

```bash
heroku login
```

Create app and database:

```bash
heroku create humant-backend
heroku addons:create heroku-postgresql:essential-0 -a humant-backend
```

Set Java buildpack:

```bash
heroku buildpacks:set heroku/java -a humant-backend
```

Set config vars:

```bash
heroku config:set SPRING_DATASOURCE_URL=<jdbc-url> -a humant-backend
heroku config:set SPRING_DATASOURCE_USERNAME=<db-user> -a humant-backend
heroku config:set SPRING_DATASOURCE_PASSWORD=<db-password> -a humant-backend
```

Add a `Procfile` (if needed by your setup):

```text
web: java $JAVA_OPTS -Dserver.port=$PORT -jar backend/target/*.jar
```

Deploy:

```bash
git push heroku main
heroku logs --tail -a humant-backend
```

#### 6.4.2 Frontend Deployment for Heroku Scenario

Recommended:

1. Deploy frontend build to Netlify, Vercel, or S3/CloudFront.
2. Set frontend API base URL to Heroku backend URL.

Alternative:

1. Create separate Heroku app for static frontend.
2. Serve `dist` files via Node static server.

#### 6.4.3 Verify Heroku Deployment

1. Open frontend URL and test login.
2. Confirm backend health endpoint responds.
3. Validate role-based navigation and restricted routes.
4. Validate database write/read in one module workflow.

### 6.5 User Panel Details

The user panel is role-driven and dynamically filtered by access control rules.

Main navigation areas:

1. Executive Dashboard
2. People and Structure
3. Talent and Growth
4. Time and Compensation
5. Risk and Exit
6. Settings and Documentation

Typical role visibility:

1. Admin
- Full access to all modules and configuration.

2. HR Manager
- Employee lifecycle, recruitment, compliance, communication.

3. Payroll/Finance
- Salary, payslip, expense, loan, advance salary.

4. Manager
- Team attendance, interview feedback, performance inputs.

5. Employee
- Profile, leave, payslip, expense, and resignation request.

User panel validation checklist:

1. Confirm each role lands on expected default route.
2. Confirm restricted modules are hidden in navigation.
3. Confirm direct URL access is blocked for restricted pages.
4. Confirm sensitive modules are accessible only to allowed roles.

### 6.6 Production Readiness Checklist

Security:

1. Strong credentials and secrets management enabled.
2. HTTPS enabled with certificate auto-renewal.
3. Least-privilege host and database access.
4. Restricted access for sensitive modules.

Operations:

1. Health checks and alerts configured.
2. Backup and restore test completed.
3. Log rotation and retention policy enabled.
4. Rollback runbook documented and tested.
5. Smoke test completed after deployment.

## 7. Module-by-Module User Guide

Each module below includes purpose and a quick user workflow.

### 7.1 Core and Shared Modules

1. User
- Purpose: Manage platform user accounts and access.
- Typical workflow: Create user -> assign role -> activate account -> verify login.

2. Shared
- Purpose: Reusable UI components, dialogs, and common services.
- Typical workflow: Used internally by feature modules; no direct business process.

### 7.2 Organization Setup Modules

1. Country
- Purpose: Define countries used in employee and location data.
- User guide: Add country records before city and employee setup.

2. City
- Purpose: Define cities mapped to countries.
- User guide: Create cities, then reference them in addresses and location records.

3. Department (internal name: Departement)
- Purpose: Manage organizational departments.
- User guide: Create department -> assign manager -> use in employee and designation forms.

4. Designation
- Purpose: Manage job titles/positions within departments.
- User guide: Create designation -> map to department -> assign to employees.

5. Education-Level
- Purpose: Standardize education levels for candidate and employee profiles.
- User guide: Add levels (Bachelor, Master, etc.) and select during profile creation.

6. Contract-Type
- Purpose: Configure available employment contract categories.
- User guide: Create types such as Full Time, Part Time, Internship, then assign in contracts.

7. Award-Type
- Purpose: Configure award categories.
- User guide: Create categories first, then award employees from Award module.

8. Leave-Type
- Purpose: Define leave policies and leave categories.
- User guide: Add leave type -> set policy rules -> use in leave requests.

9. Training-Type
- Purpose: Define types of training programs.
- User guide: Create training categories and reference them when scheduling training.

10. Termination Type (internal name: Ltermination-Type)
- Purpose: Define termination reason categories.
- User guide: Add reason list used when recording employee termination.

### 7.3 Employee and HR Administration Modules

1. Employee
- Purpose: Maintain employee master records.
- User guide: Add employee profile -> assign department/designation -> upload required documents.

2. Document
- Purpose: Manage employee and HR documentation.
- User guide: Upload and tag documents -> map to employee -> maintain expiry/review schedule.

3. Contract
- Purpose: Manage employment contracts.
- User guide: Create contract -> choose contract type -> set dates and terms -> renew/close.

4. Attendance
- Purpose: Track presence and attendance records.
- User guide: Review daily logs -> correct exceptions -> export attendance summaries.

5. Leave
- Purpose: Process leave requests.
- User guide: Submit/request leave -> manager/HR approves or rejects -> system updates leave balance.

6. Holiday
- Purpose: Manage holiday calendar.
- User guide: Add yearly holidays -> publish calendar -> attendance and leave use holiday data.

7. Warning
- Purpose: Track formal employee warnings.
- User guide: Record incident -> issue warning -> keep acknowledgement and follow-up notes.

8. Complaint
- Purpose: Register and manage workplace complaints.
- User guide: Log complaint -> assign investigator/owner -> record actions and closure details.

9. Notice
- Purpose: Track and publish HR notices.
- User guide: Create notice -> define audience -> publish -> archive when expired.

10. Resign
- Purpose: Manage employee resignation workflow.
- User guide: Record resignation -> set notice period -> coordinate handover and final clearance.

11. Termination
- Purpose: Manage termination events.
- User guide: Open termination case -> select termination type -> document reasons and final actions.

12. Onboarding
- Purpose: Orchestrate new-hire onboarding.
- User guide: Create onboarding checklist -> assign tasks -> track completion before joining confirmation.

13. Communication
- Purpose: Internal communication records and employee communication tracking.
- User guide: Create communication log -> target users/teams -> maintain history.

14. Announcement
- Purpose: Company-wide or segment announcements.
- User guide: Draft announcement -> schedule/publish -> monitor visibility.

15. Event
- Purpose: Track company/HR events.
- User guide: Create event -> set participants/date -> share reminders and outcomes.

### 7.4 Payroll and Financial Modules

1. Salary
- Purpose: Manage salary structures and salary records.
- User guide: Define salary template -> assign to employee -> update for revisions.

2. Payslip
- Purpose: Generate and manage payslips.
- User guide: Select payroll period -> generate payslips -> review -> release/export.

3. Advance Salary
- Purpose: Process salary advance requests.
- User guide: Record request -> approve/reject -> schedule deduction in payroll.

4. Loan
- Purpose: Manage employee loan issuance and repayment tracking.
- User guide: Create loan entry -> define installments -> track outstanding balance.

5. Expense
- Purpose: Employee expense claim processing.
- User guide: Submit expense -> verify receipt -> approve/reject -> include in reimbursement cycle.

### 7.5 Recruitment and Talent Acquisition Modules

1. Job
- Purpose: Create and publish job openings.
- User guide: Create job post -> define requirements -> activate posting.

2. Job-Application
- Purpose: Manage incoming applications.
- User guide: Capture candidate applications -> screen profile -> move to pipeline stage.

3. Candidate
- Purpose: Candidate profile management.
- User guide: Maintain candidate records -> attach resume/documents -> update status after each stage.

4. Pipeline
- Purpose: Recruitment stage tracking.
- User guide: Move candidate between stages (screening, interview, offer, etc.) -> monitor conversion.

5. Interview
- Purpose: Interview scheduling and feedback.
- User guide: Schedule interview -> assign panel -> record feedback -> decide next step.

6. Offer-Letter
- Purpose: Offer generation and management.
- User guide: Prepare offer details -> issue letter -> track acceptance/decline.

### 7.6 Performance, Learning, and Development Modules

1. Performance
- Purpose: Employee performance tracking.
- User guide: Create review cycle -> collect ratings/comments -> finalize review outcomes.

2. Training
- Purpose: Plan and track training sessions.
- User guide: Schedule training -> assign participants -> capture completion and feedback.

3. Launchplan
- Purpose: Plan execution and initiative rollout tracking.
- User guide: Create plan milestones -> assign owners -> monitor completion.

4. Award
- Purpose: Employee recognition records.
- User guide: Create award entry -> select award type and recipient -> publish recognition.

### 7.7 Transfer and Movement Modules

1. Transfer (internal name: Transfert)
- Purpose: Employee transfer records between departments/locations.
- User guide: Create transfer request -> approve -> update employee assignment and effective date.

## 8. Suggested End-to-End Operating Flows

### 8.1 New Employee Journey

1. Configure organization masters (department/designation/contract type).
2. Create employee profile.
3. Create contract and assign salary.
4. Run onboarding checklist.
5. Include in attendance, leave policy, and payroll cycle.

### 8.2 Hiring Journey

1. Publish job.
2. Collect applications and create candidate records.
3. Move candidates through pipeline.
4. Conduct interview and log feedback.
5. Issue offer letter and start onboarding.

### 8.3 Exit Journey

1. Record resignation or termination.
2. Track notice period and handover.
3. Finalize payroll and payslip adjustments.
4. Archive documents and close employee lifecycle record.

## 9. Troubleshooting Guide

1. Frontend build fails with OpenSSL error
- Use existing npm scripts that include `--openssl-legacy-provider`.

2. Backend fails to connect to database
- Verify PostgreSQL service is running.
- Validate connection values in `application.properties`.
- Ensure `humant` database exists.

3. CORS/API connectivity issues
- Ensure frontend is calling the correct backend URL.
- Verify proxy/reverse-proxy configuration on server.

4. Data does not seed on startup
- Confirm `spring.sql.init.mode=always` is active.
- Check logs for SQL permission or schema errors.

## 10. Maintenance Recommendations

- Backup PostgreSQL daily with retention policy.
- Monitor backend JVM memory and API response times.
- Keep Java and Node runtime patched.
- Run frontend and backend build checks in CI.
- Version and review configuration changes.

## 11. Related Documentation

- [README.md](../README.md)
- [docs/ROLE_BASED_USER_GUIDE.md](ROLE_BASED_USER_GUIDE.md)

