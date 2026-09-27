# CDAC AI Report Generator

## Overview

CDAC AI Report Generator is an AI-assisted Vulnerability Assessment and Penetration Testing (VAPT) reporting platform.

The application enables auditors to:

- Create security assessment projects
- Manage findings
- Upload screenshots
- Generate reproduction steps using AI
- Generate descriptions, impacts, recommendations and solutions using AI
- Produce professional organization-specific reports

---

# User Roles

## Administrator

Responsible for platform management.

Permissions

- Manage Users
- Manage Projects
- Manage Master Vulnerability Library
- View All Projects
- Generate Reports

---

## Auditor

Responsible for conducting assessments.

Permissions

- Create Projects
- Create Findings
- Create Custom Findings
- Upload Evidence
- Generate AI Content
- Generate Reports

Cannot

- Modify Master Vulnerability Library
- Manage Users

---

# System Modules

Authentication

↓

User Management

↓

Projects

↓

Findings

↓

Evidence

↓

Master Vulnerability Library

↓

AI Assistant

↓

Report Generator

---

# High-Level Workflow

Login

↓

Create Project

↓

Create Finding

↓

Select Master Vulnerability

or

Create Custom Vulnerability

↓

Upload Evidence

↓

Generate AI Steps

↓

Generate AI Content

↓

Review

↓

Generate Report