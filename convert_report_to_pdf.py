from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
from reportlab.lib.styles import getSampleStyleSheet
import os

INPUT = 'REPORT.md'
OUTPUT = 'REPORT.pdf'

def main():
    if not os.path.exists(INPUT):
        print(f"Input file {INPUT!r} not found.")
        return

    with open(INPUT, 'r', encoding='utf-8') as f:
        text = f.read()

    doc = SimpleDocTemplate(OUTPUT, pagesize=letter)
    styles = getSampleStyleSheet()

    # Use Preformatted to preserve simple markdown formatting
    pre = Preformatted(text, styles['Code'])
    story = [pre]

    doc.build(story)
    print(f"Generated {OUTPUT}")

if __name__ == '__main__':
    main()
