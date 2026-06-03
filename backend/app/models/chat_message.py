from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime, timezone

from app.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(String(100), nullable=False, index=True)

    # We use Text instead of String because answers can be long.
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )