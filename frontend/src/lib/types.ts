export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'tester' | 'manager';
  avatarUrl?: string;
  avatar?: string;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  organizationId?: string;
  repositoryUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  status: 'open' | 'in_progress' | 'in-progress' | 'resolved' | 'closed';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'high' | 'medium' | 'low' | 'P1' | 'P2' | 'P3' | 'P4';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  relatedBugIds?: string[];
}

export interface AIReport {
  id: string;
  bugReportId?: string;
  bugId?: string;
  summary?: string;
  rootCauseAnalysis?: string;
  suggestedFix?: string;
  confidenceScore?: number;
  similarBugs?: string[];
  agentResults?: any;
  triage?: TriageResult;
  logAnalysis?: LogAnalysisResult;
  rootCause?: RootCauseResult;
  duplicates?: DuplicateResult[];
  remediation?: RemediationResult;
  createdAt: string;
}

export interface TriageResult {
  suggestedSeverity: string;
  suggestedPriority: string;
  confidence: number;
  reasoning: string;
}

export interface LogAnalysisResult {
  summary: string;
  anomalies: string[];
  stackTraces: string[];
}

export interface RootCauseResult {
  description: string;
  confidence: number;
  likelyFiles: string[];
}

export interface DuplicateResult {
  bugReportId: string;
  similarityScore: number;
  title: string;
}

export interface RemediationResult {
  suggestedFix: string;
  codeSnippets: string[];
  estimatedEffort: string;
}

export interface Comment {
  id: string;
  bugReportId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
  type: 'info' | 'warning' | 'success' | 'error' | 'bug_assigned' | 'ai_analysis_complete' | 'system_alert' | 'mention' | 'status_change';
  createdAt: string;
  link?: string;
  relatedId?: string;
}

export interface Attachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  targetId?: string;
  targetType?: string;
  details: string;
  createdAt?: string;
  timestamp?: string;
}

export interface DashboardStats {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  criticalBugs: number;
  activeProjects?: number;
  kbEntries?: number;
  aiResolvedCount?: number;
  averageResolutionTimeHours?: number;
  recentActivityCount?: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchResult {
  id: string;
  type: 'bug' | 'kb' | 'project';
  title: string;
  snippet: string;
  url: string;
}
