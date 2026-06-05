import uuid
from ollama import Client
from app.config import settings
from app.services.vector_store import query_similar

from sqlalchemy.orm import Session
from app.models.chat_message import ChatMessage

ollama_client = Client(host=settings.OLLAMA_BASE_URL)

# Simple in-memory conversation store
conversations: dict[str, list[dict]] = {}

SYSTEM_PROMPT = """You are Medicus, an AI medical knowledge assistant. You answer questions based ONLY on the provided document context. Follow these rules strictly:

1. Answer the user's question using ONLY the information in the CONTEXT below.
2. If the context doesn't contain enough information, say "I don't have enough information in the uploaded documents to answer that."
3. Always cite which document and page number your answer comes from.
4. Be precise, helpful, and professional.
5. If the question is about a medical topic, remind the user to consult a healthcare professional for personal medical advice.
6. Format your answers clearly with bullet points or numbered lists when appropriate.

CONTEXT:
{context}
"""


def build_context(chunks: list[dict]) -> str:
    """Build context string from retrieved chunks."""
    if not chunks:
        return "No relevant documents found."

    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        meta = chunk["metadata"]
        source = f"[Source: {meta.get('filename', 'Unknown')} | Page {meta.get('page', '?')}]"
        context_parts.append(f"--- Chunk {i} {source} ---\n{chunk['text']}")

    return "\n\n".join(context_parts)


def chat(
    question: str,
    user_id: int,
    conversation_id: str | None = None,
    db: Session | None = None,
) -> dict:
    """Process a chat question through the RAG pipeline."""

    # Get or create conversation
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
    if conversation_id not in conversations:
        conversations[conversation_id] = []

    # Step 1: Retrieve relevant chunks
    relevant_chunks = query_similar(question, user_id=user_id, n_results=5)

    # Step 2: Build context
    context = build_context(relevant_chunks)

    # Step 3: Build messages for Ollama
    system_message = SYSTEM_PROMPT.format(context=context)

    messages = [{"role": "system", "content": system_message}]

    # Add conversation history (last 6 messages for context window management)
    history = conversations[conversation_id][-6:]
    messages.extend(history)

    # Add current question
    messages.append({"role": "user", "content": question})

    # Step 4: Query Ollama
    try:
        response = ollama_client.chat(
            model=settings.OLLAMA_MODEL,
            messages=messages,
        )
        answer = response["message"]["content"]
    except Exception as e:
        answer = f"Error communicating with Ollama: {str(e)}. Make sure Ollama is running with `ollama serve` and the model '{settings.OLLAMA_MODEL}' is pulled."

    # Step 5: Store in conversation history
    conversations[conversation_id].append({"role": "user", "content": question})
    conversations[conversation_id].append({"role": "assistant", "content": answer})

    if db:
        chat_message = ChatMessage(
            user_id=user_id,
            conversation_id=conversation_id,
            question=question,
            answer=answer,
        )

        db.add(chat_message)
        db.commit()

    # Step 6: Build sources
    sources = []
    seen = set()
    for chunk in relevant_chunks:
        meta = chunk["metadata"]
        key = f"{meta.get('filename')}_{meta.get('page')}"
        if key not in seen:
            seen.add(key)
            sources.append({
                "filename": meta.get("filename", "Unknown"),
                "page": meta.get("page", 0),
                "relevance": round(1 - chunk.get("distance", 0), 3),
            })

    return {
        "answer": answer,
        "sources": sources,
        "conversation_id": conversation_id,
    }


def check_ollama_status() -> tuple[bool, str]:
    """Check if Ollama is running and model is available."""
    try:
        models = ollama_client.list()

        model_names = []

        if hasattr(models, "models"):
            for model in models.models:
                if hasattr(model, "model"):
                    model_names.append(model.model)
                elif isinstance(model, dict) and "model" in model:
                    model_names.append(model["model"])
                elif isinstance(model, dict) and "name" in model:
                    model_names.append(model["name"])

        elif isinstance(models, dict) and "models" in models:
            for model in models["models"]:
                if isinstance(model, dict) and "model" in model:
                    model_names.append(model["model"])
                elif isinstance(model, dict) and "name" in model:
                    model_names.append(model["name"])

        if any(settings.OLLAMA_MODEL in name for name in model_names):
            return True, settings.OLLAMA_MODEL

        return True, f"Connected but '{settings.OLLAMA_MODEL}' not found. Available: {model_names}"

    except Exception as e:
        return False, f"Ollama not reachable: {str(e)}"