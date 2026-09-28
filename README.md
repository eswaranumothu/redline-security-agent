# REDLINE — Security That Remembers 🛡️⚡
AI-Powered VAPT Management & Reporting Platform with Persistent Security Memory (Hindsight Engine)

## 💡 Why REDLINE Was Introduced (Motivation & Vision)

Technology is evolving day by day, and with rapid digital transformation, the **attack surface is constantly expanding**. For Vulnerability Assessment and Penetration Testing (VAPT) engineers, SOC analysts, and security consultants, keeping pace with this evolving landscape presents a formidable challenge.

Beyond standardized CVEs, modern application security assessments involve custom business logic vulnerabilities, complex multi-step attack vectors, sub-domain misconfigurations, and novel exploitation techniques that are specific to modern tech stacks. In conventional VAPT workflows:
- **Historical context is lost**: Assessments end with static PDF reports that are archived and forgotten.
- **Security Amnesia**: When new projects begin or different auditors join a team, engineers spend hours re-discovering attack vectors, re-writing vulnerability descriptions, and re-inventing remediation strategies that were already tested and proven in past projects.
- **Disconnected Findings**: Previous retest results, proof-of-concept (PoC) steps, and verified fixes are rarely connected across different applications or client environments.

### 🛡️ The REDLINE Solution
**REDLINE Security Agent** was introduced to solve cybersecurity amnesia. REDLINE transforms VAPT management by integrating an **AI Persistent Security Memory Engine (Hindsight Engine)** with Large Language Models (LLMs). 

It acts as a collective security brain that remembers previous findings, projects, attack steps, business impacts, and verified remediations across all past assessments. When a VAPT engineer logs a new vulnerability, REDLINE instantly recalls similar past findings, suggests proven fixes, and allows auditors to query historical project knowledge via a grounded AI Memory Chat.

---

## 🧠 Core Feature Highlight: Hindsight Persistent Security Memory Engine

At the heart of REDLINE is **Hindsight** — an intelligent vector memory technology designed specifically for cybersecurity auditing:

> [!IMPORTANT]
> **Hindsight** bridges past security assessments with active audits, ensuring that an organization never loses its security expertise or remediation context when team members transition or new projects launch.

### Key Capabilities of Hindsight Memory:

1. **Semantic Memory Retention (`/v1/retain`)**:
   - Stores sanitized vulnerability signatures, technical descriptions, attack steps, business impacts, CWE/OWASP categories, and verified retest outcomes (`PASSED` / `FAILED`) into long-term vector memory.

2. **Cross-Project Intelligence Recall (`/v1/recall`)**:
   - When an auditor inspects or logs a finding in a new project, REDLINE automatically searches security memory using vector embeddings.
   - It presents the auditor with **Similar Historical Findings**, including original project tags, past severity ratings, proven remediation steps, and previous auditor notes.

3. **Grounded AI Security Memory Chat (`/memory-chat`)**:
   - A Retrieval-Augmented Generation (RAG) assistant powered by LLM integration (Local LLM / Google Gemini).
   - Allows security engineers and SOC leads to query all accumulated project knowledge in natural language (e.g., *"What attack steps and remediations were verified for GraphQL IDOR flaws in prior fintech audits?"*).
   - Answers are strictly grounded in sanitized historical records with direct source citations.

4. **Automated Confidentiality Guardrails**:
   - Before storing memory vectors, REDLINE automatically redacts sensitive data including passwords, Bearer tokens, API keys, database connection strings, and authorization headers to maintain strict client data confidentiality.

5. **Resilient Fallback Engine**:
   - If the external vector memory engine is unreachable, REDLINE seamlessly falls back to PostgreSQL `security_memories` table searches without interrupting the auditor's workflow.

---

## 🎯 Perfect Use Case: Where REDLINE Is Particularly Required

### 🏢 Scenario: Enterprise Security Operations & MSSP Security Audits

Consider a Managed Security Service Provider (MSSP) or an Enterprise Application Security team responsible for testing dozens of web applications, APIs, and microservices throughout the year, with a team of rotating junior and senior VAPT engineers.

#### The Challenge Without REDLINE:
- **Auditor A** conducts a VAPT on a microservice 6 months ago, spending 12 hours researching and verifying a complex OAuth 2.0 PKCE implementation flaw, formulating tailored remediation steps for the development team.
- **Auditor B** (a newer team member) is assigned to audit a separate client application today that utilizes the exact same OAuth architecture and exhibits the same vulnerability.
- Without REDLINE, Auditor B has no knowledge of Auditor A's work. Auditor B wastes hours re-researching attack vectors, struggling to write the business impact, and risking inaccurate remediation advice.

