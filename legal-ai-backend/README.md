# Legal AI Assistant - Backend

## Setup

1. Create a virtual environment:
   python -m venv venv
   .\env\Scripts\Activate.ps1      (Windows)
  

2. Install dependencies:
   pip install -r requirements.txt

3. Copy .env.example to .env and add your Groq API key:
   GROQ_API_KEY=your_key_here

4. Run the server:
   uvicorn app.main:app --reload

5. Open the interactive API docs at:
   http://127.0.0.1:8000/docs

## Testing the flow

1. In /docs, try POST /upload -> choose a PDF contract -> Execute
   Copy the "session_id" from the response.

2. Try POST /chat -> paste:
   {
     "session_id": "paste-it-here",
     "question": "What is the termination notice period?"
   }

## Project structure
- app/config.py         Settings and API keys
- app/pdf_processor.py  PDF loading + chunking
- app/vector_store.py   FAISS embedding + storage
- app/rag_chain.py      LCEL RAG chain (Groq)
- app/main.py           FastAPI endpoints
