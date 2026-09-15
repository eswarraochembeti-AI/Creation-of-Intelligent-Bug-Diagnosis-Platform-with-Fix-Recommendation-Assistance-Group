import numpy as np
import json
import os
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from backend.rag.embeddings import embedder

EXPECTED_DIM = 384

class VectorStore:
    def __init__(self, store_path="vector_store.npz", meta_path="meta_store.json"):
        self.store_path = store_path
        self.meta_path = meta_path
        self.vectors: Optional[np.ndarray] = None
        self.metadata: List[Dict[str, Any]] = []
        self.load()

    def load(self):
        """Load vector store files from disk if they exist and are valid."""
        if os.path.exists(self.store_path) and os.path.exists(self.meta_path):
            try:
                data = np.load(self.store_path)
                vectors = data['vectors']
                with open(self.meta_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                
                if (
                    isinstance(vectors, np.ndarray) 
                    and vectors.ndim == 2 
                    and vectors.shape[1] == EXPECTED_DIM 
                    and len(vectors) == len(metadata)
                ):
                    self.vectors = vectors.astype(np.float32)
                    self.metadata = metadata
                    return
                else:
                    print("Warning: Vector store format/dimension mismatch. Resetting for rebuild.")
            except Exception as e:
                print(f"Warning: Could not load vector store files: {e}")
        
        self.vectors = None
        self.metadata = []

    def save(self):
        """Persist vector store and metadata to disk."""
        if self.vectors is not None and len(self.vectors) > 0:
            np.savez(self.store_path, vectors=self.vectors)
        else:
            np.savez(self.store_path, vectors=np.empty((0, EXPECTED_DIM), dtype=np.float32))
            
        with open(self.meta_path, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2)

    def rebuild_from_knowledge_base(self, db: Session):
        """Rebuild vector store completely from SQLite KnowledgeBase records."""
        from backend.models.models import KnowledgeBase
        
        kb_records = db.query(KnowledgeBase).all()
        print(f"Rebuilding vector store from {len(kb_records)} KnowledgeBase records...")
        
        if not kb_records:
            self.vectors = np.empty((0, EXPECTED_DIM), dtype=np.float32)
            self.metadata = []
            self.save()
            print("Vector store initialized with 0 records.")
            return

        texts = []
        metadatas = []
        seen_ids = set()

        for kb in kb_records:
            if kb.id in seen_ids:
                continue
            seen_ids.add(kb.id)

            text_content = f"{kb.title or ''} {kb.description or ''} {kb.root_cause or ''} {kb.fix_description or ''} {kb.code_fix or ''}".strip()
            if not text_content:
                text_content = f"Knowledge Base #{kb.id}"

            meta = {
                "id": kb.id,
                "title": kb.title,
                "root_cause": kb.root_cause,
                "fix_description": kb.fix_description,
                "code_fix": kb.code_fix,
                "severity": getattr(kb, 'severity', None),
                "status": getattr(kb, 'status', 'resolved') or 'resolved'
            }
            texts.append(text_content)
            metadatas.append(meta)

        embeddings = embedder.encode(texts)
        self.vectors = np.array(embeddings, dtype=np.float32)
        self.metadata = metadatas
        self.save()
        print(f"Vector store rebuild complete. Total indexed vectors: {len(self.metadata)} (dim={self.vectors.shape[1]})")

    def ensure_initialized(self, db: Session):
        """Check vector store validity and completeness against DB; rebuild if necessary."""
        from backend.models.models import KnowledgeBase

        kb_records = db.query(KnowledgeBase).all()
        db_kb_ids = set(kb.id for kb in kb_records)

        needs_rebuild = False

        if self.vectors is None or len(self.metadata) == 0:
            if len(db_kb_ids) > 0:
                needs_rebuild = True
        elif (
            self.vectors.ndim != 2 
            or self.vectors.shape[1] != EXPECTED_DIM 
            or len(self.vectors) != len(self.metadata)
        ):
            needs_rebuild = True
        else:
            indexed_ids = set(m.get("id") for m in self.metadata if isinstance(m, dict) and "id" in m)
            if not db_kb_ids.issubset(indexed_ids):
                needs_rebuild = True

        if needs_rebuild:
            print("Vector store missing, invalid, or out of sync with KnowledgeBase. Triggering rebuild...")
            self.rebuild_from_knowledge_base(db)
        else:
            print(f"Vector store ready: {len(self.metadata)} vectors loaded (dim={self.vectors.shape[1]}).")

    def add_kb_entry(self, kb_entry):
        """Add or update a single KnowledgeBase entry in vector store."""
        text_content = f"{kb_entry.title or ''} {kb_entry.description or ''} {kb_entry.root_cause or ''} {kb_entry.fix_description or ''} {kb_entry.code_fix or ''}".strip()
        if not text_content:
            text_content = f"Knowledge Base #{kb_entry.id}"

        meta = {
            "id": kb_entry.id,
            "title": kb_entry.title,
            "root_cause": kb_entry.root_cause,
            "fix_description": kb_entry.fix_description,
            "code_fix": kb_entry.code_fix,
            "severity": getattr(kb_entry, 'severity', None),
            "status": "resolved"
        }

        new_vec = embedder.encode([text_content])[0].astype(np.float32)

        existing_idx = None
        for idx, m in enumerate(self.metadata):
            if isinstance(m, dict) and m.get("id") == kb_entry.id:
                existing_idx = idx
                break

        if existing_idx is not None and self.vectors is not None:
            self.vectors[existing_idx] = new_vec
            self.metadata[existing_idx] = meta
        else:
            if self.vectors is None or len(self.vectors) == 0:
                self.vectors = np.array([new_vec], dtype=np.float32)
            else:
                self.vectors = np.vstack([self.vectors, new_vec])
            self.metadata.append(meta)

        self.save()

    def add(self, texts: List[str], metadatas: List[Dict[str, Any]]):
        """Batch add method with deduplication by item['id']."""
        if not texts:
            return
            
        new_vectors = embedder.encode(texts).astype(np.float32)

        for i, meta in enumerate(metadatas):
            item_id = meta.get("id")
            existing_idx = None
            if item_id is not None:
                for idx, m in enumerate(self.metadata):
                    if isinstance(m, dict) and m.get("id") == item_id:
                        existing_idx = idx
                        break

            if existing_idx is not None and self.vectors is not None:
                self.vectors[existing_idx] = new_vectors[i]
                self.metadata[existing_idx] = meta
            else:
                if self.vectors is None or len(self.vectors) == 0:
                    self.vectors = np.array([new_vectors[i]], dtype=np.float32)
                else:
                    self.vectors = np.vstack([self.vectors, new_vectors[i]])
                self.metadata.append(meta)

        self.save()

    def search(self, query: str, top_k: int = 5, min_score: float = 0.0) -> List[Tuple[Dict[str, Any], float]]:
        if self.vectors is None or len(self.vectors) == 0:
            return []
            
        query_vec = embedder.encode(query)[0]
        
        # Cosine similarity (since embeddings are unit normalized)
        similarities = np.dot(self.vectors, query_vec)
        
        top_indices = np.argsort(similarities)[::-1]
        
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= min_score:
                results.append((self.metadata[idx], score))
            if len(results) >= top_k:
                break
                
        return results

vector_store = VectorStore()