#### The REDLINE Experience:
1. **Instant Context Recall**: When Auditor B types the vulnerability title *"OAuth 2.0 PKCE State Validation Missing"* into REDLINE, the **Hindsight Engine** instantly displays Auditor A's previous finding from 6 months ago.
2. **Actionable Attack Steps & Impact**: Auditor B immediately sees the exact attack steps, business impact rating, CWE mapping, and verified fix code that succeeded in the past.
3. **Automated Documentation**: Auditor B uses REDLINE's LLM feature to generate a polished description and PoC analysis in seconds.
4. **Standardized Quality**: Audit completion time is cut by **70%**, remediation guidance is consistent across clients, and executive reporting is generated with a single click.

---


## 📸 Application Highlights & Screenshots

### 1. Analyst Dashboard

<img width="947" alt="Analyst Dashboard" src="https://github.com/user-attachments/assets/8d52edfc-6044-4677-8a37-2bcab0eed4a1" />

Centralized security operations dashboard providing an overview of active VAPT projects, vulnerability severity, assessment statistics, historical security memory, and quick navigation to essential modules.

---

### 2. Finding Page | Past Memory

<img width="947" alt="Finding Page Past Memory" src="https://github.com/user-attachments/assets/8e58c6c0-f271-4e02-ad83-113b5eecb7f8" />

Displays identified vulnerabilities, technical evidence, severity, and remediation details, with a dedicated **Past Memory** button to retrieve relevant findings and insights from previous assessments using Hindsight.

---

### 3. Past Memory | Hindsight Recall

<img width="947" alt="Past Memory Hindsight Recall" src="https://github.com/user-attachments/assets/5449195d-943e-4edd-a477-eb502b800151" />

Retrieves relevant historical security knowledge, including previously observed attack patterns, exploitation steps, business impact, and remediation strategies. **Hindsight** provides persistent memory across assessments, helping analysts reuse and build upon past experience.

---

### 4. AI Memory Chat | Launcher

<img width="947" alt="AI Memory Chat Launcher" src="https://github.com/user-attachments/assets/9e3264e5-644d-4c2f-9b92-3bc77ee3a43a" />

Dedicated AI memory chat entry point, represented by an intuitive chat icon, allowing analysts to access historical VAPT knowledge and interact with the security memory assistant from the platform.

---

### 5.  AI Memory Chat | Interactive Queries

<img width="947" alt="AI Memory Chat Interactive Queries" src="https://github.com/user-attachments/assets/5e6a055f-164e-4d41-a36b-48d37173e043" />

Conversational AI assistant powered by **Retrieval-Augmented Generation (RAG) and Hindsight**. Analysts can ask questions such as:

- "Have we encountered this vulnerability before?"
- "What exploitation techniques worked in previous assessments?"
- "Show me similar findings and their remediation steps."

Responses draw on relevant historical security knowledge with source references.

---

### 6. AI-Powered Vulnerability Details

<img width="947" alt="AI-Powered Vulnerability Details" src="https://github.com/user-attachments/assets/330dc6a7-22d1-4aec-a1d7-706bae50f549" />

Enter a **vulnerability name** and click **Generate** to let the integrated LLM automatically populate vulnerability details, including:

- **Severity**
- **CVSS Score**
- **CWE**
- **OWASP Classification**
- **CVSS Vector**
- **Technical Description**
- **Business Impact**

This AI-powered feature streamlines vulnerability documentation and reduces manual effort for VAPT engineers.

---

### 7. VAPT Report PDF

<img width="947" alt="VAPT Report PDF" src="https://github.com/user-attachments/assets/a3a4b6ef-c772-4cfd-bb6c-3441bc424ee0" />

Generates professional, branded VAPT reports containing vulnerability details, severity classifications, evidence, business impact, remediation guidance, and relevant historical context, supporting consistent security reporting and assessment reviews.

---

## 🛠️ Application Architecture

REDLINE is built with a decoupled, high-performance architecture designed for scale, resilience, and security.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          REDLINE Frontend (Vite + React 18)                            │
│                       Material-UI (MUI v5) SOC Dark Theme                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API (JWT Bearer Tokens)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             REDLINE Backend (FastAPI)                                  │
│                                                                                        │
│   ┌─────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐   │
│   │ Authentication      │   │ VAPT Project &        │   │ Hindsight Security       │   │
│   │ Service (JWT/RBAC)  │   │ Findings Engine       │   │ Memory Service           │   │
│   └─────────────────────┘   └───────────────────────┘   └──────────────────────────┘   │
│   ┌─────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐   │
│   │ LLM AI Service      │   │ PDF/DOCX Executive    │   │ Data Sanitization        │   │
│   │ (Gemini / Local LLM)│   │ Report Builder        │   │ & Guardrails Engine      │   │
│   └─────────────────────┘   └───────────────────────┘   └──────────────────────────┘   │
└───────────────┬───────────────────────────┬───────────────────────────┬────────────────┘
                │                           │                           │
