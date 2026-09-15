from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from backend.database import get_db
from backend.models.models import KnowledgeBase, User
from backend.schemas.schemas import KnowledgeBaseCreate, KnowledgeBaseResponse, KnowledgeBaseUpdate, PaginatedResponse
from backend.auth.auth import get_current_user

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

@router.get("", response_model=PaginatedResponse[KnowledgeBaseResponse])
def list_knowledge(skip: int = 0, limit: int = 10, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(KnowledgeBase)
    if search:
        query = query.filter(KnowledgeBase.title.ilike(f"%{search}%") | KnowledgeBase.description.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total // limit) + (1 if total % limit > 0 else 0)
    }

@router.post("", response_model=KnowledgeBaseResponse)
def create_knowledge(kb: KnowledgeBaseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_kb = KnowledgeBase(**kb.model_dump(), developer_id=current_user.id)
    db.add(new_kb)
    db.commit()
    db.refresh(new_kb)
    # Also add to vector store (in a real app, do this asynchronously)
    from backend.rag.vector_store import vector_store
    text_content = f"{new_kb.title} {new_kb.description} {new_kb.root_cause}"
    vector_store.add([text_content], [{"id": new_kb.id, "title": new_kb.title, "root_cause": new_kb.root_cause, "fix_description": new_kb.fix_description}])
    return new_kb

@router.get("/{id}", response_model=KnowledgeBaseResponse)
def get_knowledge(id: int, db: Session = Depends(get_db)):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base entry not found")
    return kb

@router.put("/{id}", response_model=KnowledgeBaseResponse)
def update_knowledge(id: int, kb_update: KnowledgeBaseUpdate, db: Session = Depends(get_db)):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base entry not found")
    
    for key, value in kb_update.model_dump(exclude_unset=True).items():
        setattr(kb, key, value)
        
    db.commit()
    db.refresh(kb)
    return kb

@router.delete("/{id}")
def delete_knowledge(id: int, db: Session = Depends(get_db)):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(kb)
    db.commit()
    return {"message": "Deleted"}
