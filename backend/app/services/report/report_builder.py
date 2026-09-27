from collections import defaultdict
from datetime import datetime

from app.schemas.report import (
    ReportData,
    FindingData,
    CaseData,
    EvidenceData,
)


class ReportBuilder:

    SEVERITY_ORDER = {
        "Critical": 1,
        "High": 2,
        "Medium": 3,
        "Low": 4,
        "Informational": 5,
        None: 6,
    }

    @staticmethod
    def build(
        project,
        findings,
        historical_memories: list = None,
    ) -> ReportData:

        # Sort findings by severity
        findings = sorted(
            findings,
            key=lambda f: ReportBuilder.SEVERITY_ORDER.get(f.severity, 999),
        )

        report_findings = []

        for finding in findings:

            # Group evidences by case_label, preserving insertion order
            case_map: dict[str, list[EvidenceData]] = defaultdict(list)

            for evidence in sorted(
                finding.evidences,
                key=lambda e: (
                    e.case_label,
                    e.display_order,
                ),
            ):
                case_map[evidence.case_label].append(
                    EvidenceData(
                        image_path=evidence.screenshot_path,
                        description=evidence.caption,
                        case_label=evidence.case_label,
                        display_order=evidence.display_order,
                    )
                )

            cases = [
                CaseData(label=label, evidences=evs)
                for label, evs in case_map.items()
            ]

            report_findings.append(
                FindingData(
                    title=finding.title,
                    severity=finding.severity,
                    cvss_score=float(finding.cvss_score) if finding.cvss_score else None,
                    cvss_vector=finding.cvss_vector,
                    cwe=finding.cwe,
                    owasp=finding.owasp,
                    description=finding.description,
                    impact=finding.impact,
                    recommendation=finding.recommendation,
                    solution=finding.solution,
                    status=finding.status,
                    cases=cases,
                )
            )

        from app.schemas.report import HistoricalMemoryData
        mem_items = []
        if historical_memories:
            for m in historical_memories:
                mem_items.append(
                    HistoricalMemoryData(
                        project_name=m.get("project_name", "Historical Project"),
                        finding_title=m.get("finding_title", "Finding"),
                        vulnerability_category=m.get("vulnerability_category", "Vulnerability"),
                        severity=m.get("severity", "MEDIUM"),
                        retest_status=m.get("retest_status", "NOT_TESTED"),
                        remediation_summary=m.get("remediation_summary"),
                        explanation=m.get("explanation"),
                    )
                )

        return ReportData(
            project_name=project.project_name,
            project_code=project.project_code,
            client_name=project.client_name,
            application_name=project.application_name,
            application_url=project.application_url,
            ip_address=project.ip_address,
            operating_system=project.operating_system,
            language=project.language,
            web_server=project.web_server,
            ports_scanned=project.ports_scanned,
            project_type=project.project_type,
            scope=project.scope,
            start_date=str(project.start_date),
            end_date=str(project.end_date) if project.end_date else None,
            project_status=project.status,
            auditor_name=(project.auditor.full_name if project.auditor else None),
            generated_at=datetime.now().strftime("%a, %b %d, %Y, %H:%M"),
            findings=report_findings,
            historical_memories=mem_items,
        )
