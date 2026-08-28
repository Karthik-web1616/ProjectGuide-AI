# 🎓 ProjectGuide-AI
### AI-Powered Academic Project Mentoring & Milestone Tracking Platform

ProjectGuide-AI is a comprehensive platform designed for academic institutions to guide engineering and computer science students from rough project ideas to final production delivery through AI-generated blueprints, milestone roadmaps, real-time voice mentorship, and live faculty reviews.

---

## 📁 Repository Architecture

This repository is organized into modular services so that frontend, backend, AI agent, and database engineers can work concurrently:

```bash
ProjectGuide-AI/
├── frontend/        # React (Vite) Single-Page Application (UI/UX)
├── backend/         # Backend REST/GraphQL API services (Node.js / Python / Go)
├── ai-agent/        # AI Mentorship engine, Prompt pipelines & LLM services
├── database/        # DB Schemas, Migrations & Seeds (SQL / NoSQL)
└── README.md        # Monorepo architecture & setup guide
```

---

## 🚀 Service Setup Guides

### 1. 🌐 Frontend (`/frontend`)
The frontend is built with **React (Vite)** featuring a sleek OLED dark theme with live state persistence.

```bash
cd frontend
npm install
npm run dev
```
> Runs by default on `http://localhost:5173`.
> See [frontend/README.md](./frontend/README.md) for page component details.

---

### 2. ⚙️ Backend (`/backend`)
Handles authentication, profile persistence, project submissions, and faculty actions.

- **API Specs**: See [backend/README.md](./backend/README.md) for full REST endpoint contracts (`/api/auth`, `/api/profile`, `/api/projects`, `/api/faculty`).
- **Recommended Stack**: Node.js (Express/NestJS) or Python (FastAPI).

---

### 3. 🤖 AI Agent & LLM Services (`/ai-agent`)
Handles dynamic blueprint generation, feasibility scoring (0–100%), milestone breakdown, and conversational mentor responses.

- **Integrations**: LangChain / OpenAI API / Ollama / Gemini API.
- **Workflow**: See [ai-agent/README.md](./ai-agent/README.md) for prompt templates and roadmap generation logic.

---

### 4. 🗄️ Database (`/database`)
Contains schema designs for users, student profiles, skills, project blueprints, milestones, and faculty feedback notes.

- **Schema Specs**: See [database/README.md](./database/README.md) for SQL DDL and NoSQL document schemas.

---

## 👥 Team Collaboration Guidelines

1. **Frontend Developers**: Work inside the `frontend/` directory. All API calls can be directed to `VITE_API_URL` or configured via `src/utils/store.js`.
2. **Backend Developers**: Implement endpoints according to [backend/README.md](./backend/README.md).
3. **AI / ML Engineers**: Build LLM pipelines in `ai-agent/` and connect them to the backend orchestrator.
4. **Database Admins**: Manage migrations and seeds in `database/`.

---

## 📄 License
Academic Capstone / Infosys Springboard Project — 2026.
