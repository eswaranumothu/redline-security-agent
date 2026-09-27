from collections import Counter
from xml.sax.saxutils import escape

from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.shapes import Drawing, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, Spacer, Table, TableStyle

from app.services.report.brand import BLUE, LIGHT_GRAY, NAVY, PALE_BLUE, RED, report_styles


def paragraph(text, style):
    return Paragraph(escape(str(text or "-")), style)


def section_bar(title, styles):
    table = Table([[Paragraph(escape(title), styles["subsection"])]], colWidths=[174 * mm])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
    return table


class SummaryPage:
    @staticmethod
    def build_front_matter(report, story):
        s = report_styles()
        # Intentional blank page
        story.append(Spacer(1, 115 * mm))
        blank = ParagraphStyle("Blank", parent=s["body"], alignment=TA_CENTER, fontSize=8)
        story.append(Paragraph("This is intentionally left blank", blank))
        story.append(PageBreak())

        story.append(Paragraph("Security Audit Details", s["title"]))
        story.append(section_bar("Security Audit Details", s))
        audit_details = [
            [paragraph("Resource Name:", s["table"]), paragraph(report.project_name, s["table"])],
            [paragraph("Testing URL:", s["table"]), paragraph(report.application_url or report.application_name, s["table"])],
            [paragraph("Assessment period:", s["table"]), paragraph(f"{report.start_date} to {report.end_date or 'Not provided'}", s["table"])],
        ]
        for label, value in [
            ("IP Address:", report.ip_address),
            ("Operating System:", report.operating_system),
            ("Language:", report.language),
            ("Web Server:", report.web_server),
            ("Ports Scanned:", report.ports_scanned),
        ]:
            if value:
                audit_details.append([paragraph(label, s["table"]), paragraph(value, s["table"])])
        story.append(Table(audit_details, colWidths=[38 * mm, 136 * mm], style=[("VALIGN", (0, 0), (-1, -1), "TOP"), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
        story.append(Spacer(1, 5 * mm))
        story.append(section_bar("Confidentiality and Liability Disclaimer", s))
        story.append(Paragraph("Confidentiality Notice", s["subsection"]))
        disclaimer = ("All information contained herein is confidential and proprietary to REDLINE. "
                      "Unauthorised use, disclosure, reproduction or dissemination of this report, in whole or in part, is prohibited without prior written consent. "
                      "This document is intended solely to support the security enhancement of the assessed application.")
        story.append(paragraph(disclaimer, s["body"]))
        story.append(Paragraph("Intellectual Property", s["subsection"]))
        story.append(paragraph("The contents of this report, including text, images and findings, remain the intellectual property of REDLINE and are protected by applicable copyright and licensing laws.", s["body"]))
        story.append(Paragraph("Disclaimer of Warranty and Limitation of Liability", s["subsection"]))
        for item in [
            'The information and recommendations provided in this document are furnished on an "AS IS" basis, without any warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
            "REDLINE shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of the use of or inability to use the information contained in this document, even if REDLINE has been advised of the possibility of such damages.",
            "REDLINE assumes no responsibility for errors, omissions, or inaccuracies in the information provided. The recommendations contained herein are based on REDLINE's professional judgment at the time of preparation, and REDLINE reserves the right to update, modify, or withdraw any recommendations without prior notice.",
            "In no event shall REDLINE be liable for any financial losses or damages incurred by any current or former employee of REDLINE, any member of the public, or any other party because of using or misusing this document or the information contained therein.",
            "By accessing or using this document, you acknowledge that you have read, understood, and agree to be bound by the terms of this disclaimer.",
        ]:
            story.append(paragraph(f"- {item}", s["body"]))
        story.append(PageBreak())

        story.append(Paragraph("Document Control", s["title"]))
        status_label = "Stage 1" if report.project_status == "STAGE1" else "Draft"
        control = [[paragraph(x, s["table_head"]) for x in ["S. no", "Version No", "Start Date", "End Date", "Approved by", "Comments"]],
                   [paragraph("1", s["table"]), paragraph("1.0", s["table"]), paragraph(report.start_date, s["table"]), paragraph(report.end_date or "-", s["table"]), paragraph("-", s["table"]), paragraph(f"Security Assessment Report - {status_label}", s["table"])]]
        table = Table(control, colWidths=[12 * mm, 21 * mm, 29 * mm, 29 * mm, 34 * mm, 49 * mm])
        table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), NAVY), ("BACKGROUND", (0, 1), (-1, -1), PALE_BLUE), ("GRID", (0, 0), (-1, -1), .25, colors.HexColor("#a9b9c9")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
        story.append(table)
        story.append(Spacer(1, 130 * mm))
        sign_off = Paragraph("REDLINE Analyst<br/>Information Security Services", s["table"])
        sign = Table([[paragraph("Auditors:", s["table_head"]), paragraph(report.auditor_name or "Not assigned", s["table_head"])], [paragraph("Sign Off:", s["table"]), sign_off]], colWidths=[35 * mm, 139 * mm])
        sign.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), NAVY), ("BACKGROUND", (0, 1), (-1, -1), PALE_BLUE), ("GRID", (0, 0), (-1, -1), .25, colors.HexColor("#a9b9c9")), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
        story.append(sign)
        story.append(PageBreak())

        story.append(Paragraph("Table of Content", s["title"]))
        story.append(section_bar("Table of Content", s))
        toc = ["Security Audit Details", "Disclaimer", "Document Control", "Summary", "Risk Level", "Threats Summary", "Executive Summary", "Vulnerability in Detail", "Annexure"]
        for i, item in enumerate(toc, 1):
            story.append(paragraph(f"{i}.   {item}", s["body"]))
            story.append(Spacer(1, 2 * mm))
        story.append(PageBreak())

    @staticmethod
    def build(report, story):
        s = report_styles()
        counts = Counter((f.severity or "Informational").title() for f in report.findings)
        highest = next((level for level in ["Critical", "High", "Medium", "Low", "Informational"] if counts[level]), "Informational")
        story.append(Paragraph("Summary", s["title"]))
        story.append(section_bar("Summary", s))
        info = [["Application Name", report.application_name], ["Client", report.client_name], ["Scope", report.scope or "Not provided"], ["Project Code", report.project_code]]
        story.append(Table([[paragraph(a + " :", s["table"]), paragraph(b, s["table"])] for a, b in info], colWidths=[43 * mm, 131 * mm], style=[("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
        story.append(Spacer(1, 4 * mm))
        story.append(section_bar("Risk Level", s))
        risk_style = ParagraphStyle("Risk", parent=s["body"], textColor=RED, fontName="Helvetica-Bold", fontSize=10)
        story.append(Paragraph(highest.upper(), risk_style))
        story.append(paragraph(f"The overall threat level is rated {highest} based on the findings identified during this assessment.", s["body"]))
        story.append(Spacer(1, 3 * mm))
        story.append(section_bar("Threats Summary", s))
        story.append(paragraph(f"Total Threats Found: {len(report.findings)}", s["body"]))
        data = [counts[x] for x in ["Critical", "High", "Medium", "Low", "Informational"]]
        if not any(data): data = [1, 0, 0, 0, 0]
        drawing = Drawing(120 * mm, 72 * mm)
        pie = Pie()
        pie.x, pie.y, pie.width, pie.height = 40 * mm, 1 * mm, 55 * mm, 55 * mm
        pie.data = data
        total = sum(data)
        pie.labels = [f"{(value / total) * 100:.1f}%" if value else "" for value in data]
        palette = [colors.HexColor("#b00020"), colors.HexColor("#e00000"), colors.HexColor("#e2a500"), colors.HexColor("#56a84f"), colors.HexColor("#3f8fc6")]
        for i, color in enumerate(palette):
            pie.slices[i].fillColor = color
        pie.slices.strokeWidth = 0.3
        drawing.add(pie)
        drawing.add(String(104 * mm, 43 * mm, "Severity", fontSize=7))
        for i, label in enumerate(["Critical", "High", "Medium", "Low", "Informational"]):
            percentage = (counts[label] / total) * 100
            drawing.add(String(104 * mm, (36 - i * 6) * mm, f"{label}: {counts[label]} ({percentage:.1f}%)", fontSize=6.5, fillColor=palette[i]))
        story.append(drawing)
        story.append(PageBreak())

        story.append(Paragraph("Executive Summary", s["title"]))
        summary = f"REDLINE has conducted a security assessment of {report.application_url or report.application_name} from {report.start_date} to {report.end_date or 'the stated completion date'}. The vulnerabilities and weaknesses observed during the evaluation are listed below. Results represent the application posture during the assessment period only."
        story.append(paragraph(summary, s["body"]))
        story.append(Table([[paragraph("Overall Threat Level", s["table_head"]), paragraph(highest, s["table_head"])]], colWidths=[140 * mm, 34 * mm], style=[("BACKGROUND", (0, 0), (-1, -1), RED), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
        headers = ["S. no", "Discovered at", "Vulnerability", "Recommendation", "Risk Level"]
        rows = [[paragraph(x, s["table_head"]) for x in headers]]
        for i, finding in enumerate(report.findings, 1):
            recommendation = finding.recommendation or finding.solution or "-"
            rows.append([paragraph(i, s["table"]), paragraph(report.application_url or "-", s["table"]), paragraph(finding.title, s["table"]), paragraph(recommendation, s["table"]), paragraph(finding.severity or "-", s["table"])])
        findings_table = Table(rows, colWidths=[11 * mm, 25 * mm, 34 * mm, 84 * mm, 20 * mm], repeatRows=1)
        findings_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), NAVY), ("GRID", (0, 0), (-1, -1), .25, colors.HexColor("#777777")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
        story.append(Spacer(1, 4 * mm))
        story.append(findings_table)
