import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from backend.config import settings

logger = logging.getLogger("uvicorn.error")

# Initialize Supabase client
supabase_client: Optional[Client] = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """
    Validates the bearer JWT token via Supabase.
    If no token is provided or verification fails, returns None (acting as guest/unauthenticated).
    """
    if not credentials:
        return None
        
    token = credentials.credentials
    if not token:
        return None

    if not supabase_client:
        logger.warning("Supabase client not initialized, skipping JWT validation. Treating user as guest.")
        return None

    try:
        # Call Supabase Auth API to get the user corresponding to the JWT
        response = supabase_client.auth.get_user(token)
        if response and response.user:
            return {
                "id": response.user.id,
                "email": response.user.email
            }
    except Exception as e:
        logger.error(f"JWT verification error: {str(e)}")
        # Raise HTTP 401 for explicit login attempts that fail, but return None for guest routes
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return None

def require_user(user: Optional[dict] = Depends(get_current_user)) -> dict:
    """
    FastAPI dependency that enforces authenticated access.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for this action",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
