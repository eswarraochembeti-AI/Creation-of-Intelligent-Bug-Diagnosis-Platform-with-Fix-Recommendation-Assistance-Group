import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.models import User, Project, BugReport, KnowledgeBase, Organization
from backend.auth.auth import get_password_hash

def seed_database(db: Session):
    # Check if DB is already seeded
    if db.query(Organization).count() > 0 or db.query(User).count() > 0:
        print("Database already seeded.")
        return

    print("Seeding database with realistic data...")

    # Org
    org = db.query(Organization).filter(Organization.name == "TechCorp Solutions").first()
    if not org:
        org = Organization(name="TechCorp Solutions", description="Enterprise Software Development")
        db.add(org)
        db.commit()

    # Users
    users = []
    roles = ["admin", "manager", "developer", "viewer"]
    names = ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Evan Wright", 
             "Fiona Gallagher", "George Costanza", "Hannah Abbott", "Ian Malcolm", "Jane Doe"] * 2
             
    for i, name in enumerate(names):
        email = name.lower().replace(" ", ".") + f"{i}@techcorp.com"
        role = "developer" if i > 3 else roles[i%4]
        user = User(
            email=email,
            name=name,
            password_hash=get_password_hash("password123"),
            organization="TechCorp Solutions",
            role=role
        )
        db.add(user)
        users.append(user)
    db.commit()

    # Projects
    projects_data = [
        ("E-Commerce Platform", "React, Node.js"),
        ("Payment Gateway", "Java, Spring Boot"),
        ("Mobile App", "Flutter, Dart"),
        ("Analytics Dashboard", "Vue.js, Python FastAPI"),
        ("API Gateway", "Go, Kubernetes")
    ]
    projects = []
    for name, tech in projects_data:
        p = Project(name=name, description=f"Core {name}", organization_id=org.id, technology=tech.split(",")[0], framework=tech)
        db.add(p)
        projects.append(p)
    db.commit()

    # Bug Reports & KB Scenarios
    scenarios = [
        {"title": "NullPointerException in user service", "desc": "App crashes when fetching user profile without avatar.", "type": "NullPointerException", "sev": "high"},
        {"title": "Memory leak in WebSocket handler", "desc": "Server memory increases linearly over 24h.", "type": "OutOfMemoryError", "sev": "critical"},
        {"title": "SQL injection vulnerability in search", "desc": "Search input allows raw SQL queries.", "type": "SecurityException", "sev": "critical"},
        {"title": "Race condition in payment processing", "desc": "Double charging occurs under heavy load.", "type": "ConcurrencyException", "sev": "critical"},
        {"title": "CORS misconfiguration", "desc": "Frontend cannot access API from new domain.", "type": "CorsError", "sev": "medium"},
        {"title": "JWT token expiration handling", "desc": "App doesn't redirect to login when token expires.", "type": "AuthException", "sev": "medium"},
        {"title": "Database connection pool exhaustion", "desc": "API hangs during peak hours.", "type": "TimeoutException", "sev": "high"},
        {"title": "CSS rendering issues on Safari", "desc": "Flexbox layout breaks on older Safari.", "type": "UIBug", "sev": "low"},
        {"title": "API rate limiting bypass", "desc": "Users can spam endpoints by changing IP.", "type": "SecurityIssue", "sev": "high"},
        {"title": "File upload size validation missing", "desc": "Server crashes when 5GB file uploaded.", "type": "PayloadTooLargeError", "sev": "high"}
    ] * 10 # Generate 100

    from backend.rag.vector_store import vector_store

    kb_texts = []
    kb_metas = []

    for i, s in enumerate(scenarios):
        # Create Bug
        status = random.choice(["open", "in_progress", "resolved", "closed"])
        bug = BugReport(
            title=f"{s['title']} #{i}",
            description=s['desc'],
            stack_trace=f"Traceback (most recent call last):\n  File \"app/main.py\", line 45, in handler\n    raise {s['type']}('Error')\n{s['type']}: Error",
            severity=s['sev'],
            priority=f"P{random.randint(1,4)}",
            status=status,
            project_id=random.choice(projects).id,
            reporter_id=random.choice(users).id,
            assigned_to=random.choice(users).id if status != "open" else None,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180))
        )
        db.add(bug)
        
        # Create KB for half of them
        if i % 2 == 0:
            kb = KnowledgeBase(
                title=f"Fix for {s['title']}",
                description=f"Standard resolution for {s['desc']}",
                root_cause=f"The root cause is unhandled {s['type']}.",
                fix_description="Implement bounds checking and validation.",
                code_fix="if not data:\n    return None",
                severity=s['sev'],
                project_id=bug.project_id,
                developer_id=bug.reporter_id
            )
            db.add(kb)
            db.commit()
            
            kb_texts.append(f"{kb.title} {kb.description} {kb.root_cause}")
            kb_metas.append({"id": kb.id, "title": kb.title, "root_cause": kb.root_cause, "fix_description": kb.fix_description})

    db.commit()
    
    # Init RAG vector store
    if kb_texts:
        vector_store.add(kb_texts, kb_metas)
        
    print("Database seeded successfully!")
