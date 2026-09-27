from pydantic import BaseModel


class EvidenceData(BaseModel):
    image_path: str | None = None
    description: str | None = None
    case_label: str = "Case 1"
    display_order: int = 1


class CaseData(BaseModel):
    label: str
    evidences: list[EvidenceData] = []


class FindingData(BaseModel):
    title: str
    severity: str | None = None
    cvss_score: float | None = None
    cvss_vector: str | None = None
    cwe: str | None = None
    owasp: str | None = None
    description: str | None = None
    impact: str | None = None
    recommendation: str | None = None
    solution: str | None = None
    status: str | None = None
    cases: list[CaseData] = []


class HistoricalMemoryData(BaseModel):
    project_name: str
    finding_title: str
    vulnerability_category: str
    severity: str
    retest_status: str
    remediation_summary: str | None = None
    explanation: str | None = None


class ReportData(BaseModel):
    project_name: str
    project_code: str
    client_name: str
    application_name: str
    application_url: str | None = None
    ip_address: str | None = None
    operating_system: str | None = None
    language: str | None = None
    web_server: str | None = None
    ports_scanned: str | None = None
    project_type: str
    scope: str | None = None
    start_date: str
    end_date: str | None = None
    project_status: str
    auditor_name: str | None = None
    generated_at: str | None = None
    findings: list[FindingData]
    historical_memories: list[HistoricalMemoryData] = []
