from fastapi import APIRouter, Depends
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ChatHistoryItem,
    ConversationSummary,
)
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


@router.get("/history/{conversation_id}", response_model=list[ChatHistoryItem])
async def get_conversation_messages(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return messages


@router.delete("/history/{conversation_id}")
async def delete_chat_history(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted_count = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .filter(ChatMessage.user_id == current_user.id)
        .delete()
    )

    db.commit()

    return {
        "message": "Chat history deleted successfully",
        "conversation_id": conversation_id,
        "deleted_count": deleted_count,
    }


@router.get("/conversations", response_model=list[ConversationSummary])
async def get_conversations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .all()
    )

    conversations = {}

    for message in messages:
        if message.conversation_id not in conversations:
            conversations[message.conversation_id] = {
                "conversation_id": message.conversation_id,
                "title": message.question,
                "created_at": message.created_at,
            }

    return list(conversations.values())
