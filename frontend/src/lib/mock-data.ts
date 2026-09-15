import type { User, Project, BugReport, KnowledgeBaseEntry, AIReport, DashboardStats, Notification, ActivityLog } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2563EB&color=fff' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'developer', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=06B6D4&color=fff' },
  { id: 'u3', name: 'David Chen', email: 'david.chen@example.com', role: 'manager', avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=22C55E&color=fff' },
  { id: 'u4', name: 'Sarah Miller', email: 'sarah.miller@example.com', role: 'developer', avatar: 'https://ui-avatars.com/api/?name=Sarah+Miller&background=F59E0B&color=fff' },
  { id: 'u5', name: 'Michael Chang', email: 'michael.chang@example.com', role: 'developer' },
  { id: 'u6', name: 'Anita Desai', email: 'anita.desai@example.com', role: 'developer' },
  { id: 'u7', name: 'James Wilson', email: 'james.wilson@example.com', role: 'developer' },
  { id: 'u8', name: 'Elena Rodriguez', email: 'elena.rodriguez@example.com', role: 'developer' },
  { id: 'u9', name: 'Vikram Singh', email: 'vikram.singh@example.com', role: 'developer' },
  { id: 'u10', name: 'Aisha Patel', email: 'aisha.patel@example.com', role: 'manager' },
  { id: 'u11', name: 'Tom Hardy', email: 'tom.hardy@example.com', role: 'developer' },
  { id: 'u12', name: 'Lisa Wong', email: 'lisa.wong@example.com', role: 'developer' },
  { id: 'u13', name: 'Rahul Dev', email: 'rahul.dev@example.com', role: 'developer' },
  { id: 'u14', name: 'Emma Watson', email: 'emma.watson@example.com', role: 'developer' },
  { id: 'u15', name: 'Karthik Iyer', email: 'karthik.iyer@example.com', role: 'developer' },
  { id: 'u16', name: 'Neha Gupta', email: 'neha.gupta@example.com', role: 'developer' },
  { id: 'u17', name: 'Chris Evans', email: 'chris.evans@example.com', role: 'manager' },
  { id: 'u18', name: 'Sanjay Dutt', email: 'sanjay.dutt@example.com', role: 'developer' },
  { id: 'u19', name: 'Olivia Brown', email: 'olivia.brown@example.com', role: 'developer' },
  { id: 'u20', name: 'Arjun Kapoor', email: 'arjun.kapoor@example.com', role: 'developer' }
];

export const mockProjects: Project[] = [
  { id: 'p1', name: 'E-Commerce Platform', description: 'Main B2C e-commerce website', repositoryUrl: 'https://github.com/org/e-commerce' },
  { id: 'p2', name: 'Payment Gateway', description: 'Microservice for payment processing', repositoryUrl: 'https://github.com/org/payment-gateway' },
  { id: 'p3', name: 'Mobile Banking App', description: 'React Native mobile application', repositoryUrl: 'https://github.com/org/mobile-banking' },
  { id: 'p4', name: 'Analytics Dashboard', description: 'Internal analytics tool', repositoryUrl: 'https://github.com/org/analytics' },
  { id: 'p5', name: 'API Gateway Service', description: 'Central API gateway for microservices', repositoryUrl: 'https://github.com/org/api-gateway' }
];

