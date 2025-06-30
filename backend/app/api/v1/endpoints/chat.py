from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from pydantic import BaseModel
import json
import asyncio
import logging

from app.services.ai_service import ai_service
from app.core.decorators import timing_decorator, rate_limit

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str
    context: Dict[str, Any] = {}
    stream: bool = True

class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.post("/chat")
@timing_decorator
@rate_limit(max_calls=50, window_seconds=60)
async def chat_with_ai(request: ChatMessage):
    """Chat with AI assistant"""
    
    try:
        if request.stream:
            # Return streaming response
            async def generate_response():
                async for token in ai_service.data_generator.ai_response_generator(
                    request.message, max_tokens=500
                ):
                    yield f"data: {json.dumps({'token': token})}\n\n"
                
                # Send final response
                final_response = await ai_service.generate_response(
                    request.message, request.context
                )
                yield f"data: {json.dumps({'final': final_response, 'done': True})}\n\n"
            
            return StreamingResponse(
                generate_response(),
                media_type="text/plain",
                headers={"Cache-Control": "no-cache"}
            )
        else:
            # Return complete response
            response = await ai_service.generate_response(
                request.message, request.context
            )
            return {
                "response": response,
                "context": request.context,
                "motivation": "Great question! Keep exploring and learning! 🌟"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket chat endpoint"""
    
    await manager.connect(websocket)
    
    try:
        # Send welcome message
        welcome_msg = {
            "type": "welcome",
            "message": "🎉 Welcome to Netlify AI! I'm here to help you master coding!",
            "motivation": "Every expert was once a beginner. Let's start your journey! 🚀"
        }
        await manager.send_personal_message(json.dumps(welcome_msg), websocket)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            user_message = message_data.get("message", "")
            context = message_data.get("context", {})
            
            # Generate AI response
            ai_response = await ai_service.generate_response(user_message, context)
            
            # Send response back
            response_data = {
                "type": "ai_response",
                "message": ai_response,
                "timestamp": asyncio.get_event_loop().time(),
                "motivation": "Keep asking great questions! 💡"
            }
            
            await manager.send_personal_message(json.dumps(response_data), websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await manager.send_personal_message(
            json.dumps({"type": "error", "message": "Something went wrong"}),
            websocket
        )

@router.get("/chat/history/{user_id}")
async def get_chat_history(user_id: str, limit: int = 50):
    """Get chat history for a user"""
    
    # Simulate chat history
    history = [
        {
            "id": 1,
            "user_message": "How do I solve Two Sum?",
            "ai_response": "Great question! Two Sum is a classic problem...",
            "timestamp": "2024-01-15T10:30:00Z",
            "context": {"difficulty": "Easy"}
        },
        {
            "id": 2,
            "user_message": "What's the time complexity?",
            "ai_response": "The optimal solution has O(n) time complexity...",
            "timestamp": "2024-01-15T10:32:00Z",
            "context": {"problem_id": 1}
        }
    ]
    
    return {
        "user_id": user_id,
        "history": history[:limit],
        "total_messages": len(history),
        "motivation": "Your learning journey is captured here! 📚✨"
    }

@router.post("/chat/feedback")
async def submit_feedback(feedback_data: Dict[str, Any]):
    """Submit feedback about AI responses"""
    
    try:
        # Process feedback (store in database, improve model, etc.)
        feedback_id = f"feedback_{asyncio.get_event_loop().time()}"
        
        return {
            "feedback_id": feedback_id,
            "status": "received",
            "message": "🙏 Thank you for your feedback! It helps me improve!",
            "motivation": "Your input makes our AI better for everyone! 🤝"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback submission failed: {str(e)}")

@router.get("/chat/suggestions")
async def get_chat_suggestions():
    """Get suggested questions/topics for chat"""
    
    suggestions = [
        {
            "category": "LeetCode Problems",
            "suggestions": [
                "How do I approach dynamic programming problems?",
                "What's the best way to solve tree traversal problems?",
                "Can you explain the sliding window technique?",
                "How do I optimize my solution's time complexity?"
            ]
        },
        {
            "category": "Coding Tips",
            "suggestions": [
                "What are the most important data structures to master?",
                "How can I improve my problem-solving approach?",
                "What's the best way to practice coding daily?",
                "How do I prepare for technical interviews?"
            ]
        },
        {
            "category": "Motivation",
            "suggestions": [
                "I'm feeling stuck on a problem, can you motivate me?",
                "How do I stay consistent with coding practice?",
                "What should I do when I can't solve a problem?",
                "How do I build confidence in my coding skills?"
            ]
        }
    ]
    
    return {
        "suggestions": suggestions,
        "motivation": "🎯 Great questions lead to great learning! Pick one and let's dive in!"
    }