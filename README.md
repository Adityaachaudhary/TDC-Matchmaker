# TDC Matchmaker Dashboard

Internal CRM for The Date Crew matchmakers — built with React + TypeScript + Node.js.

---

## Quick Start

### Backend
```bash
cd backend
npm install
# Edit .env — add your GROQ_API_KEY (get free at console.groq.com)
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
| POST   | /api/ai/intro              | Generate intro email (Groq)  |
| POST   | /api/ai/score-explanation  | AI match narrative           |
| GET    | /api/notes/:id             | Get notes                    |
| POST   | /api/notes/:id             | Add note                     |
| DELETE | /api/notes/:noteId         | Delete note                  |

---

## Data

- **105 profiles** total: 65 female + 40 male
- Spread across 20+ Indian cities
- Mix of religions, professions, income brackets

## Matching Logic

**Male clients** — matched with women who are younger, earn less, shorter, aligned on kids (traditional spec).

**Female clients** — matched using education parity, relocation compatibility, income, age gap, values.

Scores 0–100 labeled: Exceptional / High Potential / Good Match / Possible Match.

---

## Deployment

- **Frontend** → Vercel: `cd frontend && npm run build` → deploy `dist/`
- **Backend** → Render: set `PORT`, `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`

