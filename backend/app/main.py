import os
import uuid
import logging
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import TailorResponse, TailoredCV
from app.services.extractor import extract_cv_text
from app.services.llm_service import generate_tailored_cv
from app.services.pdf_generator import generate_pdf

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cvez")

app = FastAPI(
    title=settings.APP_NAME,
    description="Automated CV Tailoring Backend (Local Dev Version)",
    version="1.0.0"
)

# CORS setup for Vite frontend (localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mapping to track file paths for cleanup after download
file_registry = {}

def cleanup_files(upload_path: Path, output_path: Path, file_id: str):
    """Background task to remove temporary upload and output files after download."""
    try:
        if upload_path.exists():
            upload_path.unlink()
            logger.info(f"Cleaned up upload file: {upload_path}")
        if output_path.exists():
            output_path.unlink()
            logger.info(f"Cleaned up generated output file: {output_path}")
        file_registry.pop(file_id, None)
    except Exception as e:
        logger.error(f"Error during background file cleanup for {file_id}: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "openai_key_configured": bool(settings.OPENAI_API_KEY),
        "anthropic_key_configured": bool(settings.ANTHROPIC_API_KEY),
        "gemini_key_configured": bool(settings.GEMINI_API_KEY),
        "active_temp_files": len(file_registry)
    }

@app.post("/api/tailor-cv", response_model=TailorResponse)
async def tailor_cv(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    provider: str = Form(default="openai"),
    custom_instructions: str = Form(default="")
):
    # 1. Input Validation
    if not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Validate file size
    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    file_id = str(uuid.uuid4())
    upload_filename = f"{file_id}_{file.filename}"
    upload_path = settings.TEMP_UPLOADS_DIR / upload_filename

    # 2. Save upload temporarily
    try:
        with open(upload_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"Saved uploaded CV to {upload_path}")
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file locally.")

    # 3. Extract text
    try:
        extracted_text = extract_cv_text(upload_path)
        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract readable text from the uploaded CV file."
            )
    except Exception as e:
        # Cleanup upload file if extraction fails
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))

    # 4. Generate Tailored CV via LLM
    try:
        tailored_cv = generate_tailored_cv(
            cv_text=extracted_text,
            job_description=job_description,
            provider=provider,
            custom_instructions=custom_instructions
        )
    except Exception as e:
        logger.error(f"LLM tailoring failed: {e}")
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")

    # 5. Render ATS PDF
    output_filename = f"{file_id}_tailored.pdf"
    try:
        output_path = generate_pdf(tailored_cv, output_filename)
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(status_code=500, detail=f"PDF rendering failed: {str(e)}")

    # Register paths for post-download cleanup
    file_registry[file_id] = {
        "upload_path": upload_path,
        "output_path": output_path,
        "candidate_name": tailored_cv.contact.full_name
    }

    return TailorResponse(
        status="success",
        file_id=file_id,
        download_url=f"/api/download/{file_id}",
        tailored_cv=tailored_cv
    )

@app.get("/api/download/{file_id}")
async def download_tailored_cv(file_id: str, background_tasks: BackgroundTasks):
    if file_id not in file_registry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested file not found or has already been downloaded and cleaned up."
        )

    file_info = file_registry[file_id]
    output_path = file_info["output_path"]
    upload_path = file_info["upload_path"]

    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Generated file missing.")

    candidate_name = file_info.get("candidate_name", "Tailored").replace(" ", "_")
    download_filename = f"{candidate_name}_Tailored_CV.pdf"

    # Read PDF content into memory to ensure full delivery before file deletion
    pdf_bytes = output_path.read_bytes()

    # Perform cleanup of temporary upload and output files
    cleanup_files(upload_path, output_path, file_id)

    from fastapi.responses import Response
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{download_filename}"'}
    )

