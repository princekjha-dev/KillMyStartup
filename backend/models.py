import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
from backend.database import Base

class Roast(Base):
    __tablename__ = "roasts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), index=True, nullable=True) # Nullable for guest/unauthenticated roasts
    startup_name = Column(String(255), nullable=False)
    raw_input = Column(Text, nullable=False)
    target_market = Column(String(255), nullable=True)
    revenue_model = Column(String(255), nullable=True)
    founding_team = Column(Text, nullable=True)
    stage = Column(String(100), nullable=True)
    survival_score = Column(Integer, nullable=False)
    vectors_json = Column(JSON, nullable=False) # JSON dictionary containing the 7 vectors
    true_conditions_json = Column(JSON, nullable=True) # JSON list containing "What Would Need to Be True"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
