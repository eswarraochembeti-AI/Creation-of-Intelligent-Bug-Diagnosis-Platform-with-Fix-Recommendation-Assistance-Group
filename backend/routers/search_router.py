from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
import re
from backend.database import get_db
from backend.models.models import BugReport, KnowledgeBase, User

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
def global_search(q: str = "", db: Session = Depends(get_db)):
    query_text = q.strip()
    if not query_text:
        return {"results": [], "total": 0}

    # Extract potential numerical IDs (e.g. "#109", "KB 52", "109")
    id_matches = re.findall(r'\d+', query_text)
    numeric_id = int(id_matches[0]) if id_matches else None

    # Search Bug Reports
    bug_conditions = [
        BugReport.title.ilike(f"%{query_text}%"),
        BugReport.description.ilike(f"%{query_text}%"),
        BugReport.stack_trace.ilike(f"%{query_text}%"),
        BugReport.affected_module.ilike(f"%{query_text}%"),
        BugReport.severity.ilike(f"%{query_text}%")
    ]
    if numeric_id:
        bug_conditions.append(BugReport.id == numeric_id)

    bugs = db.query(BugReport).filter(or_(*bug_conditions)).limit(6).all()

    # Search Knowledge Base
    kb_conditions = [
        KnowledgeBase.title.ilike(f"%{query_text}%"),
        KnowledgeBase.description.ilike(f"%{query_text}%"),
        KnowledgeBase.root_cause.ilike(f"%{query_text}%"),
        KnowledgeBase.fix_description.ilike(f"%{query_text}%"),
        KnowledgeBase.tags.ilike(f"%{query_text}%")
    ]
    if numeric_id:
        kb_conditions.append(KnowledgeBase.id == numeric_id)

    kbs = db.query(KnowledgeBase).filter(or_(*kb_conditions)).limit(6).all()

    # Search Team Members
    users = db.query(User).filter(
        or_(
            User.name.ilike(f"%{query_text}%"),
            User.email.ilike(f"%{query_text}%"),
            User.role.ilike(f"%{query_text}%"),
            User.organization.ilike(f"%{query_text}%")
        )
    ).limit(4).all()

    results = []
    for b in bugs:
        results.append({
            "type": "bug",
            "id": b.id,
            "title": f"Bug #{b.id}: {b.title}",
            "snippet": (b.description or "")[:120],
            "severity": b.severity,
            "status": b.status,
            "url": f"/bug-history"
        })

    for k in kbs:
        results.append({
            "type": "knowledge",
            "id": k.id,
            "title": f"KB #{k.id}: {k.title}",
            "snippet": (k.root_cause or k.description or "")[:120],
            "severity": k.severity,
            "url": f"/knowledge-base"
        })

    for u in users:
        results.append({
            "type": "team",
            "id": u.id,
            "title": f"Team Member: {u.name} ({u.role.capitalize()})",
            "snippet": f"Email: {u.email} • Organization: {u.organization or 'TechCorp Solutions'}",
            "url": f"/team"
        })

    return {
        "results": results,
        "total": len(results),
        "query": query_text
    }
