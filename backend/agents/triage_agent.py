import re

class TriageAgent:
    @staticmethod
    def analyze(text: str) -> dict:
        text_lower = str(text).lower()
        
        # Severity heuristics
        critical_keywords = ['crash', 'data loss', 'security', 'vulnerability', 'downtime', 'outage']
        high_keywords = ['timeout', 'exception', 'error', 'failed', 'broken']
        
        severity = "medium"
        priority = "P3"
        confidence = 0.6
        
        if any(k in text_lower for k in critical_keywords):
            severity = "critical"
            priority = "P1"
            confidence = 0.9
        elif any(k in text_lower for k in high_keywords):
            severity = "high"
            priority = "P2"
            confidence = 0.8
            
        # Extract affected module
        module_match = re.search(r'in module (\w+)|component:? (\w+)|service:? (\w+)', text_lower)
        affected_module = module_match.group(1) or module_match.group(2) or module_match.group(3) if module_match else "unknown"
        
        return {
            "severity": severity,
            "priority": priority,
            "impact_assessment": f"Potential impact assessed as {severity.upper()} based on issue description.",
            "affected_module": affected_module,
            "confidence_score": confidence
        }
