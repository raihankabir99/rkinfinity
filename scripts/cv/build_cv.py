from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from docx import Document
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os
import zipfile

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
PUBLIC.mkdir(exist_ok=True)
PDF_PATH = PUBLIC / "Raihan-Kabir-Professional-CV.pdf"
DOCX_PATH = PUBLIC / "Raihan-Kabir-Professional-CV.docx"

P = {
    "name": "Raihan Kabir",
    "headline": "Aspiring Computer Science Student | Web Development & Digital Marketing",
    "contact": "maskrklo@gmail.com | +966 540 742 748 | Al-Hofuf, Saudi Arabia",
    "summary": ("HSC graduate with a Commerce background, currently preparing for university admission in Computer Science. "
        "Building a strong foundation in computer science through practical learning. Developing skills in C, Python, SQL, HTML, CSS, "
        "algorithms, and web technologies, alongside practical knowledge of SEO, digital marketing, Google Analytics, and content writing. "
        "Completed a Content Writing Internship at InAmigos Foundation and currently developing technical skills through hands-on web "
        "development projects while preparing for further academic study and entry-level opportunities."),
    "experience": [
        "Created SEO-optimized content for NGO initiatives and social impact storytelling.",
        "Researched NGO activities and drafted engaging narratives for web and social platforms.",
        "Applied on-page SEO and keyword research to support content visibility.",
    ],
    "education": [
        ("CS50's Introduction to Computer Science — Completed", "HarvardX (edX) | Online · Completed",
         "C, Python, SQL, HTML, CSS, algorithms, data structures, memory management, databases, and web programming."),
        ("Higher Secondary Certificate (HSC) — Commerce",
         "Bandarban Govt. College | Bandarban · 11 Mar 2022 – 26 Nov 2023", ""),
    ],
    "projects": [
        ("ZOAL Website — E-commerce Platform | Ongoing", "https://alzoal.sa",
         "Full-stack e-commerce project with Google AI Studio and Supabase. Features include product management, user authentication, API integration, database workflows, and responsive UI. Uses AI-assisted development for prototyping and debugging."),
        ("T-shirt Website", "https://tshirtwebsite1v0-4tam6iirr-raihankabir99s-projects.vercel.app",
         "E-commerce / website development project."),
        ("NGO Website", "https://ngo-landing-page-git-fix-vercel-8b46a6-raihankabir99s-projects.vercel.app/",
         "Website project for an NGO."),
        ("ALBAYT Website", "https://albayt-eosin.vercel.app/",
         "Website project and live preview."),
    ],
    "skills": ["Web Development", "SEO", "Digital Marketing", "Google Analytics", "Content Writing",
        "AI-Assisted Development", "Supabase", "Python", "SQL", "Prompt Engineering", "LLMs", "Git & GitHub",
        "C", "HTML", "CSS", "Algorithms", "Data Structures", "Google Ads", "Keyword Research", "SEO Audits",
        "Technical SEO", "On-Page SEO", "Off-Page SEO", "GEO / AI Search", "Semrush"],
    "certifications": "SEO, Analytics & Digital Marketing: Technical SEO, On-Page SEO, AI Search / GEO, Semrush, Google Analytics, Content Writing.",
    "credential": "https://www.credential.net/profile/raihankabir99/wallet",
    "languages": "Bengali (Native) · English (Intermediate) · Hindi (Intermediate)",
    "portfolio": "https://drive.google.com/drive/folders/1xpeRJEwdho9sa6_32LHq6AvydCaBPixr?usp=drive_link",
    "profiles": [
        ("rkInfinity", "https://rkinfinity.pages.dev/about"),
        ("GitHub", "https://github.com/raihankabir99"),
        ("LinkedIn", "https://linkedin.com/in/raihan-kabir-ovi99"),
    ],
}