export const mockBugReports: BugReport[] = [
  {
    id: 'b1',
    title: 'NullPointerException in UserAuthService during token refresh',
    description: 'The auth service crashes with a NullPointerException when a user with an expired token but valid refresh token attempts to renew their session. Occurs specifically when the user object lacks a "lastLogin" timestamp in the database.',
    status: 'open',
    severity: 'high',
    priority: 'high',
    projectId: 'p5',
    reporterId: 'u2',
    assigneeId: 'u1',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-02T12:30:00Z',
    tags: ['backend', 'auth', 'crash']
  },
  {
    id: 'b2',
    title: 'Memory leak in WebSocket connection handler',
    description: 'WebSocket connections are not properly garbage collected after client disconnects. Over a period of 24 hours under high load, this causes the Node.js process to hit the memory limit and restart.',
    status: 'in-progress',
    severity: 'critical',
    priority: 'high',
    projectId: 'p4',
    reporterId: 'u4',
    assigneeId: 'u2',
    createdAt: '2026-07-28T09:15:00Z',
    updatedAt: '2026-08-05T14:20:00Z',
    tags: ['performance', 'memory', 'websocket']
  },
  {
    id: 'b3',
    title: 'SQL injection vulnerability in product search endpoint',
    description: 'The search query parameter on the /api/v1/products endpoint is not properly sanitized, allowing crafted inputs to execute arbitrary SQL commands. Identified during routine security scan.',
    status: 'resolved',
    severity: 'critical',
    priority: 'high',
    projectId: 'p1',
    reporterId: 'u1',
    assigneeId: 'u4',
    createdAt: '2026-07-15T11:45:00Z',
    resolvedAt: '2026-07-16T16:30:00Z',
    updatedAt: '2026-07-16T16:30:00Z',
    tags: ['security', 'database', 'api']
  },
  {
    id: 'b4',
    title: 'Race condition causes double payment processing',
    description: 'If a user clicks the "Pay Now" button rapidly multiple times, the client sends concurrent requests that occasionally bypass the idempotency check in the payment service, leading to double billing.',
    status: 'in-progress',
    severity: 'high',
    priority: 'high',
    projectId: 'p2',
    reporterId: 'u6',
    assigneeId: 'u7',
    createdAt: '2026-08-06T14:10:00Z',
    updatedAt: '2026-08-07T09:20:00Z',
    tags: ['billing', 'race-condition', 'frontend']
  },
  {
    id: 'b5',
    title: 'CORS policy blocking API requests from mobile app',
    description: 'Following the latest API deployment, the Mobile App is unable to fetch user profiles due to a CORS policy error. The allowed origins list seems to be missing the mobile app scheme.',
    status: 'open',
    severity: 'medium',
    priority: 'medium',
    projectId: 'p3',
    reporterId: 'u8',
    createdAt: '2026-08-07T08:00:00Z',
    updatedAt: '2026-08-07T08:00:00Z',
    tags: ['config', 'api', 'mobile']
  },
  {
    id: 'b6',
    title: 'JWT token not invalidated after password reset',
    description: 'When a user resets their password, existing active JWT tokens remain valid until they expire naturally. This allows previously logged-in sessions to continue accessing the account.',
    status: 'resolved',
    severity: 'high',
    priority: 'medium',
    projectId: 'p5',
    reporterId: 'u10',
    assigneeId: 'u11',
    createdAt: '2026-06-10T10:00:00Z',
    resolvedAt: '2026-06-12T14:00:00Z',
    updatedAt: '2026-06-12T14:00:00Z',
    tags: ['security', 'auth']
  },
  {
    id: 'b7',
    title: 'Database connection pool exhaustion under load',
    description: 'During peak hours (usually around 8 PM), the Postgres connection pool reaches its limit, causing cascading failures across services that attempt to read from the database.',
    status: 'in-progress',
    severity: 'high',
    priority: 'high',
    projectId: 'p1',
    reporterId: 'u12',
    assigneeId: 'u13',
    createdAt: '2026-08-02T20:15:00Z',
    updatedAt: '2026-08-06T11:00:00Z',
    tags: ['database', 'performance', 'infrastructure']
  },
  {
    id: 'b8',
    title: 'CSS flexbox layout breaking on Safari 16',
    description: 'The checkout page layout collapses horizontally on Safari 16 due to a known flexbox bug related to intrinsic sizing of images within flex items.',
    status: 'open',
    severity: 'low',
    priority: 'low',
    projectId: 'p1',
    reporterId: 'u14',
    createdAt: '2026-08-05T16:45:00Z',
    updatedAt: '2026-08-05T16:45:00Z',
    tags: ['frontend', 'ui', 'safari']
  },
  {
    id: 'b9',
    title: 'Rate limiter bypass through header manipulation',
    description: 'Users can bypass the API rate limits by appending X-Forwarded-For headers with random IP addresses, as the load balancer trusts the client-provided header.',
    status: 'resolved',
    severity: 'high',
    priority: 'high',
    projectId: 'p5',
    reporterId: 'u3',
    assigneeId: 'u5',
    createdAt: '2026-05-20T09:30:00Z',
    resolvedAt: '2026-05-21T17:45:00Z',
    updatedAt: '2026-05-21T17:45:00Z',
    tags: ['security', 'api', 'infrastructure']
  },
  {
    id: 'b10',
    title: 'File upload allows files exceeding 100MB limit',
    description: 'The frontend validation for file uploads can be bypassed, and the backend multer configuration fails to reject files larger than the 100MB policy limit, causing disk space issues.',
    status: 'open',
    severity: 'medium',
    priority: 'medium',
    projectId: 'p4',
    reporterId: 'u15',
    assigneeId: 'u16',
    createdAt: '2026-08-03T13:20:00Z',
    updatedAt: '2026-08-04T10:15:00Z',
    tags: ['backend', 'upload', 'validation']
  },
  {
    id: 'b11',
    title: 'Elasticsearch query timeout on large result sets',
    description: 'Search queries that match a large number of documents (e.g., searching for "the") timeout after 30 seconds instead of returning paginated results quickly.',
    status: 'in-progress',
    severity: 'medium',
    priority: 'low',
    projectId: 'p4',
    reporterId: 'u17',
    assigneeId: 'u18',
    createdAt: '2026-07-22T15:00:00Z',
    updatedAt: '2026-08-01T09:30:00Z',
    tags: ['search', 'performance', 'backend']
  },
  {
    id: 'b12',
    title: 'Redis cache not invalidated after user profile update',
    description: 'When a user updates their profile picture, the old URL remains cached in Redis for up to 24 hours, meaning other users still see the old avatar on comments and posts.',
    status: 'resolved',
    severity: 'low',
    priority: 'medium',
    projectId: 'p1',
    reporterId: 'u19',
    assigneeId: 'u20',
    createdAt: '2026-06-05T11:10:00Z',
    resolvedAt: '2026-06-06T14:20:00Z',
    updatedAt: '2026-06-06T14:20:00Z',
    tags: ['cache', 'backend', 'data-consistency']
  },
  {
    id: 'b13',
    title: 'GraphQL N+1 query problem in orders resolver',
    description: 'Fetching a list of orders along with their associated user details triggers a separate database query for each user, resulting in massive slowdowns on the admin dashboard.',
    status: 'open',
    severity: 'medium',
    priority: 'high',
    projectId: 'p4',
    reporterId: 'u2',
    createdAt: '2026-08-07T10:00:00Z',
    updatedAt: '2026-08-07T10:00:00Z',
    tags: ['graphql', 'performance', 'database']
  },
  {
    id: 'b14',
    title: 'Docker container OOM killed during batch processing',
    description: 'The nightly batch processing job consumes too much memory when loading large CSV files into memory, causing Kubernetes to terminate the pod with an OOMKilled error.',
    status: 'in-progress',
    severity: 'high',
    priority: 'high',
    projectId: 'p2',
    reporterId: 'u5',
    assigneeId: 'u9',
    createdAt: '2026-08-05T08:30:00Z',
    updatedAt: '2026-08-06T16:45:00Z',
    tags: ['infrastructure', 'memory', 'docker']
  },
  {
    id: 'b15',
    title: 'SSL certificate renewal automation failing',
    description: 'The certbot cron job failed to renew the SSL certificate for the staging environment due to a misconfigured ACME challenge route in the Nginx configuration.',
    status: 'resolved',
    severity: 'critical',
    priority: 'high',
    projectId: 'p5',
    reporterId: 'u3',
    assigneeId: 'u3',
    createdAt: '2026-07-01T09:00:00Z',
    resolvedAt: '2026-07-01T11:30:00Z',
    updatedAt: '2026-07-01T11:30:00Z',
    tags: ['security', 'infrastructure', 'ssl']
  },
  // Add remaining to make 30
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `b${16 + i}`,
    title: `UI glitch on settings page ${i + 1}`,
    description: `Minor alignment issue found on the settings page during QA. Element ${i + 1} is slightly off-center.`,
    status: i % 3 === 0 ? 'resolved' : (i % 2 === 0 ? 'in-progress' : 'open') as any,
    severity: 'low' as any,
    priority: 'low' as any,
    projectId: `p${(i % 5) + 1}`,
    reporterId: `u${(i % 20) + 1}`,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    tags: ['ui', 'frontend']
  }))
];

