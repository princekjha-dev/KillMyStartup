import re
import time
import logging
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db, Base, engine
from backend.models import Roast
from backend.auth import get_current_user, require_user
from backend.pdf_parser import extract_text_from_pdf
from backend.roast_engine import execute_roast

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

# Auto-create tables in development (SQLite/Supabase Postgres)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(title="Kill My Startup Idea API", version="1.0.0")

# Configure CORS
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Rate Limiting (Sliding Window) ---
# Format: IP -> list of timestamps
unauth_limits: Dict[str, List[float]] = defaultdict(list)
# Format: User_ID -> list of timestamps
auth_limits: Dict[str, List[float]] = defaultdict(list)

def check_rate_limit(ip: str, user_id: Optional[str] = None):
    now = time.time()
    
    if user_id:
        # Auth: 20 per day (86400 seconds)
        timestamps = auth_limits[user_id]
        # Filter timestamps within the last 24 hours
        auth_limits[user_id] = [t for t in timestamps if now - t < 86400]
        if len(auth_limits[user_id]) >= settings.RATE_LIMIT_AUTH_MAX_PER_DAY:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Authenticated users are limited to {settings.RATE_LIMIT_AUTH_MAX_PER_DAY} roasts per day."
            )
        auth_limits[user_id].append(now)
    else:
        # Unauth: 5 per hour (3600 seconds)
        timestamps = unauth_limits[ip]
        # Filter timestamps within the last hour
        unauth_limits[ip] = [t for t in timestamps if now - t < 3600]
        if len(unauth_limits[ip]) >= settings.RATE_LIMIT_UNAUTH_MAX:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Unauthenticated users are limited to {settings.RATE_LIMIT_UNAUTH_MAX} roasts per hour."
            )
        unauth_limits[ip].append(now)

# --- Input Sanitization Helper ---
JAILBREAK_PATTERNS = [
    r"ignore previous instructions",
    r"dan mode",
    r"jailbreak",
    r"you are now",
    r"pretend you are",
    r"system prompt override",
    r"forget what you were told"
]

def sanitize_and_validate_input(text: str) -> str:
    if not text:
        return ""
    
    # Strip HTML tags
    clean_text = re.sub(r"<[^>]*>", "", text)
    
    # Check for prompt injection jailbreak keywords
    lower_text = clean_text.lower()
    for pattern in JAILBREAK_PATTERNS:
        if re.search(pattern, lower_text):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malicious content or prompt injection patterns detected."
            )
            
    # Basic protection against obvious SQL injections in user descriptions
    sql_patterns = [r"UNION\s+SELECT", r"OR\s+\d+=\d+", r"DROP\s+TABLE"]
    for pattern in sql_patterns:
        if re.search(pattern, clean_text, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid characters or database command syntax detected."
            )
            
    return clean_text.strip()

# --- Pydantic Schema for Roast Request ---
class RoastRequest(BaseModel):
    startup_name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=20, max_length=10000) # backend enforces standard bounds
    target_market: Optional[str] = Field(None, max_length=255)
    revenue_model: Optional[str] = Field(None, max_length=255)
    founding_team: Optional[str] = Field(None, max_length=2000)
    stage: Optional[str] = Field(None, max_length=100)
    pdf_text: Optional[str] = None

# --- API Endpoints ---

@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parses PDF pitch decks using pdfplumber and returns extracted text.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        pdf_bytes = await file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        return {"text": extracted_text}
    except Exception as e:
        logger.error(f"Error parsing uploaded PDF: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/roast")
