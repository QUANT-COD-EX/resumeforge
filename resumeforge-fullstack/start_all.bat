@echo off
echo ===================================================
echo   Starting ResumeForge Full-Stack Environment
echo ===================================================

start "ResumeForge - Python AI Service (Port 8000)" cmd /k "cd server-python && pip install -r requirements.txt && uvicorn app:app --host 127.0.0.1 --port 8000 --reload"
start "ResumeForge - Node + SQLite API (Port 5000)" cmd /k "cd server-node && npm install && npm start"
start "ResumeForge - React Frontend (Port 5173)" cmd /k "cd client && npm install && npm run dev"

echo All 3 services are launching in separate windows!
