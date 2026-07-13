# Advoc AI Rag - Legal AI Assistant Frontend

## Setup

1. Install dependencies:
   npm install

2. Make sure your backend is running first:
   uvicorn app.main:app --reload
   (must be reachable at http://127.0.0.1:8000 — see src/api.js if it's elsewhere)

3. Start the dev server:
   npm run dev

4. Open http://localhost:5173

## What it does
- Left sidebar: drag-and-drop (or click) to upload a contract PDF. Each upload
  becomes a "case file" you can switch between.
- Right panel: chat interface scoped to whichever case file is selected.
  Page citations in answers get a highlighted underline.
- A banner appears at the bottom if the backend isn't reachable.

## Before deploying
In src/api.js, change API_BASE from http://127.0.0.1:8000 to your deployed
backend URL (e.g. your Render/Railway URL) before building for production.