export const mockKbEntries: KnowledgeBaseEntry[] = [
  {
    id: 'kb1',
    title: 'Fix NullPointerException with Optional chaining',
    content: 'When dealing with deeply nested objects or uncertain data structures, utilize Optional chaining (?.) in TypeScript/JavaScript, or Java Optional class to prevent NullPointerExceptions.',
    authorId: 'u1',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-20T10:30:00Z',
    tags: ['backend', 'best-practices', 'error-handling'],
    relatedBugIds: ['b1']
  },
  {
    id: 'kb2',
    title: 'Resolve memory leaks using WeakRef pattern',
    content: 'To prevent memory leaks in event listeners or caching mechanisms, consider using WeakRef or WeakMap/WeakSet which allow the garbage collector to clear unused objects.',
    authorId: 'u2',
    createdAt: '2026-03-10T14:20:00Z',
    updatedAt: '2026-03-10T14:20:00Z',
    tags: ['performance', 'javascript', 'memory'],
    relatedBugIds: ['b2']
  },
  {
    id: 'kb3',
    title: 'Preventing SQL Injection with Parameterized Queries',
    content: 'Always use parameterized queries or an ORM that automatically sanitizes inputs. Never concatenate user input directly into SQL strings.',
    authorId: 'u4',
    createdAt: '2026-07-17T11:00:00Z',
    updatedAt: '2026-07-17T11:00:00Z',
    tags: ['security', 'database', 'sql'],
    relatedBugIds: ['b3']
  },
  {
    id: 'kb4',
    title: 'Handling Race Conditions with Distributed Locks',
    content: 'Implement distributed locking using Redis (Redlock) or a database lock when processing critical transactions like payments to ensure idempotency across multiple instances.',
    authorId: 'u7',
    createdAt: '2026-04-05T08:45:00Z',
    updatedAt: '2026-05-12T09:15:00Z',
    tags: ['backend', 'architecture', 'concurrency'],
    relatedBugIds: ['b4']
  },
  {
    id: 'kb5',
    title: 'Configuring CORS for Multi-Environment Apps',
    content: 'Ensure CORS origins are dynamically configured based on the environment variables. Always include explicit schemes (http/https) and specific domains rather than wildcards in production.',
    authorId: 'u8',
    createdAt: '2026-02-28T16:30:00Z',
    updatedAt: '2026-02-28T16:30:00Z',
    tags: ['api', 'security', 'configuration'],
    relatedBugIds: ['b5']
  },
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `kb${6 + i}`,
    title: `Standard Operating Procedure: Issue ${i + 6}`,
    content: `Documentation for resolving issue type ${i + 6}. Follow these steps to ensure consistency.`,
    authorId: `u${(i % 5) + 1}`,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    tags: ['sop', 'general'],
    relatedBugIds: []
  }))
];

