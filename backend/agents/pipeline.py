import time
from sqlalchemy.orm import Session
from backend.models.models import BugReport, AIReport
from .triage_agent import TriageAgent
from .log_analysis_agent import LogAnalysisAgent
from .root_cause_agent import RootCauseAgent
from .duplicate_detection_agent import DuplicateDetectionAgent
from .remediation_agent import RemediationAgent

class PipelineOrchestrator:
    @staticmethod
    def run_analysis(db: Session, bug_id: int):
        start_time = time.time()
        
        bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
            
        bug_data = {
            "title": bug.title,
            "description": bug.description,
            "text": f"{bug.title} {bug.description} {bug.bug_text or ''}"
        }
        
        # 1. Triage
        triage_result = TriageAgent.analyze(bug_data["text"])
        
        # 2. Log Analysis
        log_result = LogAnalysisAgent.parse_stack_trace(bug.stack_trace or bug.error_log)
        
        # 3. Root Cause
        root_cause_result = RootCauseAgent.determine_root_cause(bug_data, log_result)
        
        # 4. Duplicate Detection
        duplicate_result = DuplicateDetectionAgent.detect_duplicates(bug_data["text"])
        
        # 5. Remediation
        remediation_result = RemediationAgent.generate_fix(root_cause_result, bug_data)
        
        # Aggregate
        overall_confidence = (triage_result["confidence_score"] * 100 + root_cause_result["confidence_percentage"]) / 2
        processing_time = time.time() - start_time
        
        # Update Bug severity/priority if highly confident
        if triage_result["confidence_score"] > 0.8:
            bug.severity = triage_result["severity"]
            bug.priority = triage_result["priority"]
            if triage_result["affected_module"]:
                bug.affected_module = triage_result["affected_module"]
                
        # Save AI Report
        existing_report = db.query(AIReport).filter(AIReport.bug_report_id == bug_id).first()
        if existing_report:
            db.delete(existing_report)
            
        report = AIReport(
            bug_report_id=bug_id,
            triage_result=triage_result,
            log_analysis_result=log_result,
            root_cause_result=root_cause_result,
            duplicate_result=duplicate_result,
            remediation_result=remediation_result,
            summary=f"Automated analysis completed. Predicted root cause: {root_cause_result['most_probable_cause']}",
            confidence_score=overall_confidence,
            processing_time=processing_time
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return report
