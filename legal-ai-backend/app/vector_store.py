import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import settings

# Loaded once and reused - loading this model fresh on every request would be slow
_embeddings = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("Loading embedding model (all-MiniLM-L6-v2)...")
        _embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embeddings


def build_vector_store(chunks, session_id: str):
    """
    Embeds chunks and saves a FAISS index to disk, namespaced by session_id
    so each uploaded document gets its own isolated store.
    """
    embeddings = get_embeddings()
    vector_store = FAISS.from_documents(chunks, embeddings)

    save_path = os.path.join(settings.VECTOR_STORE_DIR, session_id)
    vector_store.save_local(save_path)
    print(f"Saved FAISS index for session '{session_id}' at '{save_path}'")
    return vector_store


def load_vector_store(session_id: str):
    """
    Loads a previously saved FAISS index for a given session.
    """
    save_path = os.path.join(settings.VECTOR_STORE_DIR, session_id)
    if not os.path.exists(save_path):
        raise FileNotFoundError(f"No vector store found for session '{session_id}'. Upload a document first.")

    embeddings = get_embeddings()
    vector_store = FAISS.load_local(
        save_path,
        embeddings,
        allow_dangerous_deserialization=True,  # safe here since we only load files we wrote ourselves
    )
    return vector_store
