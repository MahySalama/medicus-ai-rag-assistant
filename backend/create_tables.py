from app.database import engine
from app.models.user import User
from app.database import Base

Base.metadata.create_all(bind=engine)

print("Users table created successfully!")