```
██╗  ██╗██╗██╗     ██╗     ███╗   ███╗██╗   ██╗
██║ ██╔╝██║██║     ██║     ████╗ ████║╚██╗ ██╔╝
█████╔╝ ██║██║     ██║     ██╔████╔██║ ╚████╔╝
██╔═██╗ ██║██║     ██║     ██║╚██╔╝██║  ╚██╔╝
██║  ██╗██║███████╗███████╗██║ ╚═╝ ██║   ██║
╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝     ╚═╝   ╚═╝

███████╗████████╗ █████╗ ██████╗ ████████╗██╗   ██╗██████╗
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██║   ██║██╔══██╗
███████╗   ██║   ███████║██████╔╝   ██║   ██║   ██║██████╔╝
╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ██║   ██║██╔═══╝
███████║   ██║   ██║  ██║██║  ██║   ██║   ╚██████╔╝██║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝
```

> **Your idea just met its judge.**

Submit your startup pitch. Our 7-vector AI destruction engine will stress-test it the way the market will — brutally, honestly, without mercy. Built for founders who want truth, not validation.

---

[![Live Demo](https://img.shields.io/badge/Live%20Demo-killmystartup.vercel.app-FF4500?style=for-the-badge&logo=vercel)](https://killmystartup.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-claude--3.5--sonnet-7C3AED?style=for-the-badge)](https://openrouter.ai)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## What It Does

Most feedback is validation dressed up as advice. KillMyStartup is different.

Paste your pitch (100–1000 chars). Seven AI agents tear it apart simultaneously across every angle a real investor, competitor, or regulator would. You get a **Survival Score (0–100)**, a verdict per vector, and a shareable roast card. If your idea survives this, it might survive the market.

### The 7 Destruction Vectors

| # | Vector | What Gets Attacked |
|---|--------|--------------------|
| 1 | 🎯 **Market Reality Check** | Your TAM/SAM claims vs cited data |
| 2 | ⚔️ **Competition Assassin** | Real Indian + global competitors you missed |
| 3 | 🔪 **Execution Guillotine** | Moat, capital requirements, operational complexity |
| 4 | 💸 **Unit Economics Destroyer** | CAC, LTV, margins, transaction viability |
| 5 | ⏱️ **Timing Attack** | Whether you're too early, too late, or already dead |
| 6 | ⚖️ **Regulatory Minefield** | RBI, SEBI, FSSAI, MeitY compliance hazards |
| 7 | 🏭 **Reliance/Tata Threat** | Conglomerate clone risk assessment |

### Survival Score

| Score | Verdict | Meaning |
|-------|---------|---------|
| 0 – 30 | 💀 Dead on Arrival | Don't quit your day job |
| 31 – 60 | ⚠️ Risky | Fixable, but you have blind spots |
| 61 – 85 | ✅ Has Legs | Worth pursuing with eyes open |
| 86 – 100 | 🚀 YC-Ready | This might actually work |

---

## System Architecture

```mermaid
flowchart TD
    A([Founder]) --> B[/Landing Page/]
    B --> C{Authenticated?}
    C -- No --> D[Guest Mode · 5 roasts/hr]
    C -- Yes --> E[Full Access · 20 roasts/hr + History]
    D & E --> F[/Idea Input · 100–1000 chars/]
    F --> G[POST /api/roast · FastAPI]
    G --> H{Rate Limit OK?}
    H -- 429 --> I[❌ Slow down, founder.]
    H -- OK --> J[OpenRouter · claude-3.5-sonnet]
    J --> K[7 Parallel LLM Calls]
    K --> L[Survival Score 0–100]
    L --> M[(Supabase · SQLite fallback)]
    M --> N[/roast/id · Results Page/]
    N --> O[Score Badge · Vector Grid · Share Card]
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Lucide React |
| Backend | FastAPI (Python 3.11+), Uvicorn, SlowAPI |
| AI | OpenRouter → claude-3.5-sonnet (7 parallel calls) |
| Auth + DB | Supabase (PostgreSQL) · SQLite fallback for local dev |
| OG Cards | `@vercel/og` + Next.js Satori |
| PDF Export | jsPDF (client-side) |
| Deployment | Vercel (frontend) · Railway/Render (backend) |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key
- A [Supabase](https://supabase.com) project (optional — SQLite fallback works without it)

---

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
# If you hit a script execution error:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

API will be live at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

---

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

App will be live at `http://localhost:3000`.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | Your OpenRouter key |
| `OPENROUTER_MODEL` | No | Default: `anthropic/claude-3.5-sonnet:beta` |
| `DATABASE_URL` | No | Supabase PostgreSQL connection string. Omit to use SQLite. |
| `SUPABASE_URL` | No | Your Supabase project URL |
| `SUPABASE_KEY` | No | Supabase service role or anon key |

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet:beta
DATABASE_URL=postgresql://postgres.yourprojectid:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
SUPABASE_URL=https://yourprojectid.supabase.co
SUPABASE_KEY=your_supabase_key
```

### `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |

```env
NEXT_PUBLIC_SUPABASE_URL=https://yourprojectid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

> **Guest Mode:** If Supabase variables are omitted, the app runs in Guest Mode. History and accounts are disabled, but roasts work by entering a temporary OpenRouter key in the Settings menu.

---

## Features

- **7-vector parallel destruction** — all agents fire simultaneously, results in seconds
- **Survival Score (0–100)** — aggregate gauge with color-coded verdict
- **Dynamic OG share cards** — `next/og` generates a shareable roast card for X/Twitter
- **PDF export** — download your full roast report via jsPDF
- **Roast history** — Supabase-backed for auth'd users, localStorage for guests
- **Rate limiting** — IP-based via SlowAPI (5/hr guest, 20/hr auth'd)
- **SQLite fallback** — works fully offline without Supabase
- **Confetti on high scores** — because surviving deserves celebration

---

## Project Structure

```
KillMyStartup/
├── backend/
│   ├── main.py          # FastAPI app, routes, rate limiting
│   ├── roast.py         # 7-vector LLM orchestration
│   ├── models.py        # SQLAlchemy models
│   ├── database.py      # Supabase + SQLite connection logic
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx           # Landing + input form
│   │   ├── roast/[id]/        # Results page
│   │   ├── history/           # Roast history
│   │   └── api/og/[id]/       # Dynamic OG card route
│   └── package.json
├── startup_killer.db    # SQLite fallback (auto-created)
└── README.md
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'add: your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a PR

Please keep PRs scoped. One feature per PR.

---

## License

MIT © 2025 [princekjha-dev](https://github.com/princekjha-dev)

---

<p align="center">
  Built for founders who want truth.<br/>
  <strong>If your idea survives this, it might actually survive the market.</strong>
</p>
    ACT4 --> F

    %% ─── STYLES ───
    classDef page fill:#1a1a1a,stroke:#FF4500,color:#f5f5f5
    classDef backend fill:#111,stroke:#888,color:#f5f5f5
    classDef vector fill:#1F1F1F,stroke:#FF4500,color:#f5f5f5
    classDef score fill:#111,stroke:#22c55e,color:#f5f5f5
    classDef danger fill:#2a0000,stroke:#ef4444,color:#f5f5f5
    classDef action fill:#0f172a,stroke:#6366f1,color:#f5f5f5

    class B,F,R,HX page
    class I,L,M,N,DB backend
    class V1,V2,V3,V4,V5,V6,V7 vector
    class S,S1,SA,SB,SC,SD score
    class K danger
    class ACT,ACT1,ACT2,ACT3,ACT4,OG action
    


## Backend Setup (FastAPI)

1. **Navigate to the backend directory (CRITICAL: Do not run from root):**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment:**
   - **Windows PowerShell:**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies (Must be in backend folder):**
   ```bash
   pip install -r requirements.txt
   ```


5. **Configure environment variables (`backend/.env`):**
   Create a `.env` file inside the `backend` folder:
   ```env
   # OpenRouter credentials
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=anthropic/claude-3.5-sonnet:beta

   # Supabase database connection (Transaction Pooler)
   DATABASE_URL=postgresql://postgres.yourprojectid:yourpassword@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   
   # Supabase Auth configuration
   SUPABASE_URL=https://yourprojectid.supabase.co
   SUPABASE_KEY=your_supabase_service_role_key_or_anon_key
   ```
   *Note: If `DATABASE_URL` is omitted, the API automatically falls back to a local SQLite database (`startup_killer.db`) for testing.*

6. **Start the API server:**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

7. **Run unit tests:**
   ```bash
   pytest
   ```

---

## Frontend Setup (Next.js 14)

1. **Navigate to the frontend directory (CRITICAL: Do not run from root):**
   ```bash
   cd frontend
   ```

2. **Install node dependencies:**
   - **On Windows (PowerShell):**
     ```powershell
     npm.cmd install
     ```
   - **General:**
     ```bash
     npm install
     ```


3. **Configure environment variables (`frontend/.env.local`):**
   Create a `.env.local` file inside the `frontend` folder:
   ```env
   # Supabase client variables
   NEXT_PUBLIC_SUPABASE_URL=https://yourprojectid.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: If these variables are not supplied, the app defaults to Guest Mode. History and User Accounts will be locked, but roasts can still be generated by providing a temporary OpenRouter key in the Gear Settings menu of the UI.*

4. **Start the development server:**
   - **On Windows (PowerShell):**
     ```powershell
     npm.cmd run dev
     ```
   - **General:**
     ```bash
     npm run dev
     ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*


---

## Destruction Vectors
1. **Market Reality Check:** Challenges TAM/SAM claims with cited reasoning.
2. **Competition Assassin:** Unmasks real Indian and global competitors.
3. **Execution Guillotine:** Outlines required moats, capital, and operations.
4. **Unit Economics Destroyer:** Drills down margins, CAC, and transaction logs.
5. **Timing Attack:** Explains if the startup is too early, too late, or already tried.
6. **Regulatory Minefield:** Flags compliance hazards in RBI, SEBI, FSSAI, MeitY.
7. **Reliance/Tata Threat:** Assesses cloning risks from massive conglomerates.
