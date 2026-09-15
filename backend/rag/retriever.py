from typing import List, Dict, Any
from backend.rag.vector_store import vector_store

class Retriever:
    @staticmethod
    def get_relevant_context(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        results = vector_store.search(query, top_k=top_k)
        formatted_results = []
        for meta, score in results:
            formatted_results.append({
                "knowledge_id": meta.get("id"),
                "title": meta.get("title"),
                "root_cause": meta.get("root_cause"),
                "fix_description": meta.get("fix_description"),
                "similarity_score": score
            })
        return formatted_results

retriever = Retriever()
