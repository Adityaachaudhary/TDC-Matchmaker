# TDC Matchmaker Dashboard

Internal CRM for The Date Crew matchmakers — built with React + TypeScript + Node.js.

---
## Live link
https://tdc-matchmaker-r3j6-gklyjds68.vercel.app/


## Quick Start

### Backend
```bash
cd backend
npm install
# Create .env from .env.example
# Add your GROQ_API_KEY (get free at console.groq.com)
node server.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Login Credentials

| Name          | Email                        | Password  |
|---------------|------------------------------|-----------|
| Priya Kapoor  | priya@thedatecrew.com        | tdc@1234  |
| Rahul Mehra   | rahul@thedatecrew.com        | tdc@5678  |

---

## Tech Stack & Architecture

This application is built with a modern JavaScript stack optimized for rapid development and clean UI:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State Management**: Zustand with persist middleware for auth persistence
- **Data Fetching**: TanStack Query for caching and server state
- **UI Components**: Lucide React icons, custom Tailwind utilities
- **Backend**: Express.js with JWT authentication
- **AI Integration**: Groq SDK (Llama-3.3-70b-versatile model)

---

## Matching Logic

The matchmaking engine uses gender-specific weighted scoring (0-100):

**Male clients** are matched with women using traditional preferences:
- Age difference (candidate younger, ideal 1-5 years)
- Income compatibility (client earns more for financial stability)
- Height (candidate shorter)
- Kids preference alignment
- Shared languages, diet compatibility
- Religion and caste matching

**Female clients** are matched with men using compatibility-first metrics:
- Education parity (same degree level preferred)
- Relocation compatibility (both open or both prefer local)
- Income (candidate earns same or more)
- Age (candidate 1-7 years older considered natural)
- Kids, pets, and lifestyle alignment

Scores are tiered: Exceptional Match (80+), High Potential (65-79), Good Match (50-64), Possible Match (35-49), Low Compatibility (<35).

---

## AI Integration

AI is used to enhance the matchmaking experience in two ways:

1. **Match Introduction Emails**: Generates personalized, warm introduction emails from matchmaker to client, highlighting specific compatibility points between the client and their match. Uses structured prompts with client profiles for context-aware generation.

2. **Score Explanations**: Provides natural language explanations for match scores, describing why two people are compatible in 2-3 sentences, focusing on relationship dynamics rather than just demographics.

The system includes graceful fallbacks using template-based responses when AI services are unavailable, ensuring uninterrupted operation.

---

## Assumptions & Design Decisions

- **In-memory data**: Profiles and notes stored in JSON files (no database) for simplicity. In production, this would connect to a proper database.
- **JWT auth**: Matchmakers have fixed credentials; tokens expire after 24 hours.
- **Gender-specific matching**: Separate algorithms reflect traditional matchmaking preferences in the Indian context.
- **Single matchmaker assignment**: Each client is assigned to exactly one matchmaker (matching via `assignedMatchmaker` field).
- **Local development**: Frontend proxies `/api` requests to backend; production deployments need `VITE_API_URL` set.

---

## Pages

| Page          | Route              | Description                          |
|---------------|--------------------|--------------------------------------|
| Login         | /login             | Matchmaker authentication            |
| Dashboard     | /dashboard         | Stats, insights, recent clients      |
| Customers     | /customers         | Full client list with filters        |
| Customer      | /customer/:id      | Biodata / Matches / Notes tabs       |

---

## API Endpoints

| Method | Route                      | Description                  |
|--------|----------------------------|------------------------------|
| POST   | /api/auth/login            | Login → JWT                  |
| GET    | /api/customers             | All assigned customers       |
| GET    | /api/customers/:id         | Single customer profile      |
| PATCH  | /api/customers/:id/status  | Update status                |
| GET    | /api/matches/:id           | Ranked matches               |
| POST   | /api/ai/intro              | Generate intro email (Groq)    |
| POST   | /api/ai/score-explanation  | AI match narrative           |
| GET    | /api/notes/:id             | Get notes                    |
| POST   | /api/notes/:id             | Add note                     |
| DELETE | /api/notes/:noteId         | Delete note                  |

---

## Data

- **105 profiles** total: 65 female + 40 male
- Spread across 20+ Indian cities
- Mix of religions, professions, income brackets
- Each profile includes detailed biodata: education, career, family preferences, lifestyle, etc.

---

## Deployment

### Vercel (Separate Deployments)

The frontend and backend can be deployed as separate Vercel projects:

**Backend** (`backend/`):
- Uses `@vercel/node` runtime
- Configure environment variables in Vercel dashboard:
  - `JWT_SECRET` - your JWT signing secret
  - `GROQ_API_KEY` - your Groq API key (from console.groq.com)
- `vercel.json` routes all requests to `server.js`

**Frontend** (`frontend/`):
- Static SPA with client-side routing
- Configure `VITE_API_URL` in Vercel dashboard to point to your backend URL (e.g., `https://tdc-matchmaker-api.vercel.app`)
- All routes rewrite to `index.html` for React Router

### Traditional Deployment

- **Frontend** → Vercel: `cd frontend && npm run build` → deploy `dist/`
- **Backend** → Render: set `PORT`, `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`

