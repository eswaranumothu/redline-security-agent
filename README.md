# REDLINE — Security That Remembers 🛡️⚡
> **AI-Powered VAPT Management & Reporting Platform with Persistent Security Memory**  
> GitHub Repository: [https://github.com/eswaranumothu/redline-security-agent](https://github.com/eswaranumothu/redline-security-agent)

REDLINE is an enterprise cybersecurity platform engineered for Security Operations Centers (SOC), VAPT assessors, and security auditors. It extends traditional Vulnerability Assessment and Penetration Testing (VAPT) tools by giving the system **Persistent Security Memory** powered by Hindsight technology and AI LLMs. This ensures historical findings, remediation guidance, and retest outcomes are recalled intelligently across projects and sessions without losing security context or leaking sensitive client credentials.

---

## 📸 Application Screenshots

> *Replace the placeholder images below in the `./screenshots/` directory with your actual application screenshots.*

| View | Screenshot Placeholder |
| :--- | :--- |
| **Login Page** | ![REDLINE Login Page](./screenshots/01_login_page.png) <br> *Figure 1: Clean SOC authentication view with REDLINE theme.* |
| **Analyst Dashboard** | ![REDLINE Analyst Dashboard](./screenshots/02_dashboard.png) <br> *Figure 2: Executive overview showing active VAPT projects, severity metrics, and quick actions.* |
| **Project & Findings View** | ![Project Details & Findings](./screenshots/03_project_details.png) <br> *Figure 3: VAPT project management, status workflow, PDF report generation, and findings table.* |
| **Finding Details & Retest Flow** | ![Finding Details & Retest](./screenshots/04_finding_details.png) <br> *Figure 4: Vulnerability details, severity badges, retest verification controls, and similar memory panel.* |
| **Security Memory Transparency** | ![Security Memory Transparency](./screenshots/05_security_memory.png) <br> *Figure 5: Transparent view of sanitized security memory records retained in Hindsight.* |
| **AI Memory Assistant Chat** | ![AI Security Memory Chat](./screenshots/06_memory_chat.png) <br> *Figure 6: Grounded RAG conversational AI assistant answering VAPT queries based on past security memory.* |
| **PDF Report Preview** | ![PDF VAPT Report Preview](./screenshots/07_pdf_report.png) <br> *Figure 7: Professionally branded REDLINE executive PDF report with historical security context.* |

---

## 🎨 Visual Identity & SOC Design System

REDLINE features a state-of-the-art SOC-inspired dark interface designed for clarity during long auditing sessions:
- **Background Palette**: Deep Matte Obsidian (`#050609`) with custom glowing red grid backdrops.
- **Primary Accents**: Crimson Red (`#dc2626`, `#ef4444`, `#ff5555`) with subtle translucent glassmorphic borders (`rgba(239, 68, 68, 0.32)`).
- **Typography & Components**: Clean typography (Inter/Roboto), crisp white headers, muted text colors (`#94a3b8`), and custom Material-UI components.

---

## 🚀 Key Features

### 1. 📊 REDLINE Analyst Dashboard
- SOC overview displaying active VAPT projects, total finding templates, security memory count, and generated reports.
- Severity distribution metrics (Critical, High, Medium, Low, Informational) with direct navigation shortcuts.
- Modern collapsible sidebar navigation with persistent REDLINE branding.

### 2. 🧠 Persistent Security Memory Engine (Hindsight Integration)
- Integrates with Hindsight vector memory (`/v1/retain`, `/v1/recall`) to memorize vulnerability patterns, fixes, and retest outcomes across assessments.
- **Resilient Fallback Engine**: If Hindsight API services are offline, REDLINE seamlessly falls back to PostgreSQL `security_memories` table searches, ensuring zero downtime.
- **Automated Sanitization Guardrails**: Automatically redacts passwords, Bearer tokens, API keys, database connection strings, and authorization headers prior to memory retention.

### 3. 🔍 Similar Historical Findings Panel
- Automatically searches security memory when viewing any VAPT finding.
- Displays matching historical findings with vulnerability category, severity, original project, remediation guidance, and past retest outcomes.
- Includes analyst feedback controls: **Mark Useful** or **Dismiss** suggestions.

### 4. 💬 REDLINE AI Security Memory Chat (`/memory-chat`)
- Grounded RAG Chat powered by LLM integration (Local / Gemini AI).
- Enables auditors to query historical VAPT assessments in natural language (e.g., *"Have we documented SQL injection findings in previous web applications?"*).
- Cites referenced memory records directly and maintains strict project-level access control boundaries.

### 5. 👁️ Security Memory Transparency View (`/security-memory`)
- Gives security leads complete visibility into all retained historical VAPT memory records.
- Filter, search, and inspect sanitized summaries, remediation notes, retest outcomes, retaining auditor, and creation timestamps.

### 6. 📄 VAPT Report Builder with Historical Context
- Automated generation of executive VAPT PDF and Doc reports.
- Optionally enriches reports with a dedicated **Historical Security Context & Prior Retest Outcomes** section to demonstrate long-term security trend improvements to stakeholders.

### 7. ✅ Analyst Retest Verification Flow
- Auditor verification controls on findings (`PASSED`, `FAILED`, `PENDING`).
- Records retest timestamp, auditor identity, and verification notes.
- Automatically syncs verified retest outcomes into persistent security memory.

---

## 🛠️ System Architecture

```
                                ┌─────────────────────────────────────────────────────────────┐
                                │              REDLINE Frontend (Vite + React 18)             │
                                │           Material-UI (MUI) SOC Crimson Dark Theme          │
                                └──────────────────────────────┬──────────────────────────────┘
                                                               │ REST API (JWT Bearer Tokens)
                                ┌──────────────────────────────▼──────────────────────────────┐
                                │                 REDLINE Backend (FastAPI)                   │
                                │                                                             │
                                │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────┐ │
                                │  │ Auth Service │  │ Findings Service │  │ Memory Engine │ │
                                │  └──────────────┘  └──────────────────┘  └───────────────┘ │
                                └───────────┬───────────────────┬───────────────────┬─────────┘
                                            │                   │                   │
                                ┌───────────▼───────────┐ ┌─────▼──────────┐ ┌──────▼────────────┐
                                │ PostgreSQL Database   │ │ LLM AI Service │ │ Hindsight Engine  │
                                │ (Docker Container:    │ │ (Local LLM /   │ │ (Persistent       │
                                │  redline_postgres)    │ │  Gemini API)   │ │  Vector Memory)   │
                                └───────────────────────┘ └────────────────┘ └───────────────────┘
```

### Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Material-UI (MUI v5), React Query (`@tanstack/react-query`), React Router v6.
- **Backend**: Python 3.10+ FastAPI, SQLAlchemy 2.0 ORM, Alembic Migrations, Pydantic v2, ReportLab PDF builder.
- **Database**: PostgreSQL 16 (running via Docker `redline_postgres` container on port 5432) & pgAdmin (`redline_pgadmin` on port 5050).
- **AI & Memory**: Local LLM / Google Gemini AI & Hindsight Persistent Security Memory Engine.

---

## 🔒 Security & Privacy Safeguards

- **Git Security**: Sensitive configuration files (`.env`), JWT keys, API keys, database credentials, user uploaded evidence, and generated PDF reports are strictly excluded via `.gitignore`.
- **Role-Based Access Control (RBAC)**: Backend-enforced authorization ensures Auditors only view assigned projects while Admins retain system-wide auditing privileges.
- **Data Redaction**: Sensitive strings (passwords, JWT tokens, hashes, authorization credentials) are automatically sanitized before being stored into vector memory.

---

## 📁 Repository Structure

```
redline-security-agent/
├── .gitignore                      # Git ignore rules for environment and secrets
├── .env.example                    # Global environment template
├── docker-compose.yml              # Docker setup for PostgreSQL & pgAdmin
├── README.md                       # Project documentation
├── screenshots/                    # Screenshot asset directory (Placeholders)
│   ├── 01_login_page.png
│   ├── 02_dashboard.png
│   ├── 03_project_details.png
│   ├── 04_finding_details.png
│   ├── 05_security_memory.png
│   ├── 06_memory_chat.png
│   └── 07_pdf_report.png
├── backend/
│   ├── .env.example                # Backend environment template
│   ├── alembic/                    # Database migration scripts
│   ├── app/
│   │   ├── api/v1/                 # REST API endpoints (auth, projects, findings, memory, ai)
│   │   ├── core/                   # Security, JWT, configuration settings
│   │   ├── database/               # DB connection sessions & base models
│   │   ├── models/                 # SQLAlchemy ORM schemas
│   │   ├── repositories/           # Database access layer
│   │   ├── schemas/                # Pydantic validation schemas
│   │   └── services/               # Business logic, AI, report generation & memory engine
│   ├── assets/                     # REDLINE branding assets and logos
│   ├── requirements.txt            # Python dependencies
│   └── scripts/                    # Database seed scripts
└── frontend/
    ├── public/                     # Public assets, favicon, logos
    ├── src/
    │   ├── api/                    # Axios API client modules
    │   ├── components/             # Reusable UI components (modals, memory widgets)
    │   ├── context/                # Authentication context provider
    │   ├── pages/                  # Main page views (Dashboard, Projects, Findings, Memory)
    │   ├── theme.ts                # REDLINE SOC theme tokens (C.red, dark background)
    │   ├── App.tsx                 # Application routes
    │   └── main.tsx                # React entry point
    └── package.json                # Frontend dependencies
```

---

## ⚙️ Environment Setup & Configuration

### 1. Root Environment File (`.env.example`)
Copy `.env.example` to `.env` in the root folder:
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=redline_db
POSTGRES_PORT=5432
PGADMIN_PORT=5050
```

### 2. Backend Environment File (`backend/.env.example`)
Copy `backend/.env.example` to `backend/.env`:
```ini
# Database Connection
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/redline_db

# Security & JWT Authentication
SECRET_KEY=replace_with_a_secure_random_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Gemini AI / LLM Configuration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-3.5-flash-lite

# Hindsight Persistent Security Memory Engine
HINDSIGHT_API_URL=http://localhost:8888
HINDSIGHT_API_KEY=your_optional_hindsight_api_key
HINDSIGHT_TIMEOUT_SECONDS=5.0
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Docker Desktop (for PostgreSQL container)

### Step 1: Launch Database Containers
```bash
docker-compose up -d
```
Verify PostgreSQL is running on port `5432` and pgAdmin on port `5050`.

### Step 2: Backend Setup & Migrations
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
python scripts/seed_admin.py
```

*Default Seed Credentials:*
- **Admin User**: `eswar@cdac.in` / `admin123`
- **Auditor User**: `auditor@cdac.in` / `auditor123`

### Step 3: Start FastAPI Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

### Step 4: Frontend Setup & Launch
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
Access the application in your browser at `http://localhost:5173`.

---

## 🎬 Synthetic Walkthrough Scenario

1. **Create VAPT Assessment**: Log in as `eswar@cdac.in`. Create a project named **Project Alpha** (`PAL-001`).
2. **Record Finding**: Add a finding for *"SQL Injection in Login Endpoint"*.
3. **Perform Retest**: Conduct a retest, mark the status as **PASSED**, and provide auditor notes.
4. **Retain Memory**: Click **Retain to Security Memory**. The system redacts sensitive input and stores the fix pattern.
5. **Cross-Project Intelligence**: Create **Project Beta** (`PBT-002`) and log a new SQL injection finding. Open the finding page to view **Similar Findings from Security Memory** automatically loaded from Project Alpha.
6. **Query AI Memory Chat**: Navigate to `/memory-chat` and ask *"What SQL injection remediations were verified in prior projects?"* to receive grounded AI advice with cited memories.

---

## 📄 License & Attribution

Developed for **REDLINE Security Operations**.  
Repository: [eswaranumothu/redline-security-agent](https://github.com/eswaranumothu/redline-security-agent)
