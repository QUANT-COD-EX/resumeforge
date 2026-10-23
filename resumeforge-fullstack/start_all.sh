#!/usr/bin/env bash
set -e
echo "==================================================="
echo "  Starting ResumeForge Full-Stack Environment"
echo "==================================================="

(cd server-python && pip install -r requirements.txt && uvicorn app:app --host 127.0.0.1 --port 8000 --reload) &
(cd server-node && npm install && npm start) &
(cd client && npm install && npm run dev) &

wait
