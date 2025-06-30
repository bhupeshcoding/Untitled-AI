from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.cache import cache_manager
from app.api.v1.endpoints import leetcode, chat

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting Netlify AI Backend...")
    await cache_manager.connect()
    logger.info("✅ Cache manager connected")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down Netlify AI Backend...")
    await cache_manager.disconnect()
    logger.info("✅ Cache manager disconnected")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    leetcode.router,
    prefix=f"{settings.API_V1_STR}/leetcode",
    tags=["LeetCode Problems"]
)

app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chat",
    tags=["AI Chat"]
)

@app.get("/")
async def root():
    """Root endpoint with motivational welcome"""
    return {
        "message": "🌟 Welcome to Netlify AI Backend!",
        "description": "Your intelligent coding companion powered by advanced AI",
        "version": settings.VERSION,
        "features": [
            "🎯 Top 150 LeetCode Problems",
            "🤖 AI-Powered Solutions",
            "💪 Motivational Content",
            "📊 Progress Tracking",
            "🚀 Real-time Chat",
            "⚡ Streaming Responses"
        ],
        "motivation": "Every line of code you write brings you closer to mastery! 💻✨",
        "api_docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "🟢 Netlify AI Backend is running smoothly!",
        "version": settings.VERSION,
        "cache_status": "connected" if cache_manager.redis_client else "disconnected"
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "motivation": "Don't worry about errors - they're stepping stones to success! 💪"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "Something went wrong, but we're on it!",
            "motivation": "Every bug is a learning opportunity! 🐛➡️🦋"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=settings.WORKERS
    )