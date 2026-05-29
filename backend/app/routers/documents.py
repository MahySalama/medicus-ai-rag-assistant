import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.services.pdf_service import process_pdf, get_all_documents, delete_document
from app.models.schemas import DocumentInfo

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF document."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Check file size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        doc_info = process_pdf(file_path, file.filename)
        return DocumentInfo(**doc_info)
    except Exception as e:
        # Clean up on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[DocumentInfo])
async def list_documents():
    """List all uploaded documents."""
    docs = get_all_documents()
    return [DocumentInfo(**doc) for doc in docs]


@router.delete("/{doc_id}")
async def remove_document(doc_id: str):
    """Delete a document and its chunks."""
    success = delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "deleted", "doc_id": doc_id}
