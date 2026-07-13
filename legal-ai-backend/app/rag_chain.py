# pyrefly: ignore [missing-import]
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from app.config import settings
from app.vector_store import load_vector_store

SYSTEM_PROMPT = """You are a legal document assistant. Answer the user's question using ONLY the
context below, which is extracted from a contract/agreement they uploaded.

Rules:
- Base your answer strictly on the provided context. Do not use outside legal knowledge.
- If the answer isn't in the context, say so clearly - do not guess.
- Quote the exact clause/section when possible.
- Always end your answer with this disclaimer: "This is not legal advice. Consult a licensed lawyer for your specific situation."

Context:
{context}
"""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{question}"),
])


def format_docs(docs):
    """Joins retrieved chunks into a single context string, with source page numbers."""
    return "\n\n".join(
        f"[Page {doc.metadata.get('page', '?')}] {doc.page_content}"
        for doc in docs
    )


def get_rag_chain(session_id: str):
    """
    Builds an LCEL RAG chain for a given session's uploaded document.
    """
    vector_store = load_vector_store(session_id)
    retriever = vector_store.as_retriever(search_kwargs={"k": settings.RETRIEVAL_K})

    llm = ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0,  # low temperature - we want factual, consistent answers on legal text
        groq_api_key=settings.GROQ_API_KEY,
    )

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | PROMPT
        | llm
        | StrOutputParser()
    )
    return chain


def ask_question(session_id: str, question: str) -> str:
    chain = get_rag_chain(session_id)
    answer = chain.invoke(question)
    return answer
