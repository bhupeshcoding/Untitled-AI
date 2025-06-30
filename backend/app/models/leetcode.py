from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any

Base = declarative_base()

class LeetCodeProblem(Base):
    __tablename__ = "leetcode_problems"
    
    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, unique=True, index=True)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    solution = Column(Text)
    hints = Column(JSON)
    tags = Column(JSON)
    acceptance_rate = Column(Float)
    frequency = Column(Float)
    companies = Column(JSON)
    similar_problems = Column(JSON)
    time_complexity = Column(String(100))
    space_complexity = Column(String(100))
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "problem_id": self.problem_id,
            "title": self.title,
            "difficulty": self.difficulty,
            "description": self.description,
            "solution": self.solution,
            "hints": self.hints,
            "tags": self.tags,
            "acceptance_rate": self.acceptance_rate,
            "frequency": self.frequency,
            "companies": self.companies,
            "similar_problems": self.similar_problems,
            "time_complexity": self.time_complexity,
            "space_complexity": self.space_complexity,
            "is_premium": self.is_premium,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    problem_id = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)  # solved, attempted, skipped
    attempts = Column(Integer, default=0)
    time_spent = Column(Integer)  # in seconds
    solution_code = Column(Text)
    language = Column(String(50))
    performance_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MotivationalContent(Base):
    __tablename__ = "motivational_content"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(50), nullable=False)  # quote, tip, achievement
    title = Column(String(255))
    content = Column(Text, nullable=False)
    category = Column(String(100))
    difficulty_level = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "content_type": self.content_type,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "difficulty_level": self.difficulty_level,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }