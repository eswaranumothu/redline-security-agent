# API Design

## Authentication

POST /auth/login

---

## Users

POST /users

GET /users

GET /users/{id}

PUT /users/{id}

PATCH /users/change-password

DELETE /users/{id}

---

## Projects

POST /projects

GET /projects

GET /projects/{id}

PUT /projects/{id}

DELETE /projects/{id}

---

## Master Vulnerabilities

POST /master-vulnerabilities

GET /master-vulnerabilities

GET /master-vulnerabilities/{id}

PUT /master-vulnerabilities/{id}

DELETE /master-vulnerabilities/{id}

---

## Findings

POST /findings

GET /findings

GET /findings/{id}

PUT /findings/{id}

DELETE /findings/{id}

---

## Evidence

POST /evidence

GET /evidence/{id}

PUT /evidence/{id}

DELETE /evidence/{id}

POST /evidence/{id}/generate-step

---

## Reports

POST /reports/generate

GET /reports/{id}

GET /projects/{project_id}/reports