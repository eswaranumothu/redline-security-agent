from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, Spacer, Table, TableStyle

from app.services.report.brand import LIGHT_GRAY, RED, report_styles
from app.services.report.sections.summary_page import paragraph, section_bar


class FindingPage:
    @staticmethod
    def build(report, story):
        s = report_styles()
        project_root = Path(__file__).resolve().parents[5]
        for index, finding in enumerate(report.findings, 1):
            story.append(PageBreak())
            story.append(Paragraph("Vulnerability in Detail", s["title"]))
            title_row = Table([[Paragraph(f"{index}. {escape(finding.title)}", s["table_head"]), Paragraph(escape(finding.severity or "Unrated"), s["table_head"])]], colWidths=[145 * mm, 29 * mm])
            title_row.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), RED), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
            story.append(title_row)
            story.append(Spacer(1, 3 * mm))
            details = [("Affected URL", report.application_url or report.application_name), ("CWE", finding.cwe), ("OWASP", finding.owasp), ("CVSS", finding.cvss_score), ("Status", finding.status)]
            story.append(Table([[paragraph(f"{name} :", s["table"]), paragraph(value, s["table"])] for name, value in details], colWidths=[34 * mm, 140 * mm], style=[("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
            story.append(Spacer(1, 2 * mm))
            sections = [("Description", finding.description), ("Business Impact", finding.impact), ("Proof of Concept", None)]
            for section, content in sections:
                story.append(section_bar(f"{index}.{1 if section == 'Description' else 2 if section == 'Business Impact' else 3} {section}", s))
                if content:
                    story.append(paragraph(content, s["body"]))
                if section == "Proof of Concept":
                    if not finding.cases:
                        story.append(paragraph("No evidence has been uploaded for this finding.", s["body"]))
                    for case_index, case in enumerate(finding.cases, 1):
                        story.append(Paragraph(f"{index}.3.{case_index} {escape(case.label)}", s["subsection"]))
                        for step_index, evidence in enumerate(case.evidences, 1):
                            story.append(Paragraph(f"{index}.3.{case_index}.{step_index} Step {step_index}", s["small"]))
                            if evidence.description:
                                story.append(paragraph(evidence.description, s["body"]))
                            if evidence.image_path:
                                image_path = project_root / Path(evidence.image_path)
                                if image_path.exists():
                                    image = Image(str(image_path))
                                    image._restrictSize(5.5 * inch, 3.65 * inch)
                                    story.append(image)
                                else:
                                    story.append(paragraph("Screenshot file not found.", s["body"]))
                            story.append(Spacer(1, 3 * mm))
            story.append(section_bar(f"{index}.4 Workarounds/Solutions", s))
            story.append(paragraph(finding.solution or finding.recommendation or "No workaround or remediation has been provided.", s["body"]))

    @staticmethod
    def build_end_page(story):
        s = report_styles()
        story.append(PageBreak())
        story.append(Spacer(1, 120 * mm))
        story.append(Paragraph("**End of Report**", s["end"]))
