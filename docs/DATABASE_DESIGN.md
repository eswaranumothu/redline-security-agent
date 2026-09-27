# Database Design

## Tables

### users

Stores application users.

Relationship

One User

↓

Many Projects

---

### projects

A security assessment project.

Contains

- Client
- Application
- Auditor
- Findings
- Reports

Relationship

One Project

↓

Many Findings

One Project

↓

Many Reports

---

### master_vulnerabilities

Organization vulnerability knowledge base.

Only administrators can modify.

Contains

- Description
- Impact
- Recommendation
- Solution
- Severity
- CVSS
- CWE
- OWASP
- AI Prompt

No screenshots.

No reproduction steps.

---

### findings

Project-specific vulnerability.

Can originate from

- Master Vulnerability

or

- Custom Vulnerability

Finding stores its own copy of the vulnerability data.

Changes never affect the master library.

---

### finding_evidence

Evidence attached to a finding.

Each evidence contains

- Screenshot
- Step Description

Multiple evidence records belong to one finding.

---

### reports

Generated reports.

Supports multiple versions.

Example

Project

↓

Report v1

↓

Report v2

↓

Report v3