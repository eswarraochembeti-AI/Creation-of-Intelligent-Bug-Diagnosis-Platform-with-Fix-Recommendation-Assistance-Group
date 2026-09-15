from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Generic, TypeVar
from datetime import datetime

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    organization: Optional[str] = None
    role: str = "developer"
    status: Optional[str] = "Active"
    profile_photo: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    profile_photo: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    status: Optional[str] = "Active"
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TeamInviteRequest(BaseModel):
    name: str
    email: EmailStr
    role: str = "Developer"
    message: Optional[str] = None

class TeamInviteResponse(BaseModel):
    success: bool
    message: str
    member: Dict[str, Any]

class MemberRoleUpdate(BaseModel):
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = "system"
    organization_name: Optional[str] = "TechCorp Solutions"
    organization_desc: Optional[str] = "Enterprise Software Engineering & AI Diagnostics"
    email_notif: Optional[bool] = True
    push_notif: Optional[bool] = True
    weekly_digest: Optional[bool] = False
    notif_analysis_completed: Optional[bool] = True
    notif_bug_assigned: Optional[bool] = True
    notif_team_invitation: Optional[bool] = True
    notif_bug_resolved: Optional[bool] = True
    notif_kb_update: Optional[bool] = True
    ai_model: Optional[str] = "sentence-transformers/all-MiniLM-L6-v2"
    confidence_threshold: Optional[int] = 85
    session_timeout_enabled: Optional[bool] = True
    session_timeout_minutes: Optional[int] = 30

class UserSettingsResponse(BaseModel):
    theme: str = "system"
    organization_name: str = "TechCorp Solutions"
    organization_desc: str = "Enterprise Software Engineering & AI Diagnostics"
    email_notif: bool = True
    push_notif: bool = True
    weekly_digest: bool = False
    notif_analysis_completed: bool = True
    notif_bug_assigned: bool = True
    notif_team_invitation: bool = True
    notif_bug_resolved: bool = True
    notif_kb_update: bool = True
    ai_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    confidence_threshold: int = 85
    session_timeout_enabled: bool = True
    session_timeout_minutes: int = 30

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Bug Report Schemas
class BugReportBase(BaseModel):
    title: str
    description: str
    bug_text: Optional[str] = None
    stack_trace: Optional[str] = None
    error_log: Optional[str] = None
    severity: str = "medium"
    priority: str = "P3"
    affected_module: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None

class BugReportCreate(BugReportBase):
    pass

class BugReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    affected_module: Optional[str] = None
    assigned_to: Optional[int] = None

class BugReportResponse(BugReportBase):
    id: int
    status: str
    reporter_id: int
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Knowledge Base Schemas
class KnowledgeBaseBase(BaseModel):
    title: str
    description: str
    bug_text: Optional[str] = None
    stack_trace: Optional[str] = None
    root_cause: str
    fix_description: str
    code_fix: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    technology: Optional[str] = None
    framework: Optional[str] = None
    tags: Optional[str] = None
    project_id: Optional[int] = None

class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass

class KnowledgeBaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    root_cause: Optional[str] = None
    fix_description: Optional[str] = None
    code_fix: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None

class KnowledgeBaseResponse(KnowledgeBaseBase):
    id: int
    developer_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# AI Report Schemas
class AIReportResponse(BaseModel):
    id: int
    bug_report_id: int
    triage_result: Optional[Dict[str, Any]] = None
    log_analysis_result: Optional[Dict[str, Any]] = None
    root_cause_result: Optional[Dict[str, Any]] = None
    duplicate_result: Optional[Dict[str, Any]] = None
    remediation_result: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_time: Optional[float] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Comment Schemas
class CommentCreate(BaseModel):
    content: str
    bug_report_id: int

class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    bug_report_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Analytics & Dashboard Schemas
class DashboardStats(BaseModel):
    total_bugs: int
    open_bugs: int
    resolved_bugs: int
    critical_bugs: int
    pending_bugs: Optional[int] = 0
    duplicate_bugs: Optional[int] = 0
    kb_entries: Optional[int] = 0
    ai_confidence: Optional[float] = 92.0
    average_resolution_time_hours: Optional[float] = 2.4
    today_reports: Optional[int] = 0
    recent_bugs: Optional[List[Dict[str, Any]]] = None

class ChartData(BaseModel):
    labels: List[str]
    values: List[float]

class AnalyticsResponse(BaseModel):
    chart_data: ChartData

class SearchResult(BaseModel):
    type: str
    id: int
    title: str
    snippet: str
