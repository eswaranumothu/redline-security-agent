from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Image, Paragraph, Spacer

from app.services.report.brand import LOGO


class CoverPage:
    @staticmethod
    def build(report, story):
        logo_title_style = ParagraphStyle("CoverLogoTitle", fontName="Helvetica-Bold", fontSize=26, leading=30, textColor="#d90000")
        logo_sub_style = ParagraphStyle("CoverLogoSub", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor="#555555")
        
        story.append(Paragraph("REDLINE", logo_title_style))
        story.append(Spacer(1, 1 * mm))
        story.append(Paragraph("SECURITY THAT REMEMBERS", logo_sub_style))
        story.append(Spacer(1, 22 * mm))
        heading = ParagraphStyle("CoverHeading", fontName="Helvetica", fontSize=11, leading=16)
        link = ParagraphStyle("CoverLink", parent=heading, textColor="#551A8B")
        story.append(Paragraph(f"{report.project_type.replace('_', ' ').title()} Security Assessment Report On", heading))
        story.append(Spacer(1, 5 * mm))
        story.append(Paragraph(report.application_url or report.application_name, link))
        story.append(Spacer(1, 83 * mm))
        detail = ParagraphStyle("CoverDetail", fontName="Helvetica", fontSize=8, leading=11, alignment=TA_CENTER)
        story.append(Paragraph("Conducted By:<br/>Security Services Division,<br/>REDLINE", detail))
        story.append(Spacer(1, 8 * mm))
        story.append(Paragraph(f"Report Generation Date:<br/>{report.generated_at or '-'}", detail))
