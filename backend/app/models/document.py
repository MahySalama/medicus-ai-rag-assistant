from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(100), primary_key=True, index=True)

    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    page_count = Column(Integer, nullable=False)
    chunk_count = Column(Integer, nullable=False)
    size_bytes = Column(Integer, nullable=False)

    uploaded_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )