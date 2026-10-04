from pathlib import Path
from pypdf import PdfReader
from docx import Document
import fitz
import pytesseract
from PIL import Image
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(file_path):

    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    elif extension == ".docx":
        return extract_text_from_docx(file_path)

    elif extension == ".txt":
        return extract_text_from_txt(file_path)

    else:
        raise ValueError("Unsupported file type")


def extract_text_from_pdf(file_path):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    if len(text.strip()) < 50:
        print("No sufficient text found. Using OCR...")
        text = extract_text_from_pdf_ocr(file_path)

    return text

def extract_text_from_pdf_ocr(file_path):

    document = fitz.open(file_path)

    text = ""

    for page in document:

        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

        image = Image.frombytes(
            "RGB",
            [pix.width, pix.height],
            pix.samples
        )

        text += pytesseract.image_to_string(image)
        text += "\n"

    document.close()

    return text


def extract_text_from_docx(file_path):

    doc = Document(file_path)

    text = ""

    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"

    return text


def extract_text_from_txt(file_path):

    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()