export const mockDashboardStats: DashboardStats = {
  totalBugs: mockBugReports.length,
  openBugs: mockBugReports.filter(b => b.status === 'open').length,
  resolvedBugs: mockBugReports.filter(b => b.status === 'resolved').length,
  criticalBugs: mockBugReports.filter(b => b.severity === 'critical').length,
  aiResolvedCount: 12,
  averageResolutionTimeHours: 24.5,
  recentActivityCount: 15
};

export const mockAIReport: AIReport = {
  id: 'r1',
  bugId: 'b1',
  summary: 'The NullPointerException in UserAuthService occurs when attempting to read `lastLogin` from a user record that lacks this field. The code does not perform a null check before accessing properties of `user.lastLogin`.',
  rootCauseAnalysis: 'Historical data migration missed the `lastLogin` field for a subset of older users. The token refresh logic assumes `lastLogin` is always a valid Date object, leading to a crash when it encounters an undefined value.',
  suggestedFix: 'Implement Optional chaining and a fallback logic in `UserAuthService.ts`. Add a default fallback date or handle the null case explicitly before generating the new token.',
  confidenceScore: 0.95,
  similarBugs: ['b12', 'b4'],
  createdAt: '2026-08-01T10:05:00Z',
  agentResults: {
    logAnalysis: 'Found 45 occurrences of NullPointerException at UserAuthService.ts:142 in the last 24 hours. The stack trace points exactly to `user.lastLogin.getTime()`.',
    codeAnalysis: 'AST traversal shows `User` interface defines `lastLogin` as optional (`Date | undefined`), but the implementation at line 142 asserts it as non-null implicitly.',
    similaritySearch: 'Found similar bug #4211 from last year where `user.profilePicture` caused a crash due to missing null checks. The fix applied there was optional chaining.',
    fixRecommendation: 'Modify line 142 to: `const lastLoginTime = user.lastLogin?.getTime() ?? Date.now();`',
    validation: 'Static analysis confirms the proposed fix resolves the type error and prevents the runtime crash.'
  }
};

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u1', title: 'Critical Bug Assigned', message: 'You have been assigned to "Memory leak in WebSocket connection handler"', isRead: false, createdAt: '2026-08-07T09:00:00Z', type: 'bug_assigned', relatedId: 'b2' },
  { id: 'n2', userId: 'u1', title: 'AI Analysis Complete', message: 'AI has finished analyzing "NullPointerException in UserAuthService"', isRead: false, createdAt: '2026-08-07T10:05:00Z', type: 'ai_analysis_complete', relatedId: 'b1' },
  { id: 'n3', userId: 'u1', title: 'System Alert', message: 'API Gateway latency is elevated', isRead: true, createdAt: '2026-08-06T15:30:00Z', type: 'system_alert' },
  { id: 'n4', userId: 'u1', title: 'Mentioned in comment', message: 'David Chen mentioned you in "Race condition causes double payment"', isRead: true, createdAt: '2026-08-06T14:20:00Z', type: 'mention', relatedId: 'b4' },
  { id: 'n5', userId: 'u1', title: 'Bug Resolved', message: 'Sarah Miller resolved "SQL injection vulnerability"', isRead: true, createdAt: '2026-07-16T16:30:00Z', type: 'status_change', relatedId: 'b3' },
  { id: 'n6', userId: 'u1', title: 'New Knowledge Base Entry', message: 'A new KB entry on "Preventing SQL Injection" was published', isRead: true, createdAt: '2026-07-17T11:00:00Z', type: 'system_alert', relatedId: 'kb3' },
  { id: 'n7', userId: 'u1', title: 'Weekly Summary', message: 'You resolved 4 bugs this week. Great job!', isRead: true, createdAt: '2026-08-01T08:00:00Z', type: 'system_alert' },
  { id: 'n8', userId: 'u1', title: 'Bug Assigned', message: 'You have been assigned to "CSS flexbox layout breaking"', isRead: true, createdAt: '2026-08-05T17:00:00Z', type: 'bug_assigned', relatedId: 'b8' }
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'a1', userId: 'u2', action: 'created_bug', targetId: 'b1', targetType: 'bug', timestamp: '2026-08-01T10:00:00Z', details: 'Created bug report "NullPointerException in UserAuthService"' },
  { id: 'a2', userId: 'u1', action: 'updated_status', targetId: 'b3', targetType: 'bug', timestamp: '2026-07-16T16:30:00Z', details: 'Changed status to Resolved' },
  { id: 'a3', userId: 'u4', action: 'created_kb', targetId: 'kb3', targetType: 'kb_entry', timestamp: '2026-07-17T11:00:00Z', details: 'Created KB entry "Preventing SQL Injection"' },
  { id: 'a4', userId: 'system', action: 'ai_analysis', targetId: 'b1', targetType: 'bug', timestamp: '2026-08-01T10:05:00Z', details: 'AI completed analysis and generated report' },
  { id: 'a5', userId: 'u6', action: 'commented', targetId: 'b4', targetType: 'bug', timestamp: '2026-08-06T14:15:00Z', details: 'Added a comment with reproduction steps' },
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `a${6 + i}`,
    userId: `u${(i % 5) + 1}`,
    action: 'viewed' as any,
    targetId: `b${i + 1}`,
    targetType: 'bug' as any,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    details: 'Viewed bug details'
  }))
];

