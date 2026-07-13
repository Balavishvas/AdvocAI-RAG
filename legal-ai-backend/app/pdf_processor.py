import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config import settings


def load_pdf(filepath: str):
    """
    Loads a single PDF and returns a list of page-level Documents.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"PDF not found at '{filepath}'")

    loader = PyPDFLoader(filepath)
    pages = loader.load()
    print(f"Loaded {len(pages)} pages from '{filepath}'")
    return pages


def chunk_documents(documents):
    """
    Splits page-level Documents into smaller overlapping chunks.
    Overlap matters here especially for contracts, where a clause
    (e.g. termination terms) can span across a chunk boundary.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks (size={settings.CHUNK_SIZE}, overlap={settings.CHUNK_OVERLAP})")
    return chunks


def process_pdf(filepath: str):
    """
    Full pipeline: load PDF -> chunk it. Ready for embedding.
    """
    pages = load_pdf(filepath)
    chunks = chunk_documents(pages)
    return chunks
