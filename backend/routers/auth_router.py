from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.database import get_db
from backend.models.models import User
from backend.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from backend.auth.auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        name=user.name,
        password_hash=hashed_password,
        organization=user.organization,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from backend.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate, ChangePasswordRequest

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(profile_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed. Please check your existing password."
        )
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters in length."
        )
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"success": True, "message": "Password changed successfully."}

from backend.schemas.schemas import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token, 
    UserUpdate, 
    ChangePasswordRequest,
    UserSettingsUpdate,
    UserSettingsResponse
)
from backend.models.models import Notification, BugReport, UserSettings

@router.get("/settings", response_model=UserSettingsResponse)
def get_user_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve user settings stored in SQLite."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(
            user_id=current_user.id,
            theme="system",
            organization_name=current_user.organization or "TechCorp Solutions",
            organization_desc="Enterprise Software Engineering & AI Diagnostics",
            email_notif=True,
            push_notif=True,
            weekly_digest=False,
            notif_analysis_completed=True,
            notif_bug_assigned=True,
            notif_team_invitation=True,
            notif_bug_resolved=True,
            notif_kb_update=True,
            ai_model="sentence-transformers/all-MiniLM-L6-v2",
            confidence_threshold=85,
            session_timeout_enabled=True,
            session_timeout_minutes=30
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/settings", response_model=UserSettingsResponse)
def update_user_settings(payload: UserSettingsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update and persist user settings in SQLite."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    
    # Also update user's organization if provided
    if payload.organization_name:
        current_user.organization = payload.organization_name

    db.commit()
    db.refresh(settings)
    return settings

@router.get("/notifications")
def get_user_notifications(db: Session = Depends(get_db)):
    """Fetch real database notifications based on live bug diagnoses and resolutions."""
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(10).all()
    if not notifs:
        recent_bugs = db.query(BugReport).order_by(BugReport.created_at.desc()).limit(4).all()
        return [
            {
                "id": b.id,
                "title": f"Bug #{b.id}: {b.title[:40]}",
                "time": b.created_at.strftime("%b %d, %H:%M") if b.created_at else "Today",
                "type": b.severity,
                "read": b.status == "resolved"
            }
            for b in recent_bugs
        ]
    return [
        {
            "id": n.id,
            "title": n.title,
            "time": n.created_at.strftime("%b %d, %H:%M") if n.created_at else "Recent",
            "type": n.type,
            "read": n.is_read
        }
        for n in notifs
    ]

@router.post("/notifications/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    """Mark all unread notifications as read."""
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read."}

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    """Mark a specific notification as read."""
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}
