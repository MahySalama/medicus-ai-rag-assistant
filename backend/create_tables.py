from app.database import engine, Base

from app.models.user import User
from app.models.document import Document

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")