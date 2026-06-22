# Kill My Startup Idea (The Brutal Pitch Destroyer)

India's first startup validation engine built to roast, critique, and tear down startup pitches from 7 specialized destruction vectors. If your idea survives this stress test, it might actually survive the market.

## Vision
To provide founders with unfiltered, brutal, and fact-grounded feedback on their ideas, targeting TAM/SAM, competitors, timing, execution constraints, unit economics, regulatory issues, and copycat threats from conglomerates.

---

## Directory Structure
- `/backend`: FastAPI (Python) server, handling input sanitization, PDF text extraction, parallel OpenRouter LLM calls, and DB persistence.
- `/frontend`: Next.js 14 (App Router) + Tailwind CSS client, managing the interactive console, results dashboards, user histories, side-by-side matrices, and Next.js Satori (`next/og`) viral share cards.

---

## Windows PowerShell Script Execution Policy Note
If you see a PowerShell security error like `File ... cannot be loaded because running scripts is disabled on this system` when running `npm`, run this command in your PowerShell terminal to temporarily bypass the script block:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Alternatively, on Windows you can use `npm.cmd` instead of `npm`.

---
flowchart TD
    %% ─── USER ENTRY ───
    A([🧑 Founder]) --> B[/Landing Page\nkillmystartup.vercel.app/]

    B --> C{Authenticated?}
    C -- No --> D[Guest Mode\n5 roasts/hr IP limit]
    C -- Yes --> E[Full Access\n20 roasts/hr + History]

    D & E --> F[/Idea Input Form\nmin 100 · max 1000 chars/]
    F --> F1[Try Example Button] --> F
    F --> G{Input Valid?}
    G -- No --> F
    G -- Yes --> H[Submit Pitch]

    %% ─── BACKEND ENTRY ───
    H --> I[POST /api/roast\nFastAPI Backend]
    I --> J{Rate Limit OK?\nslowapi check}
    J -- 429 Too Many --> K[❌ Error: Roasting too fast.\nEven YC partners take breaks.]
    K --> F
    J -- OK --> L[Input Sanitization\n+ PDF Text Extraction]

    %% ─── PARALLEL LLM CALLS ───
    L --> M[OpenRouter\nclaude-3.5-sonnet]
    M --> N[Parallel LLM Calls\n7 simultaneous requests]

    N --> V1[🎯 Vector 1\nMarket Reality Check\nTAM/SAM validation]
    N --> V2[⚔️ Vector 2\nCompetition Assassin\nIndian + global rivals]
    N --> V3[🔪 Vector 3\nExecution Guillotine\nmoat · capital · ops]
    N --> V4[💸 Vector 4\nUnit Economics Destroyer\nCAC · margins · LTV]
    N --> V5[⏱️ Vector 5\nTiming Attack\ntoo early or too late]
    N --> V6[⚖️ Vector 6\nRegulatory Minefield\nRBI · SEBI · FSSAI · MeitY]
    N --> V7[🏭 Vector 7\nReliance/Tata Threat\nconglomerate clone risk]

    %% ─── SCORING ───
    V1 & V2 & V3 & V4 & V5 & V6 & V7 --> S[Compute Survival Score\n0–100 aggregate]

    S --> S1{Score Range}
    S1 -- 0–30 --> SA[💀 Dead on Arrival\nRed Badge]
    S1 -- 31–60 --> SB[⚠️ Risky\nAmber Badge]
    S1 -- 61–85 --> SC[✅ Has Legs\nGreen Badge]
    S1 -- 86–100 --> SD[🚀 YC-Ready\nBlue Badge]

    %% ─── PERSISTENCE ───
    SA & SB & SC & SD --> DB{Storage}
    DB --> DB1[(Supabase PostgreSQL\nif auth'd)]
    DB --> DB2[(SQLite fallback\nlocal dev)]

    %% ─── RESULTS PAGE ───
    DB1 & DB2 --> R[/roast/id — Results Page/]

    R --> R1[🎬 Red Flash Intro\n800ms dramatic overlay]
    R1 --> R2[Survival Score Badge\ngauge meter component]
    R2 --> R3[7-Vector Card Grid\nverdict · severity · progress bar]

    R3 --> R4{Score ≥ 75?}
    R4 -- Yes --> R5[🎉 Confetti Animation]
    R4 -- No --> R6[💀 Skull Animation]

    %% ─── ACTIONS ───
    R5 & R6 --> ACT[User Actions]
    ACT --> ACT1[📥 Download PDF\njsPDF export]
    ACT --> ACT2[🐦 Share to X\nOG card via next/og]
    ACT --> ACT3[📜 View History\n/history page]
    ACT --> ACT4[🔁 Roast Another Idea]

    ACT2 --> OG[/api/og/id\nDynamic OG Image\nidea · score · vectors survived]
    ACT3 --> HX[/history\nPast roasts list\nLocalStorage or Supabase]
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
