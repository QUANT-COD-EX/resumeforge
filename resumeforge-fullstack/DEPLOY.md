# ResumeForge — Vercel Deployment Guide

## Architecture on Vercel

```
Vercel Project (resumeforge-fullstack/)
├── client/dist/          ← Static React SPA (served by Vercel CDN)
├── api/                  ← Node.js Serverless Functions
│   ├── ai-feedback.js    → POST /api/ai-feedback
│   ├── improve-line.js   → POST /api/improve-line
│   ├── tailor-resume.js  → POST /api/tailor-resume
│   ├── export-docx.js    → POST /api/export-docx
│   └── py/               ← Python Serverless Functions
│       ├── feedback.py   → POST /api/py/feedback
│       ├── improve-line.py
│       ├── tailor-resume.py
│       └── export-docx.py
```

> No database. Resume data stays in the user's browser (`localStorage`).
> Users download their resume as PDF or DOCX — nothing is stored server-side.

## Step 1: Deploy to Vercel

### Option A — Vercel CLI (Recommended)

```bash
npm install -g vercel
cd resumeforge-fullstack
vercel login
vercel
```

Follow prompts:
- Project name: `resumeforge`
- Framework: **Other**
- Root directory: `.` (current folder)

### Option B — Vercel Dashboard

1. Push `resumeforge-fullstack/` to GitHub.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Set **Root Directory** to `resumeforge-fullstack`.
5. Build settings are auto-detected from `vercel.json`.

## Step 2: Set Environment Variables on Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key (from [console.groq.com](https://console.groq.com)) |
| `GEMINI_API_KEY` | Your Gemini API key (from [aistudio.google.com](https://aistudio.google.com)) |
| `PYTHON_SERVICE_URL` | *(leave empty — Python runs as serverless on Vercel)* |

> **After adding env vars**, redeploy: `vercel --prod`

## Step 3: Verify

| Endpoint | Expected |
|---|---|
| `POST /api/ai-feedback` | AI score + feedback JSON |
| `POST /api/improve-line` | `{ improvedBullet }` |
| `POST /api/tailor-resume` | Match score + tailored summary |
| `POST /api/export-docx` | `.docx` file download |
| `POST /api/py/feedback` | Same via Python runtime |

## Local Development (unchanged)

```bash
# Terminal 1 — Frontend + API proxy to localhost:5000
cd client && npm install && npm run dev

# Terminal 2 — Node.js server
cd server-node && node server.js

# Terminal 3 — Python AI (optional)
cd server-python && pip install -r requirements.txt && uvicorn app:app --port 8000
```
