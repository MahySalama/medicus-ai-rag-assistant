# 🩺 Medicus AI — Multi-Agent Medical RAG Assistant

A production-style Retrieval-Augmented Generation (RAG) application that allows users to upload medical PDF documents and ask questions grounded in their own documents.

This project was built to demonstrate modern AI engineering concepts including authentication, vector databases, document retrieval, conversation memory, multi-user data isolation, LangGraph workflows, Docker containerization, and cloud deployment.

---

# Deployment

### Frontend

https://medicus-ai-rag-assistant.vercel.app

### Backend API

https://medicus-backend-oilo.onrender.com

### Swagger Documentation

https://medicus-backend-oilo.onrender.com/docs

---

# Features

## Authentication & Security

* User Registration
* User Login
* JWT Authentication
* Protected API Routes
* Frontend Route Protection
* Session Validation
* Password Hashing with bcrypt

---

## Document Management

* PDF Upload
* PDF Text Extraction
* Automatic Chunking
* Document Metadata Storage
* User-Specific Document Ownership
* Multi-User Isolation

Each uploaded document is linked to its owner.

User A cannot access User B's documents.

---

## Retrieval-Augmented Generation (RAG)

### Ingestion Pipeline

PDF Upload
↓
Text Extraction
↓
Chunking
↓
Embeddings Generation
↓
ChromaDB Storage

### Retrieval Pipeline

User Question
↓
Vector Similarity Search
↓
Relevant Context Retrieval
↓
LLM Response Generation
↓
Grounded Answer

---

## Multi-Agent Workflow (LangGraph)

Medicus uses LangGraph to orchestrate a multi-agent workflow.

### Router Agent

Determines the user's intent:

* General Question
* Summary Request
* Risk Analysis Request

### Retrieval Agent

Retrieves relevant document chunks from ChromaDB.

### Analysis Agent

Performs specialized analysis:

* Summarization
* Risk Analysis
* General Document Understanding

### Safety Agent

Applies safety checks before generating the final response.

---

## Conversation Memory

* Persistent Chat History
* Conversation Threads
* Sidebar Conversation Management
* Conversation Deletion
* First-Message Conversation Titles

Chat history is stored in PostgreSQL and survives application restarts.

---

## Multi-User Data Isolation

The system enforces user-level ownership across:

* Documents
* Chat History
* Retrieval Operations

Document metadata includes user ownership information, ensuring retrieval is restricted to the authenticated user.

---

## Docker Support

Fully containerized architecture:

* FastAPI Backend Container
* React Frontend Container
* PostgreSQL Container

Managed through Docker Compose.

---

# Architecture

Frontend (React + TailwindCSS)
↓
FastAPI Backend
↓
JWT Authentication
↓
PostgreSQL
├── Users
├── Documents
└── Chat Messages
↓
PDF Processing
↓
Embeddings
↓
ChromaDB Vector Store
↓
LangGraph Workflow
├── Router Agent
├── Retrieval Agent
├── Analysis Agent
└── Safety Agent
↓
Ollama (llama3.2)
↓
Grounded Response

---

# Tech Stack

| Layer           | Technology        |
| --------------- | ----------------- |
| Frontend        | React             |
| Styling         | TailwindCSS       |
| Backend         | FastAPI           |
| Authentication  | JWT + bcrypt      |
| Database        | PostgreSQL        |
| ORM             | SQLAlchemy        |
| Vector Database | ChromaDB          |
| LLM             | Ollama (llama3.2) |
| Embeddings      | nomic-embed-text  |
| AI Workflow     | LangGraph         |
| Containers      | Docker            |
| Orchestration   | Docker Compose    |
| Deployment      | Render + Vercel   |

---

# Project Structure

backend/
├── app/
│   ├── models/
│   ├── routers/
│   ├── services/
│   │   ├── chat_service.py
│   │   ├── vector_store.py
│   │   ├── agent_graph.py
│   │   └── rag_utils.py
│   ├── utils/
│   ├── database.py
│   └── main.py
│
├── uploads/
├── chroma_db/
└── requirements.txt

frontend/
├── src/
├── components/
├── services/
└── App.jsx

---

# Running Locally

## Prerequisites

* Python 3.11+
* Node.js 20+
* Docker Desktop
* Ollama

Install required models:

ollama pull llama3.2
ollama pull nomic-embed-text

---

## Run with Docker

docker compose up --build

Frontend:

http://localhost:5173

Backend API:

http://localhost:8000

Swagger Documentation:

http://localhost:8000/docs

---

# Production Status

## Currently Available in Production

* Frontend Deployment (Vercel)
* Backend Deployment (Render)
* PostgreSQL Database (Render)
* User Registration
* User Login
* JWT Authentication
* Protected Routes
* Session Validation
* Chat History Persistence
* Conversation Management
* Multi-User Data Isolation

## Local Development Features

The complete Retrieval-Augmented Generation (RAG) workflow currently runs in local development using Ollama.

This includes:

* Embedding Generation
* Vector Similarity Search
* Document Retrieval
* LLM Response Generation

The deployed application demonstrates the full-stack architecture, authentication system, database integration, and cloud deployment configuration.

---

# Project Goals

This project was built to demonstrate:

* Retrieval-Augmented Generation (RAG)
* Large Language Model Integration
* Multi-Agent Workflows with LangGraph
* Authentication and Authorization
* User-Specific Data Isolation
* Vector Database Integration
* PostgreSQL Database Design
* REST API Development with FastAPI
* Frontend Development with React
* Docker Containerization
* Full-Stack Application Architecture
* Cloud Deployment