async def create_new_roast(
    request: RoastRequest,
    x_forwarded_for: Optional[str] = Header(None, alias="X-Forwarded-For"),
    x_openrouter_key: Optional[str] = Header(None, alias="X-OpenRouter-Key"),
    current_user: Optional[dict] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs the 7 destruction vectors on the startup idea, saves results to database, and returns details.
    """
    # Identify Client IP for rate-limiting
    ip = x_forwarded_for.split(",")[0] if x_forwarded_for else "127.0.0.1"
    
    # Rate limit check
    user_id = current_user["id"] if current_user else None
    check_rate_limit(ip, user_id=user_id)

    # Sanitize inputs
    startup_name = sanitize_and_validate_input(request.startup_name)
    description = sanitize_and_validate_input(request.description)
    target_market = sanitize_and_validate_input(request.target_market) if request.target_market else None
    revenue_model = sanitize_and_validate_input(request.revenue_model) if request.revenue_model else None
    founding_team = sanitize_and_validate_input(request.founding_team) if request.founding_team else None
    stage = sanitize_and_validate_input(request.stage) if request.stage else None
    pdf_text = sanitize_and_validate_input(request.pdf_text) if request.pdf_text else None

    # Check for live API key (either server-configured or client-passed temporary key)
    api_key = x_openrouter_key or settings.OPENROUTER_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OpenRouter API Key not configured. Please set it in backend environment variables or supply a temporary key in the setup panel."
        )

    try:
        # Run parallel roast calculations
        survival_score, vectors_results, true_conditions = await execute_roast(
            startup_name=startup_name,
            description=description,
            target_market=target_market,
            revenue_model=revenue_model,
            founding_team=founding_team,
            stage=stage,
            pdf_text=pdf_text,
            custom_api_key=api_key
        )

        # Save result to DB (supports saving guest roasts with user_id=None)
        db_roast = Roast(
            user_id=user_id,
            startup_name=startup_name,
            raw_input=description,
            target_market=target_market,
            revenue_model=revenue_model,
            founding_team=founding_team,
            stage=stage,
            survival_score=survival_score,
            vectors_json=vectors_results,
            true_conditions_json=true_conditions
        )
        db.add(db_roast)
        db.commit()
        db.refresh(db_roast)

        return {
            "id": db_roast.id,
            "startup_name": db_roast.startup_name,
            "raw_input": db_roast.raw_input,
            "target_market": db_roast.target_market,
            "revenue_model": db_roast.revenue_model,
            "founding_team": db_roast.founding_team,
            "stage": db_roast.stage,
            "survival_score": db_roast.survival_score,
            "vectors": db_roast.vectors_json,
            "true_conditions": db_roast.true_conditions_json,
            "created_at": db_roast.created_at
        }

    except Exception as e:
        logger.error(f"Error during roast execution: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling your roast: {str(e)}"
        )

@app.get("/api/roasts")
async def get_user_roasts(
    current_user: dict = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Returns the collection of roasts saved by the authenticated user.
    """
    try:
        roasts = db.query(Roast).filter(Roast.user_id == current_user["id"]).order_by(Roast.created_at.desc()).all()
        return [
            {
                "id": r.id,
                "startup_name": r.startup_name,
                "raw_input": r.raw_input,
                "target_market": r.target_market,
                "revenue_model": r.revenue_model,
                "founding_team": r.founding_team,
                "stage": r.stage,
                "survival_score": r.survival_score,
                "vectors": r.vectors_json,
                "true_conditions": r.true_conditions_json,
                "created_at": r.created_at
            }
            for r in roasts
        ]
    except Exception as e:
        logger.error(f"Error loading user roasts: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve roast history.")

@app.get("/api/roasts/{roast_id}")
async def get_single_roast(
    roast_id: str,
    db: Session = Depends(get_db)
):
    """
    Gets details of a single roast by ID. Anyone can retrieve a roast if they have the ID (enabling share links).
    """
    roast = db.query(Roast).filter(Roast.id == roast_id).first()
    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found.")
        
    return {
        "id": roast.id,
        "startup_name": roast.startup_name,
        "raw_input": roast.raw_input,
        "target_market": roast.target_market,
        "revenue_model": roast.revenue_model,
        "founding_team": roast.founding_team,
        "stage": roast.stage,
        "survival_score": roast.survival_score,
        "vectors": roast.vectors_json,
        "true_conditions": roast.true_conditions_json,
        "created_at": roast.created_at
    }

@app.delete("/api/roasts/{roast_id}")
async def delete_roast(
    roast_id: str,
    current_user: dict = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a saved roast from the user's history.
    """
    roast = db.query(Roast).filter(Roast.id == roast_id).first()
    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found.")
        
    if roast.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this roast.")
        
    try:
        db.delete(roast)
        db.commit()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting roast: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete roast.")
