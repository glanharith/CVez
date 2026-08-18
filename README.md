# CVez — Automated AI CV Tailoring Application

> **CVez** is an application designed to automatically extract resume data from uploaded PDFs/DOCX files, tailor bullet points and keywords against a target job description using AI (Google Gemini / OpenAI / Anthropic), and generate clean, ATS-compliant PDF resumes.

---

## 🏗️ Project Architecture (Monorepo)

The repository is cleanly structured into two primary services:

```text
CVez/
├── backend/            # FastAPI Python backend (Extract, Tailor, Render, Cleanup)
│   ├── app/
│   │   ├── main.py     # API endpoints (/api/tailor-cv, /api/download, /api/health)
│   │   ├── services/   # Extraction, LLM tailoring & PDF rendering logic
│   │   └── templates/  # Jinja2 ATS HTML template
│   ├── .env.example    # Environment variable template
│   ├── requirements.txt
│   └── run.py          # Development launcher
│
├── frontend/           # React + Vite + Tailwind CSS frontend UI
│   ├── src/
│   │   ├── components/ # Header, FileUpload, JobDescriptionInput, ResultViewer
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore          # Root security & build artifact rules
└── README.md           # Project documentation
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend Server
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # (Configure your GEMINI_API_KEY / OPENAI_API_KEY)
python run.py
```
*Backend runs at `http://localhost:8000`*

### 2. Start the Frontend Application
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🛡️ Security & Privacy
- **Stateless Storage**: Uploaded CVs and generated PDFs are automatically cleaned up from local disk post-download.
- **Environment Variables**: `.env` files and API keys are strictly excluded via `.gitignore`.

---

## 📜 Documentation Links
- 📘 [Backend Documentation](file:///Users/glanharith/Documents/CVez/backend/README.md)
- 🎨 [Frontend Documentation](file:///Users/glanharith/Documents/CVez/frontend/README.md)