def pdf_font():
    regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    if os.path.exists(regular) and os.path.exists(bold):
        pdfmetrics.registerFont(TTFont("CVSans", regular))
        pdfmetrics.registerFont(TTFont("CVSans-Bold", bold))
        return "CVSans", "CVSans-Bold"
    return "Helvetica", "Helvetica-Bold"

def build_pdf():
    regular, bold = pdf_font()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="NameCV", fontName=bold, fontSize=22, leading=26,
        textColor=colors.HexColor("#14213D"), spaceAfter=2))
    styles.add(ParagraphStyle(name="SubCV", fontName=regular, fontSize=9, leading=13,
        textColor=colors.HexColor("#475569"), spaceAfter=5))
    styles.add(ParagraphStyle(name="ContactCV", fontName=regular, fontSize=8, leading=11,
        textColor=colors.HexColor("#334155"), spaceAfter=8))
    styles.add(ParagraphStyle(name="SectionCV", fontName=bold, fontSize=10, leading=13,
        textColor=colors.HexColor("#98751D"), spaceBefore=8, spaceAfter=4))
    styles.add(ParagraphStyle(name="BodyCV", fontName=regular, fontSize=8.2, leading=11.4,
        textColor=colors.HexColor("#202938"), spaceAfter=3))
    styles.add(ParagraphStyle(name="TitleCV", fontName=bold, fontSize=8.6, leading=11,
        textColor=colors.HexColor("#172554"), spaceAfter=1))
    styles.add(ParagraphStyle(name="SmallCV", fontName=regular, fontSize=7.4, leading=10,
        textColor=colors.HexColor("#475569"), spaceAfter=2))
    story = [Paragraph(escape(P["name"]), styles["NameCV"]),
        Paragraph(escape(P["headline"]), styles["SubCV"]),
        Paragraph(escape(P["contact"]), styles["ContactCV"]),
        HRFlowable(width="100%", thickness=.8, color=colors.HexColor("#D4AF37"), spaceAfter=3)]

    def section(label):
        story.append(Paragraph(escape(label.upper()), styles["SectionCV"]))
    def body(value):
        story.append(Paragraph(escape(value), styles["BodyCV"]))
    def linked(label, url):
        safe_url = escape(url, {'"': '&quot;'})
        story.append(Paragraph(f'<link href="{safe_url}" color="#2563EB">{escape(label)}</link>',
            styles["SmallCV"]))

    section("Professional Summary"); body(P["summary"])
    section("Experience")
    story.append(Paragraph("Content Writing Intern | InAmigos Foundation", styles["TitleCV"]))
    story.append(Paragraph("Remote | 6 Apr 2026 – 19 Apr 2026", styles["SmallCV"]))
    for bullet in P["experience"]:
        story.append(Paragraph("• " + escape(bullet), styles["BodyCV"]))
    section("Education & Courses")
    for title, org, detail in P["education"]:
        story.append(Paragraph(escape(title), styles["TitleCV"]))
        story.append(Paragraph(escape(org), styles["SmallCV"]))
        if detail: body(detail)
    section("Selected Projects")
    for title, url, detail in P["projects"]:
        story.append(Paragraph(escape(title), styles["TitleCV"]))
        linked(url, url); body(detail)
    section("Skills"); body(" · ".join(P["skills"]))
    section("Certifications & Credentials"); body(P["certifications"])
    linked("Credential wallet", P["credential"])
    section("Languages"); body(P["languages"])
    section("Portfolio & Profiles")
    linked("Portfolio folder", P["portfolio"])
    for label, url in P["profiles"]: linked(label + " — " + url, url)

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
        canvas.line(18*mm, 14*mm, 192*mm, 14*mm)
        canvas.setFont(regular, 7)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawRightString(192*mm, 9*mm, f"Raihan Kabir | Page {doc.page}")
        canvas.restoreState()

    pdf = SimpleDocTemplate(str(PDF_PATH), pagesize=A4, rightMargin=18*mm,
        leftMargin=18*mm, topMargin=14*mm, bottomMargin=19*mm,
        title="Raihan Kabir - Professional CV", author="Raihan Kabir")
    pdf.build(story, onFirstPage=footer, onLaterPages=footer)

