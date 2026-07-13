import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.pdf_processor import process_pdf
from app.vector_store import build_vector_store
from app.rag_chain import ask_question

app = FastAPI(title="Legal AI Assistant API")

# Allows your future React frontend (on a different port/domain) to call this API.
# Tighten allow_origins to your actual frontend URL before deploying to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)


class ChatRequest(BaseModel):
    session_id: str
    question: str


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Legal AI Assistant backend is running"}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts a PDF upload, processes it (load -> chunk -> embed -> FAISS),
    and returns a session_id to use for follow-up questions.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    session_id = str(uuid.uuid4())
    saved_path = os.path.join(settings.UPLOAD_DIR, f"{session_id}.pdf")

    # Save the uploaded file to disk
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        chunks = process_pdf(saved_path)
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract any text from this PDF.")
        build_vector_store(chunks, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    return {
        "session_id": session_id,
        "filename": file.filename,
        "chunks_created": len(chunks),
        "message": "Document processed successfully. Use this session_id to ask questions.",
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Answers a question about a previously uploaded document, identified by session_id.
    """
    try:
        answer = ask_question(request.session_id, request.question)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate answer: {str(e)}")

    return {"session_id": request.session_id, "question": request.question, "answer": answer}
