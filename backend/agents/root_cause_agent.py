from backend.rag.retriever import retriever

class RootCauseAgent:
    @staticmethod
    def determine_root_cause(bug_data: dict, parsed_logs: dict) -> dict:
        query_text = f"{bug_data.get('title', '')} {bug_data.get('description', '')} {parsed_logs.get('exception_type', '')}"
        
        # Retrieve similar bugs from Knowledge Base via RAG
        similar_cases = retriever.get_relevant_context(query_text, top_k=3)
        
        if similar_cases and similar_cases[0]['similarity_score'] >= 0.5:
            best_match = similar_cases[0]
            cause = best_match['root_cause']
            confidence = best_match['similarity_score']
            evidence = [
                f"Historical RAG match: KB #{best_match['knowledge_id']} - '{best_match['title']}' "
                f"(Semantic Similarity: {round(best_match['similarity_score'] * 100, 1)}%)"
            ]
        else:
            cause = f"Likely related to {parsed_logs.get('exception_type', 'an unhandled exception')} in {parsed_logs.get('root_file', 'unknown file')}."
            confidence = 0.45
            evidence = ["No sufficiently similar historical bugs found in knowledge base. Analysis based on log trace heuristics."]
            
        return {
            "most_probable_cause": cause,
            "technical_explanation": "Based on error signatures and log traces, the agent evaluated the issue against indexed defect knowledge.",
            "evidence": evidence,
            "confidence_percentage": round(confidence * 100, 2)
        }

