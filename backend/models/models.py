from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    organization = Column(String)
    role = Column(String, default="developer") # admin/manager/developer/viewer
    status = Column(String, default="Active") # Active / Pending
    profile_photo = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bug_reports = relationship("BugReport", back_populates="reporter", foreign_keys="BugReport.reporter_id")
    assigned_bugs = relationship("BugReport", back_populates="assignee", foreign_keys="BugReport.assigned_to")
    comments = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    projects = relationship("Project", back_populates="organization")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    technology = Column(String)
    framework = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="projects")
    bug_reports = relationship("BugReport", back_populates="project")

class BugReport(Base):
    __tablename__ = "bug_reports"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    bug_text = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    error_log = Column(Text, nullable=True)
    severity = Column(String, default="medium") # critical/high/medium/low
    priority = Column(String, default="P3") # P1/P2/P3/P4
    status = Column(String, default="open") # open/in_progress/resolved/closed/duplicate
    affected_module = Column(String, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reporter = relationship("User", back_populates="bug_reports", foreign_keys=[reporter_id])
    assignee = relationship("User", back_populates="assigned_bugs", foreign_keys=[assigned_to])
    project = relationship("Project", back_populates="bug_reports")
    ai_report = relationship("AIReport", back_populates="bug_report", uselist=False)
    comments = relationship("Comment", back_populates="bug_report")
    attachments = relationship("Attachment", back_populates="bug_report")

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    bug_text = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=False)
    fix_description = Column(Text, nullable=False)
    code_fix = Column(Text, nullable=True)
    severity = Column(String)
    priority = Column(String)
    technology = Column(String)
    framework = Column(String)
    tags = Column(String) # Comma separated
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    developer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="active") # active/archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIReport(Base):
    __tablename__ = "ai_reports"
    id = Column(Integer, primary_key=True, index=True)
    bug_report_id = Column(Integer, ForeignKey("bug_reports.id"), unique=True, nullable=False)
    triage_result = Column(JSON, nullable=True)
    log_analysis_result = Column(JSON, nullable=True)
    root_cause_result = Column(JSON, nullable=True)
    duplicate_result = Column(JSON, nullable=True)
    remediation_result = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    processing_time = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bug_report = relationship("BugReport", back_populates="ai_report")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bug_report_id = Column(Integer, ForeignKey("bug_reports.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="comments")
    bug_report = relationship("BugReport", back_populates="comments")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Attachment(Base):
    __tablename__ = "attachments"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    bug_report_id = Column(Integer, ForeignKey("bug_reports.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    bug_report = relationship("BugReport", back_populates="attachments")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TeamInvitation(Base):
    __tablename__ = "team_invitations"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, default="Developer")
    message = Column(Text, nullable=True)
    token = Column(String, unique=True, index=True, nullable=False)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="Pending") # Pending, Accepted, Canceled, Expired
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    invited_by = relationship("User", foreign_keys=[invited_by_id])

class UserSettings(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String, default="system")
    organization_name = Column(String, default="TechCorp Solutions")
    organization_desc = Column(String, default="Enterprise Software Engineering & AI Diagnostics")
    email_notif = Column(Boolean, default=True)
    push_notif = Column(Boolean, default=True)
    weekly_digest = Column(Boolean, default=False)
    notif_analysis_completed = Column(Boolean, default=True)
    notif_bug_assigned = Column(Boolean, default=True)
    notif_team_invitation = Column(Boolean, default=True)
    notif_bug_resolved = Column(Boolean, default=True)
    notif_kb_update = Column(Boolean, default=True)
    ai_model = Column(String, default="sentence-transformers/all-MiniLM-L6-v2")
    confidence_threshold = Column(Integer, default=85)
    session_timeout_enabled = Column(Boolean, default=True)
    session_timeout_minutes = Column(Integer, default=30)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="settings")
