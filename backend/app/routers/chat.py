from fastapi import APIRouter, Depends
from app.models.schemas import ChatRequest, ChatResponse, ChatHistoryItem
from app.services.chat_service import chat
from app.utils.auth_dependency import get_current_user

from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat_message import ChatMessage

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to Medicus and get a RAG-powered response."""
    result = chat(
        question=request.question,
        user_id=current_user.id,
        conversation_id=request.conversation_id,
        db=db,
    )
    return ChatResponse(**result)


@router.get("/history", response_model=list[ChatHistoryItem])
async def get_chat_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .all()
    )
    return history
