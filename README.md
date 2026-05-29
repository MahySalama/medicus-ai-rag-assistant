# 🩺 Medicus — AI Medical Assistant

A full-stack RAG-powered medical assistant with a FastAPI backend and React frontend.
Uses **Ollama** (100% free, local LLM) to answer questions from your uploaded PDFs.

---

## Architecture

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Dashboard │  │  Medicus Chatbot │ │
│  └──────────┘  └──────────────────┘ │
└──────────────┬──────────────────────┘
               │ REST API
┌──────────────▼──────────────────────┐
│         FastAPI Backend             │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ PDF Ingest│  │  RAG Pipeline    │ │
│  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ ChromaDB │  │  Ollama LLM      │ │
│  │ (Vectors)│  │  (Local, Free)   │ │
│  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────┘
```

## Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **Ollama** — Install from https://ollama.com
   ```bash
   # After installing Ollama, pull a model:
   ollama pull llama3.2
   # Also pull an embedding model:
   ollama pull nomic-embed-text
   ```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. **Upload PDFs** via the Dashboard upload panel
2. **Ask questions** in the Medicus chat — answers are grounded in your documents
3. **View stats** on the Dashboard (documents loaded, chunks indexed, etc.)

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| LLM         | Ollama (llama3.2, mistral, etc.)    |
| Embeddings  | Ollama nomic-embed-text             |
| Vector DB   | ChromaDB (local, no setup needed)   |
| Backend     | FastAPI + LangChain                 |
| Frontend    | React + Vite + TailwindCSS         |
