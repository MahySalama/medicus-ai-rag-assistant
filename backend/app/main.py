from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, documents, health, auth

from app.database import Base, engine
from app.models.user import User
from app.models.document import Document
from app.models.chat_message import ChatMessage

app = FastAPI(
    title="Medicus API",
    description="RAG-powered medical assistant API using Ollama + ChromaDB",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://medicus-ai-rag-assistant.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "name": "Medicus API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
