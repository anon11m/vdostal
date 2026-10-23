"""Build browser-readable legal pages from the supplied Word originals."""

from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{" + NS["w"] + "}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
DOCUMENTS = (
    ("vdostal-public-offer.docx", "public-offer.html", "uk"),
    ("vdostal-data-processing-consent-uk.docx", "data-processing-consent-uk.html", "uk"),
    ("vdostal-data-processing-consent-en.docx", "data-processing-consent-en.html", "en"),
)


def inline(element, relationships):
    tag = element.tag.removeprefix(W)
    if tag == "t":
        return escape(element.text or "")
    if tag in ("br", "cr"):
        return "<br>"
    if tag == "tab":
        return " "
    result = "".join(inline(child, relationships) for child in element)
    if tag == "r":
        for name, html_tag in (("b", "strong"), ("i", "em"), ("u", "u")):
            prop = element.find(f"w:rPr/w:{name}", NS)
            if prop is not None and prop.get(W + "val") not in ("0", "false", "off", "none"):
                result = f"<{html_tag}>{result}</{html_tag}>"
    if tag == "hyperlink":
        href = relationships.get(element.get(R + "id"), "")
        if href.startswith(("https://", "http://", "mailto:")):
            result = f'<a href="{escape(href, quote=True)}">{result}</a>'
    return result


def paragraph_style(paragraph):
    style = paragraph.find("w:pPr/w:pStyle", NS)
    return style.get(W + "val", "") if style is not None else ""


def paragraph_html(paragraph, relationships):
    if not any(t.text for t in paragraph.findall(".//w:t", NS)):
        return ""
    style = paragraph_style(paragraph)
    text = inline(paragraph, relationships)
    if style in ("Title", "VD-Title"):
        return f"<h1>{text}</h1>"
    if style in ("VDSection", "VD-Section"):
        return f"<h2>{text}</h2>"
    if style in ("VDNote", "VD-Date"):
        return f'<p class="document-date">{text}</p>'
    if style == "VD-Subtitle":
        return f'<p class="document-subtitle">{text}</p>'
    if style in ("VDLead", "VD-Lead"):
        return f'<p class="document-lead">{text}</p>'
    return f"<p>{text}</p>"


def blocks_html(elements, relationships):
    blocks = []
    bullets = []

    def flush_bullets():
        if bullets:
            blocks.append("<ul>" + "".join(bullets) + "</ul>")
            bullets.clear()

    for element in elements:
        if element.tag == W + "p" and paragraph_style(element) == "VDBullet":
            bullets.append(f"<li>{inline(element, relationships)}</li>")
            continue
        flush_bullets()
        if element.tag == W + "p":
            blocks.append(paragraph_html(element, relationships))
        elif element.tag == W + "tbl":
            rows = []
            for row in element.findall("w:tr", NS):
                cells = []
                for index, cell in enumerate(row.findall("w:tc", NS)):
                    tag = "th" if index == 0 else "td"
                    scope = ' scope="row"' if index == 0 else ""
                    cells.append(f"<{tag}{scope}>{blocks_html(cell, relationships)}</{tag}>")
                rows.append("<tr>" + "".join(cells) + "</tr>")
            blocks.append('<div class="document-table"><table><tbody>' + "".join(rows) + "</tbody></table></div>")
    flush_bullets()
    return "\n".join(block for block in blocks if block)


class ArticleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.text = []

    def handle_starttag(self, tag, attrs):
        if tag == "article":
            self.inside = True

    def handle_endtag(self, tag):
        if tag == "article":
            self.inside = False
        if self.inside and tag in ("p", "li", "h1", "h2", "th", "td"):
            self.text.append(" ")

    def handle_data(self, data):
        if self.inside:
            self.text.append(data)


def normalize(text):
    return re.sub(r"\s+", " ", text).strip()


def build(filename, output, language):
    with ZipFile(ROOT / "assets" / "documents" / filename) as package:
        document = ET.fromstring(package.read("word/document.xml"))
        relationships = {}
        rel_path = "word/_rels/document.xml.rels"
        if rel_path in package.namelist():
            relationships = {rel.get("Id"): rel.get("Target", "") for rel in ET.fromstring(package.read(rel_path))}
    body = document.find("w:body", NS)
    title = "".join(t.text or "" for t in body.find("w:p", NS).findall(".//w:t", NS))
    back = "Повернутися на сайт" if language == "uk" else "Back to website"
    page = f'''<!doctype html>
<html lang="{language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} — VDOSTAL</title>
  <link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg">
  <link rel="stylesheet" href="../assets/css/legal.css?v=1">
</head>
<body>
  <header class="document-nav"><a class="document-brand" href="../index.html">VDOSTAL</a><a href="../index.html">← {back}</a></header>
  <main><article class="document">
{blocks_html(body, relationships)}
  </article></main>
</body>
</html>
'''
    # Compare every paragraph, including table cells, against the Word source.
    original = " ".join("".join(t.text or "" for t in p.findall(".//w:t", NS)) for p in body.findall(".//w:p", NS))
    parsed = ArticleText()
    parsed.feed(page)
    assert normalize(original) == normalize("".join(parsed.text)), f"Content mismatch: {filename}"
    assert page.count("<h1>") == 1, f"Missing document title: {filename}"
    destination = ROOT / "legal" / output
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(page, encoding="utf-8")
    print(f"Built {output}; verified all {len(body.findall('.//w:p', NS))} source paragraphs.")


if __name__ == "__main__":
    for document in DOCUMENTS:
        build(*document)
