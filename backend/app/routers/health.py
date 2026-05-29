from fastapi import APIRouter
from app.models.schemas import StatsResponse, HealthResponse, DocumentInfo
from app.services.chat_service import check_ollama_status
from app.services.vector_store import get_total_chunks
from app.services.pdf_service import get_all_documents, get_total_size

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check system health."""
    ollama_ok, model_info = check_ollama_status()
    chunks = get_total_chunks()

    return HealthResponse(
        status="healthy" if ollama_ok else "degraded",
        ollama_connected=ollama_ok,
        model_loaded=model_info,
        vector_store_ready=True,
    )


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get system statistics."""
    ollama_ok, model_info = check_ollama_status()
    docs = get_all_documents()
    total_chunks = get_total_chunks()
    total_size = get_total_size()

    return StatsResponse(
        total_documents=len(docs),
        total_chunks=total_chunks,
        total_size_bytes=total_size,
        ollama_status="connected" if ollama_ok else "disconnected",
        model_name=model_info,
        documents=[DocumentInfo(**doc) for doc in docs],
    )
