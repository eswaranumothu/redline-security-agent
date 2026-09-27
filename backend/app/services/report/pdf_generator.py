from reportlab.platypus import NextPageTemplate, PageBreak, Spacer

from app.services.report.brand import BrandedDocTemplate
from app.services.report.sections.cover_page import CoverPage
from app.services.report.sections.summary_page import SummaryPage
from app.services.report.sections.finding_page import FindingPage


class PDFGenerator:

    @staticmethod
    def generate(
        report,
        output_path,
    ):

        document = BrandedDocTemplate(output_path)

        story = []

        CoverPage.build(
            report,
            story,
        )

        story.append(NextPageTemplate("body"))
        story.append(PageBreak())
        SummaryPage.build_front_matter(report, story)

        SummaryPage.build(
            report,
            story,
        )

        FindingPage.build(
            report,
            story,
        )

        FindingPage.build_end_page(story)

        document.build(story)
