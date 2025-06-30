#!/usr/bin/env python3
"""
Netlify AI Backend Runner
Advanced scalable backend with generator functions and decorators
"""

import asyncio
import uvicorn
from app.main import app
from app.core.config import settings

def main():
    """Main entry point for the application"""
    print("🌟 Starting Netlify AI Backend...")
    print(f"📊 Version: {settings.VERSION}")
    print(f"🔧 Environment: {'Development' if settings.DEBUG else 'Production'}")
    print(f"🚀 Workers: {settings.WORKERS}")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1,  # Use 1 worker for development
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()