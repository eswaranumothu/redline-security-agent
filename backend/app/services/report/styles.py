from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.styles import ParagraphStyle

styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "TITLE",
    parent=styles["Heading1"],
    fontSize=24,
    leading=30,
    spaceAfter=30,
)

HEADING = ParagraphStyle(
    "HEADING",
    parent=styles["Heading2"],
    fontSize=16,
    leading=20,
    spaceBefore=20,
    spaceAfter=10,
)

SUBHEADING = ParagraphStyle(
    "SUBHEADING",
    parent=styles["Heading3"],
    fontSize=13,
    leading=18,
)

BODY = ParagraphStyle(
    "BODY",
    parent=styles["BodyText"],
    fontSize=10,
    leading=16,
)

TABLE_HEADER_COLOR = colors.HexColor("#2F5597")

CRITICAL = colors.HexColor("#C00000")

HIGH = colors.HexColor("#FF6600")

MEDIUM = colors.HexColor("#FFC000")

LOW = colors.HexColor("#70AD47")

INFO = colors.HexColor("#5B9BD5")