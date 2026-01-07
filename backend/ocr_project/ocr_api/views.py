from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from pathlib import Path
import os
from rest_framework.permissions import IsAuthenticated

from mistralai import Mistral
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from docx import Document

# ---- Load API key from .env ----
load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY")
if not API_KEY:
    raise ValueError("MISTRAL_API_KEY not found in .env")

# Initialize Mistral client
client = Mistral(api_key=API_KEY)

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from pathlib import Path
import os

class OCRHistoryView(APIView):
    def get(self, request):
        output_dir = Path(settings.MEDIA_ROOT) / "outputs"
        os.makedirs(output_dir, exist_ok=True)
        files = []
        for pdf_file in output_dir.glob("ocr_*.pdf"):
            stem = pdf_file.stem
            files.append({
                "name": stem.replace("ocr_", ""),
                "pdf": request.build_absolute_uri(settings.MEDIA_URL + f"outputs/{stem}.pdf"),
                "txt": request.build_absolute_uri(settings.MEDIA_URL + f"outputs/{stem}.pdf.txt"),
                "docx": request.build_absolute_uri(settings.MEDIA_URL + f"outputs/{stem}.docx"),
                "timestamp": pdf_file.stat().st_mtime
            })
        # Sort by newest first
        files.sort(key=lambda x: x["timestamp"], reverse=True)
        return Response(files)

class OCRDeleteView(APIView):
    def delete(self, request, filename):
        output_dir = Path(settings.MEDIA_ROOT) / "outputs"
        try:
            stem = Path(filename).stem
            for ext in [".pdf", ".txt", ".docx"]:
                path = output_dir / f"{stem}{ext}"
                if path.exists():
                    path.unlink()
            return Response({"status": "deleted"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class OCRUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        # 1️⃣ Check uploaded file
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)

        # 2️⃣ Save uploaded file temporarily
        upload_dir = Path(settings.MEDIA_ROOT) / "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        input_path = upload_dir / file_obj.name
        with open(input_path, "wb") as f:
            for chunk in file_obj.chunks():
                f.write(chunk)

        # 3️⃣ Upload PDF to Mistral Files API
        with open(input_path, "rb") as f:
            uploaded = client.files.upload(
                file={"file_name": file_obj.name, "content": f},
                purpose="ocr"
            )

        # 4️⃣ Get signed URL for OCR processing
        signed = client.files.get_signed_url(file_id=uploaded.id, expiry=1)
        url = signed.url

        # 5️⃣ Process OCR
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={"type": "document_url", "document_url": url},
            include_image_base64=False
        )

        # 6️⃣ Extract text
        all_text = [page.markdown for page in ocr_response.pages]
        final_text = "\n\n".join(all_text)

        # 7️⃣ Prepare output folder
        output_dir = Path(settings.MEDIA_ROOT) / "outputs"
        os.makedirs(output_dir, exist_ok=True)

        # ---- Save as PDF using ReportLab ----
        pdf_path = output_dir / f"ocr_{Path(file_obj.name).stem}.pdf"  # ensure .pdf extension
        doc = SimpleDocTemplate(str(pdf_path), pagesize=A4,
                                rightMargin=40, leftMargin=40,
                                topMargin=40, bottomMargin=40)
        story = []
        styles = getSampleStyleSheet()
        normal_style = styles['Normal']

        for paragraph in final_text.split("\n\n"):
            paragraph = paragraph.strip()
            if paragraph:
                story.append(Paragraph(paragraph.replace("\n", "<br/>"), normal_style))
                story.append(Spacer(1, 12))
        doc.build(story)

        # ---- Save TXT ----
        txt_path = output_dir / f"ocr_{Path(file_obj.name).stem}.txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(final_text)

        # ---- Save DOCX ----
        docx_path = output_dir / f"ocr_{Path(file_obj.name).stem}.docx"
        docx_doc = Document()
        for paragraph in final_text.split("\n\n"):
            paragraph = paragraph.strip()
            if paragraph:
                docx_doc.add_paragraph(paragraph)
                docx_doc.add_paragraph("")
        docx_doc.save(docx_path)

        # 8️⃣ Return download URLs (absolute URLs)
        base_url = request.build_absolute_uri(settings.MEDIA_URL + "outputs/")
        return Response({
            "pdf": base_url + pdf_path.name,
            "txt": base_url + txt_path.name,
            "docx": base_url + docx_path.name
        })
