import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.database import get_db
from backend.models.models import BugReport, User, AIReport, KnowledgeBase, Project, Attachment
from backend.schemas.schemas import BugReportCreate, BugReportResponse, BugReportUpdate, PaginatedResponse, AIReportResponse
from backend.auth.auth import get_current_user
from backend.agents.pipeline import PipelineOrchestrator
from backend.agents.duplicate_detection_agent import DuplicateDetectionAgent
from backend.rag.vector_store import vector_store

router = APIRouter(prefix="/api/bugs", tags=["bugs"])

class AnalyzeSubmission(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    bug_text: Optional[str] = None
    stack_trace: Optional[str] = None
    error_log: Optional[str] = None
    affected_module: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    project_id: Optional[int] = 1
    bug_id: Optional[int] = None

@router.post("/upload")
async def upload_attachment(file: UploadFile = File(...)):
    """Upload bug report screenshots, log files, or stack trace documents."""
    ALLOWED_EXTENSIONS = {
        ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
        ".txt", ".log", ".json", ".csv", ".xml", ".yaml", ".yml",
        ".md", ".pdf"
    }
    FORBIDDEN_EXTENSIONS = {".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".dll", ".so"}
    
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext in FORBIDDEN_EXTENSIONS or (ext not in ALLOWED_EXTENSIONS and ext != ""):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type '{ext}'. Allowed types: PNG, JPG, JPEG, WEBP, TXT, LOG, JSON, CSV, PDF."
        )

    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 25MB.")
    
    os.makedirs("uploads", exist_ok=True)
    safe_filename = file.filename.replace(" ", "_") if file.filename else "upload"
    unique_filename = f"{uuid.uuid4().hex[:8]}_{safe_filename}"
    file_path = os.path.join("uploads", unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    extracted_text = ""
    is_text = ext in {".txt", ".log", ".json", ".csv", ".xml", ".yaml", ".yml", ".md"}
    if is_text:
        try:
            extracted_text = content.decode("utf-8", errors="replace")[:10000]
        except Exception:
            pass

    is_image = ext in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}

    return {
        "success": True,
        "filename": file.filename,
        "saved_name": unique_filename,
        "filepath": f"/uploads/{unique_filename}",
        "file_url": f"/uploads/{unique_filename}",
        "file_type": file.content_type or ("image/" + ext.replace(".", "") if is_image else "text/plain"),
        "file_size": len(content),
        "is_image": is_image,
        "extracted_text": extracted_text
    }

class DuplicateCheckRequest(BaseModel):
    text: str
    duplicate_threshold: Optional[float] = 0.8
    similar_threshold: Optional[float] = 0.5

class ResolveBugRequest(BaseModel):
    root_cause: Optional[str] = None
    fix_description: Optional[str] = None
    code_fix: Optional[str] = None

@router.get("", response_model=PaginatedResponse[BugReportResponse])
def get_bugs(skip: int = 0, limit: int = 50, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(BugReport)
    if status:
        query = query.filter(BugReport.status == status)
    total = query.count()
    bugs = query.order_by(BugReport.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": bugs,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total // limit) + (1 if total % limit > 0 else 0)
    }

@router.post("", response_model=BugReportResponse)
def create_bug(bug: BugReportCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    default_user = db.query(User).first()
    reporter_id = default_user.id if default_user else 1
    
    new_bug = BugReport(**bug.model_dump(), reporter_id=reporter_id)
    db.add(new_bug)
    db.commit()
    db.refresh(new_bug)
    
    # Trigger analysis in background
    background_tasks.add_task(PipelineOrchestrator.run_analysis, db, new_bug.id)
    
    return new_bug

@router.post("/analyze")
def trigger_analysis(submission: AnalyzeSubmission, db: Session = Depends(get_db)):
    # Case A: Existing bug ID passed
    if submission.bug_id:
        bug = db.query(BugReport).filter(BugReport.id == submission.bug_id).first()
        if not bug:
            raise HTTPException(status_code=404, detail=f"Bug #{submission.bug_id} not found")
    else:
        # Case B: Create new BugReport from submission payload
        default_user = db.query(User).first()
        reporter_id = default_user.id if default_user else 1
        
        default_project = db.query(Project).first()
        project_id = submission.project_id or (default_project.id if default_project else 1)
        
        raw_text = submission.bug_text or submission.description or submission.stack_trace or submission.error_log or "Unspecified Bug Report"
        derived_title = submission.title or raw_text.split('\n')[0][:80]
        if not derived_title.strip():
            derived_title = "Submitted Bug Analysis"
            
        bug = BugReport(
            title=derived_title,
            description=submission.description or raw_text,
            bug_text=submission.bug_text or raw_text,
            stack_trace=submission.stack_trace,
            error_log=submission.error_log,
            affected_module=submission.affected_module,
            project_id=project_id,
            reporter_id=reporter_id,
            status="open"
        )
        db.add(bug)
        db.commit()
        db.refresh(bug)

        if submission.attachment_url:
            att = Attachment(
                filename=submission.attachment_name or "attachment",
                filepath=submission.attachment_url,
                file_type="image" if any(submission.attachment_url.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]) else "document",
                file_size=0,
                bug_report_id=bug.id,
                uploaded_by=reporter_id
            )
            db.add(att)
            db.commit()
        
    report = PipelineOrchestrator.run_analysis(db, bug.id)
    db.refresh(bug)
    
    return {
        "message": "Analysis completed",
        "bug": BugReportResponse.model_validate(bug),
        "report": AIReportResponse.model_validate(report)
    }

@router.post("/duplicate-check")
def check_duplicates(payload: DuplicateCheckRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text input is required for duplicate checking.")
    
    result = DuplicateDetectionAgent.detect_duplicates(
        bug_text=payload.text,
        duplicate_threshold=payload.duplicate_threshold,
        similar_threshold=payload.similar_threshold
    )
    return result

@router.post("/{id}/resolve")
def resolve_bug(id: int, payload: ResolveBugRequest = None, db: Session = Depends(get_db)):
    bug = db.query(BugReport).filter(BugReport.id == id).first()
    if not bug:
        raise HTTPException(status_code=404, detail=f"Bug #{id} not found")
        
    bug.status = "resolved"
    
    # Fetch AI Report if available for cause/fix information
    ai_report = db.query(AIReport).filter(AIReport.bug_report_id == id).first()
    
    root_cause = payload.root_cause if (payload and payload.root_cause) else (
        ai_report.root_cause_result.get("most_probable_cause") if (ai_report and ai_report.root_cause_result) else f"Root cause for {bug.title}"
    )
    fix_description = payload.fix_description if (payload and payload.fix_description) else (
        ai_report.remediation_result.get("permanent_fix") if (ai_report and ai_report.remediation_result) else "Resolution verified and applied."
    )
    code_fix = payload.code_fix if (payload and payload.code_fix) else (
        ai_report.remediation_result.get("suggested_code_changes") if (ai_report and ai_report.remediation_result) else None
    )

    # Ingest resolved bug into Knowledge Base & Vector Store
    kb_entry = KnowledgeBase(
        title=f"Resolution for Bug #{bug.id}: {bug.title}",
        description=f"Description: {bug.description}\nRoot Cause: {root_cause}",
        bug_text=bug.bug_text,
        stack_trace=bug.stack_trace,
        root_cause=root_cause,
        fix_description=fix_description,
        code_fix=code_fix,
        severity=bug.severity,
        priority=bug.priority,
        project_id=bug.project_id,
        developer_id=bug.reporter_id,
        status="active"
    )
    db.add(kb_entry)
    db.commit()
    db.refresh(kb_entry)
    
    # Index in vector store for future RAG retrieval
    vector_store.add_kb_entry(kb_entry)
    
    db.commit()

    
    return {
        "message": f"Bug #{id} resolved and added to trusted knowledge base",
        "bug": BugReportResponse.model_validate(bug),
        "knowledge_id": kb_entry.id
    }

@router.get("/{id}", response_model=BugReportResponse)
def get_bug(id: int, db: Session = Depends(get_db)):
    bug = db.query(BugReport).filter(BugReport.id == id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    return bug

@router.put("/{id}", response_model=BugReportResponse)
def update_bug(id: int, bug_update: BugReportUpdate, db: Session = Depends(get_db)):
    bug = db.query(BugReport).filter(BugReport.id == id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    
    for key, value in bug_update.model_dump(exclude_unset=True).items():
        setattr(bug, key, value)
        
    db.commit()
    db.refresh(bug)
    return bug

@router.delete("/{id}")
def delete_bug(id: int, db: Session = Depends(get_db)):
    bug = db.query(BugReport).filter(BugReport.id == id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    db.delete(bug)
    db.commit()
    return {"message": "Bug deleted"}

@router.get("/{id}/report", response_model=AIReportResponse)
def get_bug_report(id: int, db: Session = Depends(get_db)):
    report = db.query(AIReport).filter(AIReport.bug_report_id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="AI Report not found")
    return report

