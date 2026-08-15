# CVez — Backend API (FastAPI)

FastAPI backend service for automated CV text extraction, AI resume tailoring using LLM models (Google Gemini / OpenAI / Anthropic), Jinja2 HTML-to-PDF rendering, and background file cleanup.

## 🚀 Features
- **File Ingestion**: Supports `.pdf` and `.docx` uploads with MIME & 10MB file size validation.
- **AI Tailoring**: Flexible integration with Google Gemini (`gemini-3.6-flash`), OpenAI (`gpt-4o-mini`), and Anthropic (`claude-3-5-sonnet`).
- **Automatic Mock Mode**: Falls back gracefully to local simulation if no API keys are configured.
- **ATS PDF Generation**: Renders Jinja2 HTML templates into ATS-compliant PDFs using WeasyPrint (with ReportLab fallback).
- **Auto Cleanup**: Deletes temporary uploads and generated PDF outputs post-download.

## ⚙️ Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   Copy `.env.example` to `.env` and set your API key:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini / OpenAI / Anthropic API Key in `.env`:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   DEFAULT_LLM_PROVIDER="gemini"
   DEFAULT_MODEL_NAME="gemini-3.6-flash"
   ```

5. Run the FastAPI dev server:
   ```bash
   python run.py
   ```
   Server will start at **`http://localhost:8000`**.

## 📑 API Endpoints
- `GET /api/health`: Health check and status of configured LLM providers.
- `POST /api/tailor-cv`: Multipart form upload (`file`, `job_description`, `provider`, `custom_instructions`). Returns tailored CV JSON and PDF download URL.
- `GET /api/download/{file_id}`: Streams the generated PDF and performs post-download local file cleanup.
