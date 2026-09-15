from backend.rag.vector_store import vector_store

class DuplicateDetectionAgent:
    DUPLICATE_THRESHOLD = 0.8  # Configurable threshold for duplicate classification
    SIMILAR_THRESHOLD = 0.5    # Configurable threshold for similar bug recommendations

    @classmethod
    def detect_duplicates(cls, bug_text: str, duplicate_threshold: float = None, similar_threshold: float = None) -> dict:
        dup_thresh = duplicate_threshold if duplicate_threshold is not None else cls.DUPLICATE_THRESHOLD
        sim_thresh = similar_threshold if similar_threshold is not None else cls.SIMILAR_THRESHOLD

        # Perform semantic vector similarity search
        results = vector_store.search(bug_text, top_k=5, min_score=sim_thresh)
        
        similar_bugs = []
        highest_score = 0.0
        
        for meta, score in results:
            if score > highest_score:
                highest_score = score
            similar_bugs.append({
                "id": meta.get("id"),
                "title": meta.get("title"),
                "similarity_score": round(score * 100, 2),
                "status": meta.get("status", "resolved"),
                "root_cause": meta.get("root_cause", ""),
                "fix_description": meta.get("fix_description", ""),
                "code_fix": meta.get("code_fix", "")
            })
                
        is_duplicate = highest_score >= dup_thresh
        
        return {
            "is_likely_duplicate": is_duplicate,
            "duplicate_threshold": dup_thresh,
            "similar_threshold": sim_thresh,
            "highest_similarity": round(highest_score * 100, 2),
            "similar_bugs": similar_bugs
        }

