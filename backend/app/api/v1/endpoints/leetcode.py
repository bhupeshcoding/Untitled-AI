from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
import asyncio

from app.services.ai_service import ai_service
from app.core.decorators import timing_decorator, rate_limit
from app.core.generators import MotivationalGenerator
from app.models.leetcode import LeetCodeProblem

router = APIRouter()

class ProblemRequest(BaseModel):
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    limit: int = 10

class SolutionRequest(BaseModel):
    problem_id: int
    user_code: str
    language: str = "python"

class TrainingRequest(BaseModel):
    data: List[Dict[str, Any]]
    model_type: str = "classification"

@router.get("/problems/top150")
@timing_decorator
@rate_limit(max_calls=100, window_seconds=60)
async def get_top_150_problems():
    """Get the top 150 LeetCode problems with motivational content"""
    
    # Top 150 LeetCode problems data
    top_problems = [
        {
            "id": 1,
            "title": "Two Sum",
            "difficulty": "Easy",
            "description": "Find two numbers that add up to a target sum",
            "motivation": "🎯 Perfect starting point! Master this fundamental pattern.",
            "tags": ["Array", "Hash Table"],
            "acceptance_rate": 0.49,
            "frequency": 0.95
        },
        {
            "id": 2,
            "title": "Add Two Numbers",
            "difficulty": "Medium",
            "description": "Add two numbers represented as linked lists",
            "motivation": "🔗 Linked lists are everywhere! This builds essential skills.",
            "tags": ["Linked List", "Math"],
            "acceptance_rate": 0.38,
            "frequency": 0.85
        },
        {
            "id": 3,
            "title": "Longest Substring Without Repeating Characters",
            "difficulty": "Medium",
            "description": "Find the longest substring without repeating characters",
            "motivation": "🌟 Sliding window technique - a game changer!",
            "tags": ["String", "Sliding Window"],
            "acceptance_rate": 0.33,
            "frequency": 0.90
        },
        {
            "id": 4,
            "title": "Median of Two Sorted Arrays",
            "difficulty": "Hard",
            "description": "Find median of two sorted arrays in O(log(m+n)) time",
            "motivation": "🚀 Binary search mastery! You've got this challenge!",
            "tags": ["Array", "Binary Search"],
            "acceptance_rate": 0.35,
            "frequency": 0.75
        },
        {
            "id": 5,
            "title": "Longest Palindromic Substring",
            "difficulty": "Medium",
            "description": "Find the longest palindromic substring",
            "motivation": "🎭 Palindromes are beautiful! Master dynamic programming here.",
            "tags": ["String", "Dynamic Programming"],
            "acceptance_rate": 0.32,
            "frequency": 0.80
        }
        # Add more problems here to reach 150
    ]
    
    # Add motivational content to each problem
    motivation_gen = MotivationalGenerator()
    
    for problem in top_problems:
        problem["daily_tip"] = motivation_gen.get_daily_tip()
        problem["encouragement"] = "Every expert was once a beginner. Keep coding! 💪"
    
    return {
        "message": "🌟 Welcome to your coding journey! These problems will transform you into a coding master!",
        "total_problems": len(top_problems),
        "problems": top_problems,
        "motivation": "Remember: The only way to learn programming is by solving problems. You're on the right path! 🎯"
    }

@router.get("/problems/{problem_id}/solution/stream")
async def stream_solution(problem_id: int):
    """Stream solution explanation for a problem"""
    
    async def generate_solution_stream():
        async for chunk in ai_service.stream_problem_solutions(problem_id):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_solution_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache"}
    )

@router.post("/problems/analyze")
@timing_decorator
async def analyze_solution(request: SolutionRequest):
    """Analyze user's solution and provide feedback"""
    
    try:
        analysis = await ai_service.analyze_code_quality(
            request.user_code, 
            request.language
        )
        
        # Add motivational feedback
        if analysis["quality_score"] > 0.8:
            analysis["motivation"] = "🎉 Excellent work! Your code quality is outstanding!"
        elif analysis["quality_score"] > 0.6:
            analysis["motivation"] = "👍 Good job! A few tweaks and you'll have perfect code!"
        else:
            analysis["motivation"] = "💪 Keep improving! Every iteration makes you better!"
        
        return {
            "problem_id": request.problem_id,
            "analysis": analysis,
            "encouragement": "Code review is how we grow. Keep pushing forward! 🚀"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/recommendations/{user_id}")
@timing_decorator
async def get_recommendations(user_id: str, skill_level: str = "intermediate"):
    """Get personalized problem recommendations"""
    
    try:
        recommendations = await ai_service.get_personalized_recommendations(
            user_id, skill_level
        )
        
        return {
            "user_id": user_id,
            "skill_level": skill_level,
            "recommendations": recommendations,
            "motivation": f"🎯 Perfect problems for your {skill_level} level! Challenge yourself and grow! 🌱"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@router.post("/train")
@timing_decorator
async def train_ai_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train the AI model on provided data"""
    
    try:
        # Start training in background
        background_tasks.add_task(ai_service.train_on_data, request.data)
        
        return {
            "message": "🤖 AI training started! Your model is learning and improving!",
            "training_samples": len(request.data),
            "model_type": request.model_type,
            "status": "training_initiated",
            "motivation": "Teaching AI is like teaching yourself - both grow stronger! 🧠✨"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/motivation/stream")
async def stream_motivation():
    """Stream motivational content"""
    
    async def generate_motivation_stream():
        motivation_gen = MotivationalGenerator()
        async for content in motivation_gen.motivation_stream(duration_seconds=30):
            yield f"data: {json.dumps(content)}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_motivation_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache"}
    )

@router.get("/stats/progress")
async def get_progress_stats():
    """Get user progress statistics"""
    
    # Simulate progress data
    stats = {
        "problems_solved": 45,
        "total_problems": 150,
        "completion_rate": 0.30,
        "streak_days": 12,
        "favorite_topics": ["Arrays", "Dynamic Programming", "Trees"],
        "difficulty_breakdown": {
            "Easy": 20,
            "Medium": 20,
            "Hard": 5
        },
        "motivation": "🔥 12-day streak! You're building an incredible habit!",
        "next_milestone": "Reach 50 problems solved",
        "encouragement": "Consistency beats perfection. Keep showing up! 💪"
    }
    
    return stats