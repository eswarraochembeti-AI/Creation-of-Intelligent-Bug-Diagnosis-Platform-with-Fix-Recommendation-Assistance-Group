from backend.rag.retriever import retriever

class RemediationAgent:
    @staticmethod
    def generate_fix(root_cause_data: dict, bug_data: dict) -> dict:
        query_text = f"{bug_data.get('title', '')} {root_cause_data.get('most_probable_cause', '')}"
        similar_cases = retriever.get_relevant_context(query_text, top_k=3)
        
        if similar_cases and similar_cases[0]['similarity_score'] >= 0.5:
            best_match = similar_cases[0]
            immediate_fix = f"Apply resolution from historical case #{best_match.get('knowledge_id')}: {best_match.get('fix_description')}"
            permanent_fix = best_match.get('fix_description', "Implement robust input validation and error handling.")
            code_snippet = best_match.get('code_fix') or "try:\n    # apply fix\nexcept Exception as e:\n    logger.error(e)"
            has_historical = True
            historical_ref = f"Grounded in historical resolved case #{best_match.get('knowledge_id')} '{best_match.get('title')}'"
        else:
            immediate_fix = "Apply defensive null check or exception handling around the failing statement."
            permanent_fix = "Implement robust input validation, boundary checking, and contextual logging."
            code_snippet = "if data is not None:\n    process(data)\nelse:\n    logger.warning('Null input encountered')"
            has_historical = False
            historical_ref = "No sufficiently similar historical bugs found in knowledge base. Recommendation based on general software engineering heuristics."
            
        return {
            "immediate_fix": immediate_fix,
            "permanent_fix": permanent_fix,
            "suggested_code_changes": code_snippet,
            "has_historical_evidence": has_historical,
            "historical_reference": historical_ref,
            "testing_strategy": "1. Write unit tests to reproduce the failure.\n2. Apply the fix.\n3. Verify test suite passes cleanly.",
            "deployment_checklist": ["Code review", "Run CI pipeline", "Deploy to staging", "Monitor log streams"],
            "best_practices": ["Input validation", "Proper exception handling", "Contextual error logging"],
            "risk_level": "Medium",
            "estimated_fix_time": "1-3 hours"
        }

