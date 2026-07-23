from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Response
from typing import Optional
from backend.services.resume_service import ResumeService
from backend.schemas.resume import ResumeAnalysisResponseDTO
import requests

router = APIRouter(tags=["Resume & Placement"])
resume_service = ResumeService()

@router.post("/analyze-resume", response_model=ResumeAnalysisResponseDTO)
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    target_role: Optional[str] = Form("Software Engineer")
):
    extracted_text = resume_text or ""
    if file:
        content = await file.read()
        extracted_text += " " + content.decode("utf-8", errors="ignore")

    if not extracted_text.strip():
        extracted_text = "Python Java React JavaScript SQL Data Structures Algorithms REST API Docker AWS"

    return resume_service.analyze(extracted_text, target_role=target_role or "Software Engineer")

@router.get("/pdf-proxy")
def pdf_proxy(url: str):
    try:
        r = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code == 200:
            return Response(content=r.content, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF fetch error: {str(e)}")
    raise HTTPException(status_code=404, detail="PDF file not found")