def build_docx():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    sec.top_margin, sec.bottom_margin = Mm(15), Mm(17)
    sec.left_margin, sec.right_margin = Mm(19), Mm(19)
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"; normal.font.size = Pt(9)
    normal.font.color.rgb = RGBColor(32, 41, 56)
    normal.paragraph_format.space_after = Pt(3)
    normal.paragraph_format.line_spacing = 1.08

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(P["name"]); r.bold = True; r.font.name = "Aptos Display"
    r.font.size = Pt(23); r.font.color.rgb = RGBColor(20, 33, 61)
    p = doc.add_paragraph(P["headline"])
    p.paragraph_format.space_after = Pt(3)
    for r in p.runs: r.font.size = Pt(10); r.font.color.rgb = RGBColor(71, 85, 105)
    p = doc.add_paragraph(P["contact"]); p.paragraph_format.space_after = Pt(7)
    for r in p.runs: r.font.size = Pt(8.5)

    def heading(label):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(7); p.paragraph_format.space_after = Pt(3)
        r = p.add_run(label.upper()); r.bold = True; r.font.size = Pt(10.5)
        r.font.color.rgb = RGBColor(152, 117, 29)
    def body(value):
        p = doc.add_paragraph(value); p.paragraph_format.space_after = Pt(3); return p
    def bullet(value):
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Mm(5); p.paragraph_format.first_line_indent = Mm(-2)
        p.paragraph_format.space_after = Pt(1); p.add_run(value)

    heading("Professional Summary"); body(P["summary"])
    heading("Experience")
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(1)
    r = p.add_run("Content Writing Intern | InAmigos Foundation"); r.bold = True
    p = doc.add_paragraph("Remote | 6 Apr 2026 – 19 Apr 2026"); p.paragraph_format.space_after = Pt(2)
    for value in P["experience"]: bullet(value)
    heading("Education & Courses")
    for title, org, detail in P["education"]:
        p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(1)
        r = p.add_run(title); r.bold = True
        p = doc.add_paragraph(org); p.paragraph_format.space_after = Pt(1)
        if detail: body(detail)
    heading("Selected Projects")
    for title, url, detail in P["projects"]:
        p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(0)
        r = p.add_run(title); r.bold = True
        p = doc.add_paragraph(url); p.paragraph_format.space_after = Pt(1)
        for r in p.runs: r.font.size = Pt(8); r.font.color.rgb = RGBColor(37, 99, 235)
        body(detail)
    heading("Skills"); body(" · ".join(P["skills"]))
    heading("Certifications & Credentials"); body(P["certifications"]); body(P["credential"])
    heading("Languages"); body(P["languages"])
    heading("Portfolio & Profiles"); body(P["portfolio"])
    for label, url in P["profiles"]: body(f"{label}: {url}")

    for section in doc.sections:
        p = section.footer.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p.add_run("Raihan Kabir | Professional CV")
        r.font.size = Pt(7); r.font.color.rgb = RGBColor(100, 116, 139)
    doc.core_properties.title = "Raihan Kabir - Professional CV"
    doc.core_properties.author = "Raihan Kabir"
    doc.save(DOCX_PATH)

if __name__ == "__main__":
    build_pdf()
    build_docx()
    with zipfile.ZipFile(DOCX_PATH) as archive:
        assert archive.testzip() is None
        assert "[Content_Types].xml" in archive.namelist()
        assert "word/document.xml" in archive.namelist()
    assert PDF_PATH.stat().st_size > 5000
    assert DOCX_PATH.stat().st_size > 5000
    print(f"Generated {PDF_PATH.name} ({PDF_PATH.stat().st_size} bytes)")
    print(f"Generated {DOCX_PATH.name} ({DOCX_PATH.stat().st_size} bytes)")
