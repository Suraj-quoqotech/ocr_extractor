from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from pathlib import Path
import os

from mistralai import Mistral
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from docx import Document

from .models import OCRFile

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY")
if not API_KEY:
    raise ValueError("MISTRAL_API_KEY not found in .env")

client = Mistral(api_key=API_KEY)


class OCRUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)

        # Save uploaded file temporarily
        upload_dir = Path(settings.MEDIA_ROOT) / "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        input_path = upload_dir / file_obj.name
        with open(input_path, "wb") as f:
            for chunk in file_obj.chunks():
                f.write(chunk)

        # Upload to Mistral Files API
        with open(input_path, "rb") as f:
            uploaded = client.files.upload(
                file={"file_name": file_obj.name, "content": f},
                purpose="ocr"
            )

        signed = client.files.get_signed_url(file_id=uploaded.id, expiry=1)
        url = signed.url

        # OCR processing
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={"type": "document_url", "document_url": url},
            include_image_base64=False
        )

        all_text = [page.markdown for page in ocr_response.pages]
        final_text = "\n\n".join(all_text)

        # Prepare output folder
        output_dir = Path(settings.MEDIA_ROOT) / "outputs"
        os.makedirs(output_dir, exist_ok=True)
        base_name = Path(file_obj.name).stem

        # PDF
        pdf_path = output_dir / f"ocr_{base_name}.pdf"
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

        # TXT
        txt_path = output_dir / f"ocr_{base_name}.txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(final_text)

        # DOCX
        docx_path = output_dir / f"ocr_{base_name}.docx"
        docx_doc = Document()
        for paragraph in final_text.split("\n\n"):
            paragraph = paragraph.strip()
            if paragraph:
                docx_doc.add_paragraph(paragraph)
                docx_doc.add_paragraph("")
        docx_doc.save(docx_path)

        # Save to DB
        ocr_file, created = OCRFile.objects.update_or_create(
            file_name=file_obj.name,
            defaults={
                "pdf_url": request.build_absolute_uri(settings.MEDIA_URL + f"outputs/{pdf_path.name}"),
                "txt_url": request.build_absolute_uri(settings.MEDIA_URL + f"outputs/{txt_path.name}"),
                "docx_url": request.build_absolute_uri(settings.MEDIA_URL + f"outputs/{docx_path.name}"),
                "pdf_size": pdf_path.stat().st_size,
                "txt_size": txt_path.stat().st_size,
                "docx_size": docx_path.stat().st_size,
                "status": "done"
            }
        )

        return Response({
            "pdf": ocr_file.pdf_url,
            "txt": ocr_file.txt_url,
            "docx": ocr_file.docx_url,
            "pdf_size": ocr_file.pdf_size,
            "txt_size": ocr_file.txt_size,
            "docx_size": ocr_file.docx_size
        })

class OCRHistoryView(APIView):
    def get(self, request):
        files = OCRFile.objects.all().order_by('-uploaded_at')  # newest first
        data = [
            {
                "file_name": f.file_name,
                "pdf_url": f.pdf_url,
                "txt_url": f.txt_url,
                "docx_url": f.docx_url,
                "pdf_size": f.pdf_size,
                "txt_size": f.txt_size,
                "docx_size": f.docx_size,
                "uploaded_at": f.uploaded_at,
                "status": f.status,
            }
            for f in files
        ]
        return Response(data)



class OCRDeleteView(APIView):
    def delete(self, request, filename):
        try:
            ocr_file = OCRFile.objects.get(file_name=filename)
            # Delete local files
            for path in [ocr_file.pdf_url, ocr_file.txt_url, ocr_file.docx_url]:
                local_path = Path(settings.BASE_DIR) / path.replace(request.build_absolute_uri('/'), '')
                if local_path.exists():
                    local_path.unlink()
            ocr_file.delete()
            return Response({"status": "deleted"})
        except OCRFile.DoesNotExist:
            return Response({"error": "File not found"}, status=404)
