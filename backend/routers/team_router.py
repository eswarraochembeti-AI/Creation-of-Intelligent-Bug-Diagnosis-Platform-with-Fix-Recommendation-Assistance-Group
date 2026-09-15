from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid

from backend.database import get_db
from backend.models.models import User, TeamInvitation
from backend.schemas.schemas import (
    UserResponse, 
    TeamInviteRequest, 
    TeamInviteResponse, 
    MemberRoleUpdate
)
from backend.auth.auth import get_password_hash

router = APIRouter(prefix="/api/team", tags=["team"])

VALID_ROLES = {"admin", "manager", "developer", "viewer"}

@router.get("/members", response_model=List[UserResponse])
def get_team_members(db: Session = Depends(get_db)):
    """Retrieve all team members including active and pending members."""
    members = db.query(User).order_by(User.id.desc()).all()
    return members

@router.get("/invitations")
def get_pending_invitations(db: Session = Depends(get_db)):
    """Retrieve all pending invitations stored in SQLite."""
    invites = db.query(TeamInvitation).order_by(TeamInvitation.created_at.desc()).all()
    return [
        {
            "id": inv.id,
            "email": inv.email,
            "role": inv.role.capitalize(),
            "message": inv.message,
            "token": inv.token,
            "status": inv.status,
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
            "expires_at": inv.expires_at.isoformat() if inv.expires_at else None
        }
        for inv in invites
    ]

@router.post("/invite", response_model=TeamInviteResponse, status_code=status.HTTP_201_CREATED)
def invite_team_member(payload: TeamInviteRequest, db: Session = Depends(get_db)):
    """Invite a new team member with database-backed invitation tracking."""
    name = payload.name.strip()
    email = payload.email.strip().lower()
    role = payload.role.strip().lower()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Full Name is required and cannot be empty."
        )

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles are: {', '.join(r.capitalize() for r in VALID_ROLES)}"
        )

    # Check for duplicate email in User table
    existing_user = db.query(User).filter(User.email.ilike(email)).first()
    if existing_user:
        if (existing_user.status or "").lower() == "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An invitation is already pending for this email address."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already an active team member."
            )

    # Create invitation record
    inv_token = f"inv_{uuid.uuid4().hex}"
    expires_at = datetime.utcnow() + timedelta(days=7)
    invitation = TeamInvitation(
        email=email,
        role=role.capitalize(),
        message=payload.message.strip() if payload.message else None,
        token=inv_token,
        status="Pending",
        created_at=datetime.utcnow(),
        expires_at=expires_at
    )
    db.add(invitation)

    # Create pending user record
    new_member = User(
        name=name,
        email=email,
        role=role,
        status="Pending",
        password_hash=get_password_hash("temp_invite_pass_123"),
        organization="TechCorp Solutions",
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {
        "success": True,
        "message": "Invitation created successfully in database.",
        "member": {
            "id": new_member.id,
            "name": new_member.name,
            "email": new_member.email,
            "role": new_member.role.capitalize(),
            "status": new_member.status,
            "created_at": new_member.created_at.isoformat()
        }
    }

@router.delete("/invitations/{inv_id}")
def cancel_invitation(inv_id: int, db: Session = Depends(get_db)):
    """Cancel a pending team invitation."""
    inv = db.query(TeamInvitation).filter(TeamInvitation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    inv.status = "Canceled"
    # Also clean up pending user
    user = db.query(User).filter(User.email.ilike(inv.email), User.status == "Pending").first()
    if user:
        db.delete(user)
    db.commit()
    return {"success": True, "message": "Invitation canceled successfully."}

@router.post("/invitations/{inv_id}/resend")
def resend_invitation(inv_id: int, db: Session = Depends(get_db)):
    """Resend / renew a team invitation in database."""
    inv = db.query(TeamInvitation).filter(TeamInvitation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    inv.status = "Pending"
    inv.expires_at = datetime.utcnow() + timedelta(days=7)
    db.commit()
    return {"success": True, "message": "Invitation renewed successfully (valid for 7 days)."}

@router.patch("/members/{member_id}/role")
@router.put("/members/{member_id}/role")
def update_member_role(member_id: int, payload: MemberRoleUpdate, db: Session = Depends(get_db)):
    """Update a team member's role and persist changes in SQLite."""
    role = payload.role.strip().lower()
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Allowed roles are: {', '.join(r.capitalize() for r in VALID_ROLES)}"
        )

    member = db.query(User).filter(User.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found."
        )

    member.role = role
    member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(member)

    return {
        "success": True,
        "message": f"Role updated to {member.role.capitalize()} successfully",
        "member": {
            "id": member.id,
            "name": member.name,
            "email": member.email,
            "role": member.role.capitalize(),
            "status": member.status or "Active",
            "created_at": member.created_at.isoformat()
        }
    }

@router.delete("/members/{member_id}")
def remove_team_member(member_id: int, db: Session = Depends(get_db)):
    """Remove a team member or invitation from the database."""
    member = db.query(User).filter(User.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found."
        )

    try:
        db.delete(member)
        db.commit()
    except Exception:
        db.rollback()
        member.is_active = False
        member.status = "Removed"
        db.commit()

    return {
        "success": True,
        "message": "Team member removed successfully."
    }

@router.get("/activity")
def get_activity():
    return [{"user_id": 1, "action": "Resolved bug #123", "timestamp": "2026-08-07T12:00:00Z"}]

