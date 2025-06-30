# 🌟 Netlify AI Backend

Advanced scalable backend built with FastAPI, featuring generator functions, decorators, and AI training capabilities for LeetCode problem solving.

## 🚀 Features

- **Scalable Architecture**: Built with FastAPI and async/await patterns
- **Generator Functions**: Efficient data streaming and processing
- **Decorator Patterns**: Timing, caching, rate limiting, and retry logic
- **AI Training**: Train models on JSON data for personalized experiences
- **LeetCode Integration**: Top 150 problems with AI-powered solutions
- **Motivational Content**: Inspiring quotes and tips for learners
- **Real-time Chat**: WebSocket support for instant AI interactions
- **Caching Layer**: Redis-based caching for optimal performance

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Cache**: Redis
- **AI/ML**: Custom training pipeline
- **WebSockets**: Real-time communication
- **Background Tasks**: Celery integration

## 📦 Installation

1. **Clone and Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**:
```bash
# Install PostgreSQL and Redis
# Update DATABASE_URL and REDIS_URL in .env
```

4. **Run the Application**:
```bash
python run.py
```

## 🎯 API Endpoints

### LeetCode Problems
- `GET /api/v1/leetcode/problems/top150` - Get top 150 problems
- `GET /api/v1/leetcode/problems/{id}/solution/stream` - Stream solution
- `POST /api/v1/leetcode/problems/analyze` - Analyze user solution
- `GET /api/v1/leetcode/recommendations/{user_id}` - Get recommendations

### AI Chat
- `POST /api/v1/chat/chat` - Chat with AI
- `WebSocket /api/v1/chat/ws/chat` - Real-time chat
- `GET /api/v1/chat/suggestions` - Get chat suggestions

### Training
- `POST /api/v1/leetcode/train` - Train AI model on data

## 🔧 Architecture Highlights

### Generator Functions
```python
async def stream_leetcode_problems(self, problems: List[Dict]) -> AsyncGenerator[Dict, None]:
    """Stream LeetCode problems in batches"""
    for i in range(0, len(problems), self.batch_size):
        batch = problems[i:i + self.batch_size]
        for problem in batch:
            problem['processed_at'] = datetime.now().isoformat()
            yield problem
        await asyncio.sleep(0.1)
```

### Decorator Patterns
```python
@timing_decorator
@cache_result(ttl=1800, key_prefix="ai_response")
@retry(max_attempts=3, delay=1.0)
async def generate_response(self, prompt: str) -> str:
    # AI response generation logic
    pass
```

### Training Pipeline
```python
@retry(max_attempts=3, delay=1.0)
async def train_on_data(self, training_data: List[Dict]) -> Dict[str, Any]:
    """Train the AI model on provided data"""
    # Advanced training logic with progress tracking
    pass
```

## 📊 Performance Features

- **Async/Await**: Non-blocking operations
- **Connection Pooling**: Efficient database connections
- **Redis Caching**: Fast data retrieval
- **Rate Limiting**: API protection
- **Background Tasks**: Non-blocking processing

## 🎓 Educational Content

The backend includes:
- **150 Top LeetCode Problems** with detailed solutions
- **Motivational Quotes** and coding tips
- **Progress Tracking** and personalized recommendations
- **AI-Powered Explanations** for complex algorithms

## 🔒 Security Features

- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Secure data processing
- **Error Handling**: Graceful failure management
- **CORS Configuration**: Secure cross-origin requests

## 📈 Monitoring & Logging

- **Structured Logging**: Comprehensive application logs
- **Performance Metrics**: Timing decorators track execution
- **Health Checks**: Monitor application status
- **Error Tracking**: Detailed error reporting

## 🚀 Deployment

The backend is designed for easy deployment on:
- **Docker**: Containerized deployment
- **Cloud Platforms**: AWS, GCP, Azure
- **Kubernetes**: Scalable orchestration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the coding community. Every line of code brings you closer to mastery! 🌟**