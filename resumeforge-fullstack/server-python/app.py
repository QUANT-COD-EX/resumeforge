import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any, Optional

from services.prompts import build_feedback_prompt, build_improve_line_prompt, build_tailor_prompt
from services.llm_router import generate_structured_json
from services.docx_generator import build_resume_docx

base_dir = Path(__file__).resolve().parent
load_dotenv(base_dir / ".env")
load_dotenv(base_dir.parent / ".env")

app = FastAPI(title="ResumeForge Python AI Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FeedbackRequest(BaseModel):
    resumeData: Dict[str, Any]

class ImproveLineRequest(BaseModel):
    bulletText: str
    roleContext: Optional[str] = ""

class TailorRequest(BaseModel):
    resumeData: Dict[str, Any]
    jobDescription: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "resumeforge-python-ai"}

@app.post("/ai/feedback")
def ai_feedback(req: FeedbackRequest):
    try:
        return generate_structured_json(build_feedback_prompt(req.resumeData))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))

@app.post("/ai/improve-line")
def ai_improve_line(req: ImproveLineRequest):
    try:
        return generate_structured_json(build_improve_line_prompt(req.bulletText, req.roleContext or ""))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))

@app.post("/ai/tailor-resume")
def ai_tailor_resume(req: TailorRequest):
    try:
        return generate_structured_json(build_tailor_prompt(req.resumeData, req.jobDescription))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))

@app.post("/ai/export-docx")
def export_docx(req: FeedbackRequest):
    try:
        docx_bytes = build_resume_docx(req.resumeData)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": 'attachment; filename="ResumeForge.docx"'}
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
