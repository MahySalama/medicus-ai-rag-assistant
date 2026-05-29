from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_service import chat

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to Medicus and get a RAG-powered response."""
    result = chat(
        question=request.question,
        conversation_id=request.conversation_id,
    )
    return ChatResponse(**result)
