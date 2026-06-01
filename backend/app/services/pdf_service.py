import os
import uuid
import json
from datetime import datetime
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings
from app.services.vector_store import add_chunks

# In-memory document registry (persisted to JSON)
REGISTRY_PATH = os.path.join(settings.UPLOAD_DIR, "_registry.json")


def _load_registry() -> dict:
    if os.path.exists(REGISTRY_PATH):
        with open(REGISTRY_PATH, "r") as f:
            return json.load(f)
    return {}


def _save_registry(registry: dict):
    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)


def process_pdf(file_path: str, filename: str, user_id: int) -> dict:
    """Extract text from PDF, chunk it, and store embeddings."""
    reader = PdfReader(file_path)
    page_count = len(reader.pages)

    # Extract text per page
    full_text = ""
    page_texts = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        page_texts.append(text)
        full_text += text + "\n"

    if not full_text.strip():
        raise ValueError("PDF contains no extractable text. It may be scanned/image-based.")

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    # Create chunks with page-level metadata
    chunks = []
    for page_num, page_text in enumerate(page_texts):
        if not page_text.strip():
            continue
        page_chunks = splitter.split_text(page_text)
        for chunk_text in page_chunks:
            chunks.append({
                "text": chunk_text,
                "metadata": {
                    "filename": filename,
                    "page": page_num + 1,
                    "total_pages": page_count,
                    "user_id": user_id,
                },
            })

    # Store in vector DB
    doc_id = str(uuid.uuid4())
    chunk_count = add_chunks(chunks, doc_id)

    # Update registry
    file_size = os.path.getsize(file_path)
    doc_info = {
        "id": doc_id,
        "filename": filename,
        "page_count": page_count,
        "chunk_count": chunk_count,
        "uploaded_at": datetime.now().isoformat(),
        "size_bytes": file_size,
        "file_path": file_path,
        "user_id": user_id,
    }

    registry = _load_registry()
    registry[doc_id] = doc_info
    _save_registry(registry)

    return doc_info


def get_all_documents(user_id: int) -> list[dict]:
    registry = _load_registry()
    return [
        doc for doc in registry.values()
        if doc.get("user_id") == user_id
    ]


def delete_document(doc_id: str, user_id: int) -> bool:
    from app.services.vector_store import delete_doc_chunks

    registry = _load_registry()

    if doc_id not in registry:
        return False

    doc = registry[doc_id]

    if doc.get("user_id") != user_id:
        return False

    file_path = doc.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    delete_doc_chunks(doc_id)

    del registry[doc_id]
    _save_registry(registry)

    return True


def get_total_size() -> int:
    registry = _load_registry()
    return sum(doc.get("size_bytes", 0) for doc in registry.values())
