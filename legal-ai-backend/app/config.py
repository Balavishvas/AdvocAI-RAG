import os
from dotenv import load_dotenv

# Load variables from a .env file into the environment
load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    UPLOAD_DIR: str = "uploads"
    VECTOR_STORE_DIR: str = "vector_stores"

    # Chunking settings (same idea as your RAG series)
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150

    # How many chunks to retrieve per question
    RETRIEVAL_K: int = 4

settings = Settings()

if not settings.GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not set. Add it to a .env file before running.")
