# FounderOS — AI Chief of Staff

**Voice-first execution partner and semantic memory hub for solo founders.**

> **Hackathon Submission** for HiDevs *"Dawn of the Autonomous AI Builder"*  
> **Theme**: *"One Man, An Entire System"* — A voice-first digital workspace converting spoken thoughts into structured decisions, tasks, and pattern insights.

### 🌐 Live Production Links
- **Frontend App (Vercel)**: [https://founder-os-pi-lemon.vercel.app/](https://founder-os-pi-lemon.vercel.app/)
- **Backend Service (Render)**: [https://founderos-backend-uuuv.onrender.com/](https://founderos-backend-uuuv.onrender.com/)

FounderOS captures everything a founder says via voice (integrated with **Omi**), processes transcripts through specialized AI agents (**Lyzr**), stores them in a cloud semantic memory (**Qdrant**), and lets them query their execution history conversationally.

---

## 📸 Dashboard Preview

FounderOS features a dark-mode dashboard tailored for visual excellence and high performance, featuring:
- **Voice Q&A**: Web Speech API voice capture + text-based semantic retrieval.
- **Activity Timeline**: Filterable feed of Decisions, Tasks, and Ideas with direct status toggles.
- **Pattern Insights**: Staggered, synthesized breakdowns of recurring themes and work blockages.
- **Privacy Controls**: Complete control over your semantic database, including granular memory resetting.

---

## 🏗️ Architecture

```
 ┌──────────────┐       ┌───────────────────────────────────────────┐
 │  Omi Device  │──────▶│           FastAPI Backend                 │
 │  (Voice In)  │  POST │                                           │
 │  /api/omi/   │  /api │  ┌─────────────────────────────────────┐  │
 │  webhook     │  /omi │  │    Lyzr Agent Pipeline (Parallel)    │  │
 └──────────────┘  /hook │  │  ┌────────────┐ ┌──────────────┐    │  │
                         │  │  │  Decision   │ │    Task      │    │  │
                         │  │  │  Extractor  │ │  Extractor   │    │  │
                         │  │  └─────┬──────┘ └──────┬───────┘    │  │
                         │  │  ┌─────┴──────┐        │            │  │
                         │  │  │    Idea     │        │            │  │
                         │  │  │  Extractor  │        │            │  │
                         │  │  └─────┬──────┘        │            │  │
                         │  └────────┼───────────────┼────────────┘  │
                         │           ▼               ▼               │
                         │  ┌─────────────────────────────────────┐  │
                         │  │      Qdrant Vector Database          │  │
                         │  │  decisions│tasks│ideas│patterns      │  │
                         │  └─────────────────────────────────────┘  │
                         └───────────────────────────────────────────┘
                                           ▲
                                           │  REST API (with CORS)
                         ┌─────────────────┴──────────────────────┐
                         │        React Dashboard (Vite)          │
                         │  Voice Q&A │ Timeline │ Patterns │ Privacy │
                         └────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Voice Capture** | **Omi** | Captures conversational audio & streams completion webhook |
| **Agent Orchestration** | **Lyzr Core API** | Orchestrates 4 parallel agents extracting insights from transcripts |
| **Vector Memory** | **Qdrant Cloud** | High-performance semantic vector search and metadata retrieval |
| **Embeddings** | **OpenAI** | Generates 1536-dimensional embeddings (`text-embedding-3-small`) |
| **Backend API** | **FastAPI** | REST API routing, webhook parsing, and CORS control |
| **Frontend UI** | **React (v19) + Vite** | SPA with responsive typography, dark theme, and SVG micro-interactions |
| **Guardrails** | **Enkrypt AI** | Inspects outputs for PII and alignment safety |

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root containing your secret keys. Both local runs and production web hosts rely on these values:

```env
# ── LYZR AGENTS CONFIG ────────────────────────────────────────────────────────
LYZR_API_KEY=your_lyzr_api_key

# ── OPENAI CONFIG ─────────────────────────────────────────────────────────────
OPENAI_API_KEY=your_openai_api_key

# ── QDRANT VECTOR STORAGE CONFIG ──────────────────────────────────────────────
# Local development default: http://localhost:6333
# Production cloud cluster: https://<cluster-id>.<region>.aws.cloud.qdrant.io
QDRANT_URL=https://your-qdrant-cluster-url.aws.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# ── ENKRYPT AI INTEGRATION (OPTIONAL) ─────────────────────────────────────────
ENKRYPT_API_KEY=your_enkrypt_api_key

# ── BACKEND SECURITY ──────────────────────────────────────────────────────────
# Comma-separated list of allowed CORS origins
CORS_ORIGINS=http://localhost:5173,https://founder-os-pi-lemon.vercel.app
```

---

## 💻 Local Development

### 1. Run via Docker Compose (Easiest)

Build and run all services (Qdrant, Backend, and Frontend) in background containers:
```bash
docker-compose up -d --build
```
- Frontend: `http://localhost:5173`
- Backend Docs: `http://localhost:8000/docs`
- Qdrant Dashboard: `http://localhost:6333/dashboard`

### 2. Manual Development Run

If you wish to run the processes natively:

#### Start the FastAPI Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Start the Vite React Frontend
Open a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 🚀 Production Deployment Guide

Follow these steps to deploy FounderOS to cloud environments.

### 1. Backend Web Service (Render)

Render is ideal for hosting the FastAPI backend web service.

1. **Create Web Service**: Link your GitHub repository in Render and create a new **Web Service**.
2. **Configure Base Directory**: Set the root directory of the build to `backend`.
3. **Build & Start Commands**:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     *(If deploying from the root workspace, configure the build command as `pip install -r backend/requirements.txt` and start command as `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`)*
4. **Environment Variables**: Add all environment variables listed in the configuration section (e.g. `LYZR_API_KEY`, `OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, and `CORS_ORIGINS`). Make sure `CORS_ORIGINS` includes your production Vercel frontend URL.
5. **Verify Endpoint**: Check Render's health endpoint: `https://your-service.onrender.com/api/health`.

### 2. Frontend SPA (Vercel)

Vercel is perfect for serving the Vite React frontend.

1. **Create Project**: Import your GitHub repository in Vercel.
2. **Configure Folder**: Set the **Root Directory** of the project to `frontend`.
3. **Build & Output settings**: Vercel automatically detects the Vite template.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Add the following variable to configure routing:
   - `VITE_API_URL`: Set to your production Render URL (e.g., `https://founderos-backend-uuuv.onrender.com`).
5. **SPA Redirect Routing**: Vercel utilizes the local [vercel.json](file:///c:/Users/saita/OneDrive/Desktop/AI%20Everyday/Voice%20AI%20Cheif%20Staff/frontend/vercel.json) configuration inside the `frontend` folder to rewrite all client paths to `index.html`, ensuring clean browser history navigation.

---

## 🎙️ Hooking Up Omi Device (Voice webhook)

For real-time voice logging via the Omi audio device:

1. **Expose Localhost (Development)**: Expose your local backend using `ngrok`:
   ```bash
   ngrok http 8000
   ```
2. **Register URL (Developer Portal)**: In the Omi developer dashboard, register your webhook endpoint:
   - Webhook URL: `https://your-subdomain.ngrok-free.app/api/omi/webhook` (or your production Render url: `https://your-backend.onrender.com/api/omi/webhook`)
   - Subscribe Events: `conversation.completed`
3. **Action Flow**: When you speak and finish a conversation, Omi sends the audio transcript to the webhook. FounderOS extracts decisions/tasks/ideas in the background, updating your dashboard timeline automatically.

---

## 📖 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/omi/webhook` | Receives Omi transcripts, runs parallel agents, and saves results to Qdrant |
| **POST** | `/api/query` | Queries semantic memory with voice/text inputs |
| **GET** | `/api/timeline` | Browses all Decisions, Tasks, Ideas, and Patterns with filters |
| **POST** | `/api/digest` | Generates weekly pattern digest analysis of recent logs |
| **GET** | `/api/collections` | Counts entries across all active Qdrant databases |
| **PUT** | `/api/entries/{collection}/{id}` | Updates metadata of a specific entry (e.g. task done status) |
| **DELETE** | `/api/entries/{collection}/{id}` | Deletes a specific entry from Qdrant memory |
| **DELETE** | `/api/collections/{name}` | Clears all points in a collection (Resets database) |
| **GET** | `/api/health` | Service health status check |

---

## ⚖️ License

Developed for the HiDevs "Dawn of the Autonomous AI Builder" Hackathon.
All rights reserved.