┌───────────────▼───────────────┐ ┌─────────▼──────────┐ ┌──────────────▼─────────────┐
│ PostgreSQL Database 16        │ │ Gemini / LLM API   │ │ Hindsight Vector Memory     │
│ (User data, projects,         │ │ (PoC analysis, RAG │ │ Engine (Vector storage &    │
│  findings & memory fallback)  │ │  chat generation)  │ │  semantic recall)           │
└───────────────────────────────┘ └────────────────────┘ └─────────────────────────────┘
```

---

## 📁 Codebase Architecture & Directory Structure

```
redline-security-agent/
├── docker-compose.yml              # Docker orchestration for PostgreSQL & pgAdmin
├── README.md                       # Project documentation
├── screenshots/                    # Screenshot asset directory
│   ├── 01_login_page.png
│   ├── 02_dashboard.png
│   ├── 03_project_details.png
│   ├── 04_finding_details.png
│   ├── 05_security_memory.png
│   ├── 06_memory_chat.png
│   ├── 07_pdf_report.png
│   └── 08_ai_generation.png
│
├── backend/                        # FastAPI Backend Application
│   ├── alembic/                    # DB Migration scripts (Alembic)
│   ├── app/
│   │   ├── api/v1/                 # API Routes & Endpoints
│   │   │   ├── auth.py             # User login, registration & token generation
│   │   │   ├── projects.py         # VAPT Project CRUD operations
│   │   │   ├── findings.py         # Finding logs, retesting & memory retention
│   │   │   ├── memory.py           # Security memory recall & transparency view
│   │   │   ├── ai.py               # LLM generation & RAG Memory Chat endpoints
│   │   │   └── reports.py          # PDF / Doc report generation
│   │   ├── core/                   # System Configuration, Security & JWT handlers
│   │   ├── database/               # Async engine, Session local & Base ORM models
│   │   ├── models/                 # SQLAlchemy 2.0 ORM DB schemas (User, Project, Finding, Memory)
│   │   ├── repositories/           # Data access objects (DAO pattern)
│   │   ├── schemas/                # Pydantic v2 request/response validation schemas
│   │   └── services/               # Core Business Logic Layer
│   │       ├── ai_service.py       # LLM integration & prompt engineering
│   │       ├── hindsight_service.py# Vector memory retention, recall & fallback logic
│   │       ├── memory_service.py   # Data sanitization, redaction & memory management
│   │       └── report_service.py   # ReportLab PDF building engine
│   ├── assets/                     # Brand assets, templates & logos
│   ├── requirements.txt            # Python backend dependencies
│   └── scripts/                    # Database seeding scripts (seed_admin.py)
│
└── frontend/                       # React 18 + Vite Frontend Application
    ├── public/                     # Static assets, branding icons & favicon
    ├── src/
    │   ├── api/                    # Axios REST client API integrations
    │   ├── components/             # Reusable SOC UI Components
    │   │   ├── common/             # Buttons, Cards, Loading States & Modals
    │   │   ├── memory/             # Similar Findings Panel & Retain Memory dialogs
    │   │   └── layout/             # Sidebar, Header & Navigation structure
    │   ├── context/                # AuthContext & React Query state wrappers
    │   ├── pages/                  # Main Application Views
    │   │   ├── Login.tsx           # Authentication page
    │   │   ├── Dashboard.tsx       # SOC Overview & Metrics dashboard
    │   │   ├── Projects.tsx        # Project list & creation modal
    │   │   ├── ProjectDetails.tsx  # Project management & findings table
    │   │   ├── FindingDetails.tsx  # Finding details, retest & memory recall panel
    │   │   ├── MemoryTransparency.tsx # Security memory transparency viewer
    │   │   └── MemoryChat.tsx      # Grounded AI RAG Chat interface
    │   ├── theme.ts                # Crimson Dark SOC design tokens
    │   ├── App.tsx                 # React Router v6 route configuration
    │   └── main.tsx                # Application entry point
    └── package.json                # Frontend package manifest & scripts
```

---

## 🔒 Security & Privacy Safeguards

- **Automated Data Redaction**: Secrets, passwords, API keys, JWT Bearer tokens, connection strings, and authorization headers are automatically sanitized prior to memory retention.
- **Role-Based Access Control (RBAC)**: Enforces access restrictions between Auditors (assigned projects only) and Administrators (full system access).
- **Secret Isolation**: Configuration secrets (`.env`), JWT keys, evidence uploads, and generated reports are strictly ignored via `.gitignore`.

---

## ⚙️ Quick Start & Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Docker Desktop (for PostgreSQL container)

### Step 1: Launch Database Container
```bash
docker-compose up -d
```
*PostgreSQL runs on port `5432` and pgAdmin on port `5050`.*

### Step 2: Backend Setup & Database Seed
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
- **Admin**: `eswar@cdac.in` / `admin123`
- **Auditor**: `auditor@cdac.in` / `auditor123`

### Step 3: Start FastAPI Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
*API Swagger Documentation: `http://localhost:8000/docs`*

### Step 4: Launch React Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Access REDLINE in your browser at `http://localhost:5173`.*

---

## 📄 License & Attribution

Developed for **REDLINE Security Operations**.  
Repository: [eswaranumothu/redline-security-agent](https://github.com/eswaranumothu/redline-security-agent)
