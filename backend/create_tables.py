from app.database import engine, Base

from app.models.user import User
from app.models.document import Document
from app.models.chat_message import ChatMessage

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")