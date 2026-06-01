from fastapi import APIRouter, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_service import chat
from app.utils.auth_dependency import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def send_message(request: ChatRequest, current_user=Depends(get_current_user)):
    """Send a message to Medicus and get a RAG-powered response."""
    result = chat(
        question=request.question,
        user_id=current_user.id,
        conversation_id=request.conversation_id,
    )
    return ChatResponse(**result)
