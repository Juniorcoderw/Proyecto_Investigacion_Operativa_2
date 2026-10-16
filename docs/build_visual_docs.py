"""Genera las dos guías PDF a partir de sus fuentes Markdown editables."""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TituloIO', fontName='Helvetica-Bold', fontSize=21, leading=25, spaceAfter=12, textColor=colors.HexColor('#172536')))
styles.add(ParagraphStyle(name='SeccionIO', fontName='Helvetica-Bold', fontSize=13, leading=17, spaceBefore=12, spaceAfter=7, keepWithNext=True))
styles.add(ParagraphStyle(name='TextoIO', fontName='Helvetica', fontSize=10.5, leading=15, spaceAfter=8, alignment=TA_LEFT))
styles.add(ParagraphStyle(name='ItemIO', parent=styles['TextoIO'], leftIndent=11, firstLineIndent=-8, spaceAfter=5))

def inline(text):
    text = escape(text)
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#d5d9df'))
    canvas.line(46, 39, A4[0]-46, 39)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#526070'))
    canvas.drawString(46, 26, 'Investigación Operativa II | Equipo del proyecto')
    canvas.drawRightString(A4[0]-46, 26, str(doc.page))
    canvas.restoreState()

for source, filename, title in [
    ('guia-graficas.md', 'Guia_de_graficas_IO2.pdf', 'Guía de gráficas del sistema'),
    ('guion-exposicion.md', 'Guion_de_exposicion_software_IO2.pdf', 'Guion de exposición del software'),
]:
    story = []
    raw = (ROOT/'docs'/source).read_text(encoding='utf-8')
    raw = re.sub(r'(?m)^(#{1,2} .+|<!-- pagina -->)$', r'\n\n\1\n\n', raw)
    for block in raw.split('\n\n'):
        block = block.strip()
        if not block:
            continue
        for line in block.splitlines() if block.startswith('- ') else [block]:
            if line == '<!-- pagina -->':
                story.append(PageBreak())
            elif line.startswith('# '):
                story.append(Paragraph(inline(line[2:]), styles['TituloIO']))
            elif line.startswith('## '):
                story.append(Paragraph(inline(line[3:]), styles['SeccionIO']))
            elif line.startswith('- '):
                story.append(Paragraph('• '+inline(line[2:]), styles['ItemIO']))
            else:
                story.append(Paragraph(inline(line.replace('\n',' ')), styles['TextoIO']))
    doc = SimpleDocTemplate(str(OUT/filename), pagesize=A4, rightMargin=46, leftMargin=46, topMargin=42, bottomMargin=53, title=title, author='Equipo del proyecto')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT/filename)
