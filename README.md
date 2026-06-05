# 🩺 Medicus AI — Multi-Agent Medical RAG Assistant

A production-style Retrieval-Augmented Generation (RAG) application that allows users to upload medical PDF documents and ask questions grounded in their own documents.

Built to demonstrate modern AI engineering concepts including authentication, vector databases, document retrieval, conversation memory, multi-user isolation, LangGraph workflows, and containerized deployment.

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

## RAG Pipeline

### Ingestion Flow

PDF Upload
    ↓
Text Extraction
    ↓
Chunking
    ↓
Embeddings Generation
    ↓
ChromaDB Storage

### Retrieval Flow

User Question
    ↓
Vector Similarity Search
    ↓
Relevant Context Retrieval
    ↓
LLM Response Generation
    ↓
Grounded Answer with Citations

---

## Multi-Agent Workflow (LangGraph)

Medicus uses LangGraph to simulate a multi-agent AI architecture.

### Router Agent

Determines the user's intent:

* General Question
* Summary Request
* Risk Analysis Request

### Retrieval Agent

Retrieves the most relevant document chunks from ChromaDB.

### Analysis Agent

Performs specialized analysis based on request type:

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

## Docker Support

Fully containerized application:

* FastAPI Backend Container
* React Frontend Container
* PostgreSQL Container

Managed through Docker Compose.

---

# Architecture

Frontend (React + TailwindCSS)
            │
            ▼
      FastAPI Backend
            │
            ▼
    JWT Authentication
            │
            ▼
        PostgreSQL
    ├── Users
    ├── Documents
    └── Chat Messages
            │
            ▼
      PDF Processing
            │
            ▼
         Embeddings
            │
            ▼
    ChromaDB Vector Store
            │
            ▼
   LangGraph Multi-Agent Workflow
    ├── Router Agent
    ├── Retrieval Agent
    ├── Analysis Agent
    └── Safety Agent
            │
            ▼
        Ollama LLM
            │
            ▼
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

# Example Questions

* Summarize my uploaded document.
* What are the main risks discussed in this PDF?
* What symptoms are mentioned?
* What treatments are recommended?
* Compare the diseases covered in this guide.
* What precautions should be taken?

---

# Future Improvements

* Password Reset
* Email Verification
* Streaming Responses
* Document Viewer
* Additional LangGraph Agents
* Agent Tool Usage
* Cloud Deployment
* Kubernetes Deployment
* Advanced Citation Rendering

---

# Project Goals

This project was built to demonstrate:

* Retrieval-Augmented Generation (RAG)
* LLM Integration
* Multi-Agent AI Workflows
* Authentication & Authorization
* Database Design
* Vector Search
* Containerization
* Full-Stack Development
* Production-Style AI Application Architecture
