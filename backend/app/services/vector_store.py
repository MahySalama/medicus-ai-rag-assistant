import chromadb
import ollama
import hashlib
from typing import Optional
from app.config import settings

# Singleton client
_chroma_client: Optional[chromadb.PersistentClient] = None
_collection = None


def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
    return _chroma_client


def get_collection():
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name="medicus_docs",
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def generate_embedding(text: str) -> list[float]:
    """Generate embedding using Ollama's embedding model."""
    response = ollama.embed(model=settings.OLLAMA_EMBED_MODEL, input=text)
    return response["embeddings"][0]


def add_chunks(chunks: list[dict], doc_id: str):
    """
    Add document chunks to ChromaDB.
    Each chunk: {"text": str, "metadata": dict}
    """
    collection = get_collection()

    ids = []
    documents = []
    metadatas = []
    embeddings = []

    for i, chunk in enumerate(chunks):
        chunk_id = hashlib.md5(f"{doc_id}_{i}_{chunk['text'][:50]}".encode()).hexdigest()
        ids.append(chunk_id)
        documents.append(chunk["text"])
        metadatas.append({**chunk["metadata"], "doc_id": doc_id, "chunk_index": i})
        embeddings.append(generate_embedding(chunk["text"]))

    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )

    return len(ids)


def query_similar(question: str, user_id: int, n_results: int = 5) -> list[dict]:
    """Query ChromaDB for chunks similar to the question, limited to one user."""
    collection = get_collection()

    if collection.count() == 0:
        return []

    query_embedding = generate_embedding(question)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={"user_id": user_id},
        include=["documents", "metadatas", "distances"],
    )

    chunks = []

    if not results["ids"] or not results["ids"][0]:
        return chunks

    for i in range(len(results["ids"][0])):
        chunks.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i],
        })

    return chunks


def get_total_chunks() -> int:
    collection = get_collection()
    return collection.count()


def delete_doc_chunks(doc_id: str):
    """Delete all chunks belonging to a document."""
    collection = get_collection()
    # Get all chunks for this doc
    results = collection.get(where={"doc_id": doc_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])
    return len(results["ids"]) if results["ids"] else 0
