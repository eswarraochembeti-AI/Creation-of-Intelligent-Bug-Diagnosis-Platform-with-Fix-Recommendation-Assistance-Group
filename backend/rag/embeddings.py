from typing import List, Union
import numpy as np
import os
import ssl

# Bypass SSL certificate verification for HuggingFace Hub downloads on Windows local dev
os.environ["HF_HUB_DISABLE_SSL_VERIFY"] = "1"
os.environ["PYTHONHTTPSVERIFY"] = "0"
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""

ssl._create_default_https_context = ssl._create_unverified_context

try:
    import urllib3
    urllib3.disable_warnings()
except ImportError:
    pass

try:
    import requests
    requests.Session.verify = False
except ImportError:
    pass

try:
    import httpx
    import huggingface_hub
    _orig_httpx_init = httpx.Client.__init__
    def _unverified_httpx_init(self, *args, **kwargs):
        kwargs['verify'] = False
        _orig_httpx_init(self, *args, **kwargs)
    httpx.Client.__init__ = _unverified_httpx_init
    if hasattr(huggingface_hub, 'set_client_factory'):
        huggingface_hub.set_client_factory(lambda: httpx.Client(verify=False))
except Exception:
    pass


MODEL_NAME = "all-MiniLM-L6-v2"



class SentenceTransformerEmbedder:
    """Real semantic vector embedding engine powered by sentence-transformers/all-MiniLM-L6-v2."""
    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
        self._model = None
        self._load_error = None


    def _get_model(self):
        if self._model is not None:
            return self._model
        if self._load_error is not None:
            raise RuntimeError(
                f"Semantic embedding model '{self.model_name}' is unavailable due to prior initialization error: {self._load_error}"
            )

        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
            return self._model
        except Exception as e:
            self._load_error = str(e)
            raise RuntimeError(
                f"Failed to load required semantic embedding model '{self.model_name}'. "
                f"Please verify sentence-transformers is installed in your python environment. Details: {e}"
            )

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        model = self._get_model()
        if isinstance(texts, str):
            texts = [texts]
        embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings

    def transform(self, text: str) -> List[float]:
        embeddings = self.encode(text)
        return embeddings[0].tolist()

embedder = SentenceTransformerEmbedder()

