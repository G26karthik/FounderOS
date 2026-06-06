# FounderOS

**Voice-first AI Chief of Staff for solo founders.**

> *Hackathon submission for HiDevs "Dawn of the Autonomous AI Builder" — Theme: "One Man, An Entire System"*

FounderOS captures everything a founder says throughout their day via voice (Omi), routes it through specialized AI agents (Lyzr), stores it in semantic memory (Qdrant), and lets them query their entire decision and execution history conversationally.

---

## Architecture

```
┌──────────────┐       ┌───────────────────────────────────────────┐
│  Omi Device  │──────▶│           FastAPI Backend                 │
│  (Voice In)  │  POST │                                           │
└──────────────┘  /api │  ┌─────────────────────────────────────┐  │
                  /omi │  │    Lyzr Agent Pipeline (Parallel)    │  │
                 /hook │  │  ┌────────────┐ ┌──────────────┐    │  │
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
                                         │  REST API
                       ┌─────────────────┴──────────────────────┐
                       │        React Dashboard (Vite)          │
                       │  Voice Q&A │ Timeline │ Patterns │ Privacy │
                       └────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Voice Input | **Omi** | Captures founder speech via webhook |
| Agent Orchestration | **Lyzr** | 4 specialized AI agents for extraction |
| Vector Memory | **Qdrant** | Semantic storage & retrieval |
| Embeddings | **OpenAI** | text-embedding-3-small (1536d) |
| Backend | **FastAPI** | REST API, webhook handler |
| Frontend | **React + Tailwind** | Dashboard with voice Q&A |
| Guardrails | **EnkryptAI** | Optional PII/safety checks |

## Quick Start

### 1. Clone & Configure

```bash
cp .env.example .env
# Edit .env with your API keys:
# - LYZR_API_KEY (from https://studio.lyzr.ai)
# - OPENAI_API_KEY (for embeddings + agent LLM)
# - QDRANT_URL (default: http://localhost:6333)
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **Qdrant** on port 6333
- **Backend** on port 8000
- **Frontend** on port 5173

### 3. Manual Setup (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 4. Connect Omi (optional)

For local development, expose your backend via ngrok:

```bash
ngrok http 8000
```

Then register your webhook URL in the Omi developer portal:
- URL: `https://your-ngrok-url.ngrok.io/api/omi/webhook`
- Events: `conversation.completed`

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/omi/webhook` | Receive Omi conversation transcripts |
| POST | `/api/query` | Ask questions about your history |
| GET | `/api/timeline?type=all` | Browse entries chronologically |
| POST | `/api/digest?days=7` | Generate pattern insights |
| GET | `/api/collections` | View stored data stats |
| DELETE | `/api/collections/{name}` | Clear a collection |
| GET | `/api/health` | Health check |

## Demo Script

1. **Log a thought** (via dashboard or Omi):
   > "I've decided we're not building a mobile app. Going web-only to ship faster. 
   > I need to update the investor deck by Friday and email it out."

2. **Wait 5 seconds** for the pipeline to process

3. **Ask**: "What have I decided about our product scope?"
   > FounderOS returns the decision with context and date

4. **Ask**: "What tasks do I have pending?"
   > Shows the investor deck task

5. **Generate digest** to find patterns across entries

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── config.py        # Settings
│   │   ├── models.py        # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   └── services/        # Lyzr, Qdrant, embeddings
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main layout
│   │   ├── components/      # UI components
│   │   ├── hooks/           # React hooks
│   │   └── lib/             # API client
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## License

Built for HiDevs Hackathon — "Dawn of the Autonomous AI Builder"