// Data for Charts
export const mockSeverityData = [
  { name: 'Critical', value: 8, fill: '#EF4444' },
  { name: 'High', value: 15, fill: '#F97316' },
  { name: 'Medium', value: 25, fill: '#EAB308' },
  { name: 'Low', value: 12, fill: '#3B82F6' },
];

export const mockMonthlyData = [
  { name: 'Mar', bugs: 12, resolved: 8 },
  { name: 'Apr', bugs: 18, resolved: 14 },
  { name: 'May', bugs: 22, resolved: 20 },
  { name: 'Jun', bugs: 15, resolved: 18 },
  { name: 'Jul', bugs: 28, resolved: 22 },
  { name: 'Aug', bugs: 19, resolved: 10 },
];

export const mockWeeklyData = [
  { name: 'Mon', count: 5 },
  { name: 'Tue', count: 8 },
  { name: 'Wed', count: 12 },
  { name: 'Thu', count: 7 },
  { name: 'Fri', count: 10 },
  { name: 'Sat', count: 2 },
  { name: 'Sun', count: 1 },
];

export const mockResolutionData = [
  { name: '< 1h', count: 12 },
  { name: '1-4h', count: 25 },
  { name: '4-24h', count: 18 },
  { name: '1-3d', count: 10 },
  { name: '> 3d', count: 5 },
];

export const mockModulesData = [
  { name: 'Authentication', count: 18 },
  { name: 'Payment Gateway', count: 15 },
  { name: 'User Interface', count: 25 },
  { name: 'Database', count: 12 },
  { name: 'API Services', count: 20 },
];

export const mockErrorTypesData = [
  { name: 'NullPointer', value: 22, fill: '#EF4444' },
  { name: 'Timeout', value: 15, fill: '#F59E0B' },
  { name: 'MemoryLeak', value: 8, fill: '#8B5CF6' },
  { name: 'SyntaxError', value: 10, fill: '#3B82F6' },
  { name: 'LogicError', value: 18, fill: '#10B981' },
];
