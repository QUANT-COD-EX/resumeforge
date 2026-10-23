# ResumeForge Full-Stack (React.js + CSS3 + Node.js + SQLite + Python AI)

## Architecture
1. **`client/` (Port 5173):** React 18 (JSX) + Pure CSS3 A4 Workspace, 6-step wizard, 4 live templates (`Modern`, `Classic`, `Minimal`, `Creative`), PDF & DOCX export.
2. **`server-node/` (Port 5000):** Express.js REST gateway + `sqlite3` database (`db/resumeforge.sqlite`) for shareable resume links (`/api/share-resume` & `/api/load-resume/:id`).
3. **`server-python/` (Port 8000):** FastAPI AI microservice with automatic Primary (`Groq Llama 3.3 70B`) to Fallback (`Google Gemini 2.5 Flash`) routing and `python-docx` generation.

## Quick Start
1. Copy `.env.example` to `.env` in the root folder and add your `GROQ_API_KEY` and `GEMINI_API_KEY`.
2. Run `start_all.bat` (Windows) or `bash start_all.sh` (macOS/Linux), or start each folder manually.
md)
