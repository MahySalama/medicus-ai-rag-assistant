from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    conversation_id: str


class DocumentInfo(BaseModel):
    id: str
    filename: str
    page_count: int
    chunk_count: int
    uploaded_at: str
    size_bytes: int


class StatsResponse(BaseModel):
    total_documents: int
    total_chunks: int
    total_size_bytes: int
    ollama_status: str
    model_name: str
    documents: list[DocumentInfo]


class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
    model_loaded: str
    vector_store_ready: bool
