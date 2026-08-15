import logging
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from app.config import settings
from app.schemas import TailoredCV

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))

def render_html(tailored_cv: TailoredCV) -> str:
    """Render TailoredCV Pydantic object into ATS HTML string using Jinja2."""
    template = env.get_template("ats_cv.html")
    return template.render(cv=tailored_cv)

def generate_pdf_reportlab(tailored_cv: TailoredCV, output_path: Path):
    """Fallback PDF generator using ReportLab when WeasyPrint system libs are missing."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CVTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )
    headline_style = ParagraphStyle(
        'CVHeadline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#2563eb'),
        alignment=1,
        spaceAfter=6
    )
    contact_style = ParagraphStyle(
        'CVContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=10
    )
    sec_heading_style = ParagraphStyle(
        'CVSection',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=4,
        textTransform='uppercase'
    )
    body_style = ParagraphStyle(
        'CVBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        'CVBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        leftIndent=12,
        spaceAfter=2
    )

    story = []
    
    # Header
    story.append(Paragraph(tailored_cv.contact.full_name, title_style))
    if tailored_cv.contact.headline:
        story.append(Paragraph(tailored_cv.contact.headline, headline_style))
    
    contact_parts = []
    if tailored_cv.contact.location: contact_parts.append(tailored_cv.contact.location)
    if tailored_cv.contact.phone: contact_parts.append(tailored_cv.contact.phone)
    if tailored_cv.contact.email: contact_parts.append(tailored_cv.contact.email)
    if tailored_cv.contact.linkedin: contact_parts.append(tailored_cv.contact.linkedin)
    if tailored_cv.contact.github: contact_parts.append(tailored_cv.contact.github)
    
    story.append(Paragraph(" • ".join(contact_parts), contact_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=8))
    
    # Summary
    if tailored_cv.summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", sec_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceBefore=1, spaceAfter=4))
        story.append(Paragraph(tailored_cv.summary, body_style))
    
    # Experience
    if tailored_cv.work_experience:
        story.append(Paragraph("PROFESSIONAL EXPERIENCE", sec_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceBefore=1, spaceAfter=4))
        for exp in tailored_cv.work_experience:
            header_text = f"<b>{exp.position}</b> — <i>{exp.company}</i> ({exp.start_date} – {exp.end_date})"
            story.append(Paragraph(header_text, body_style))
            for bullet in exp.highlights:
                story.append(Paragraph(f"• {bullet}", bullet_style))
            story.append(Spacer(1, 4))
            
    # Skills
    if tailored_cv.skills:
        story.append(Paragraph("SKILLS & COMPETENCIES", sec_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceBefore=1, spaceAfter=4))
        for group in tailored_cv.skills:
            skill_text = f"<b>{group.category}:</b> {', '.join(group.skills)}"
            story.append(Paragraph(skill_text, body_style))
            
    # Education
    if tailored_cv.education:
        story.append(Paragraph("EDUCATION", sec_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceBefore=1, spaceAfter=4))
        for edu in tailored_cv.education:
            edu_text = f"<b>{edu.degree}</b> — {edu.institution} ({edu.graduation_date or ''})"
            story.append(Paragraph(edu_text, body_style))
            for d in (edu.details or []):
                story.append(Paragraph(f"• {d}", bullet_style))

    doc.build(story)

def generate_pdf(tailored_cv: TailoredCV, output_filename: str) -> Path:
    """Generate ATS PDF file from TailoredCV model. Uses WeasyPrint with ReportLab fallback."""
    output_path = settings.TEMP_OUTPUTS_DIR / output_filename
    html_content = render_html(tailored_cv)
    
    try:
        from weasyprint import HTML
        HTML(string=html_content).write_pdf(str(output_path))
        logger.info(f"Successfully generated PDF via WeasyPrint: {output_path}")
        return output_path
    except Exception as e:
        logger.warning(f"WeasyPrint failed or missing system libs: {e}. Using ReportLab fallback generator.")
        generate_pdf_reportlab(tailored_cv, output_path)
        logger.info(f"Successfully generated PDF via ReportLab fallback: {output_path}")
        return output_path
