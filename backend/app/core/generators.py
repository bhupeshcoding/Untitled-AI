import asyncio
from typing import AsyncGenerator, Generator, List, Dict, Any, Optional
import json
import random
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DataStreamGenerator:
    """Generator class for streaming data processing"""
    
    def __init__(self, batch_size: int = 100):
        self.batch_size = batch_size
    
    async def stream_leetcode_problems(self, problems: List[Dict]) -> AsyncGenerator[Dict, None]:
        """Stream LeetCode problems in batches"""
        for i in range(0, len(problems), self.batch_size):
            batch = problems[i:i + self.batch_size]
            for problem in batch:
                # Add processing timestamp
                problem['processed_at'] = datetime.now().isoformat()
                yield problem
            
            # Simulate processing delay
            await asyncio.sleep(0.1)
    
    def batch_processor(self, data: List[Any], batch_size: int = None) -> Generator[List[Any], None, None]:
        """Process data in batches using generator"""
        if batch_size is None:
            batch_size = self.batch_size
        
        for i in range(0, len(data), batch_size):
            yield data[i:i + batch_size]
    
    async def ai_response_generator(self, prompt: str, max_tokens: int = 1000) -> AsyncGenerator[str, None]:
        """Generate AI responses token by token"""
        # Simulate token generation
        words = [
            "Solving", "this", "LeetCode", "problem", "requires", "understanding",
            "data", "structures", "and", "algorithms.", "Let's", "break", "it", "down:",
            "First,", "analyze", "the", "problem", "constraints.", "Then,", "choose",
            "the", "optimal", "approach.", "Consider", "time", "and", "space", "complexity."
        ]
        
        for i, word in enumerate(words):
            if i >= max_tokens:
                break
            yield f"{word} "
            await asyncio.sleep(0.05)  # Simulate processing time
    
    def fibonacci_generator(self, n: int) -> Generator[int, None, None]:
        """Generate Fibonacci sequence up to n numbers"""
        a, b = 0, 1
        count = 0
        while count < n:
            yield a
            a, b = b, a + b
            count += 1
    
    async def training_data_generator(self, file_path: str) -> AsyncGenerator[Dict, None]:
        """Generate training data from file"""
        try:
            with open(file_path, 'r') as file:
                for line_num, line in enumerate(file):
                    try:
                        data = json.loads(line.strip())
                        data['line_number'] = line_num
                        yield data
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON at line {line_num}")
                        continue
                    
                    # Yield control periodically
                    if line_num % 100 == 0:
                        await asyncio.sleep(0.01)
        except FileNotFoundError:
            logger.error(f"Training data file not found: {file_path}")
            return

class MotivationalGenerator:
    """Generate motivational content for users"""
    
    def __init__(self):
        self.motivational_quotes = [
            "Every expert was once a beginner. Keep coding!",
            "The only way to learn programming is by writing programs.",
            "Code is like humor. When you have to explain it, it's bad.",
            "Programming isn't about what you know; it's about what you can figure out.",
            "The best error message is the one that never shows up.",
            "Debugging is twice as hard as writing the code in the first place.",
            "Talk is cheap. Show me the code.",
            "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
            "First, solve the problem. Then, write the code.",
            "Experience is the name everyone gives to their mistakes."
        ]
        
        self.coding_tips = [
            "Break down complex problems into smaller, manageable pieces",
            "Practice coding every day, even if it's just for 30 minutes",
            "Read other people's code to learn different approaches",
            "Don't be afraid to ask for help when you're stuck",
            "Test your code thoroughly with different inputs",
            "Write clean, readable code that your future self will thank you for",
            "Learn to use debugging tools effectively",
            "Understand the problem before you start coding",
            "Comment your code to explain the 'why', not just the 'what'",
            "Keep learning new technologies and programming paradigms"
        ]
    
    def get_random_motivation(self) -> Generator[str, None, None]:
        """Generate random motivational content"""
        while True:
            yield random.choice(self.motivational_quotes)
    
    def get_daily_tip(self) -> str:
        """Get a daily coding tip"""
        return random.choice(self.coding_tips)
    
    async def motivation_stream(self, duration_seconds: int = 60) -> AsyncGenerator[Dict, None]:
        """Stream motivational content for a specified duration"""
        start_time = datetime.now()
        
        while (datetime.now() - start_time).seconds < duration_seconds:
            motivation_data = {
                "quote": random.choice(self.motivational_quotes),
                "tip": random.choice(self.coding_tips),
                "timestamp": datetime.now().isoformat(),
                "type": "motivation"
            }
            yield motivation_data
            await asyncio.sleep(5)  # Send motivation every 5 seconds

class ProblemDifficultyGenerator:
    """Generate problems based on difficulty progression"""
    
    def __init__(self):
        self.difficulty_levels = ["Easy", "Medium", "Hard"]
    
    def progressive_difficulty(self, user_level: int) -> Generator[str, None, None]:
        """Generate problems with progressive difficulty"""
        base_difficulty = min(user_level // 10, 2)  # 0, 1, or 2
        
        while True:
            # Occasionally challenge with harder problems
            if random.random() < 0.3:
                difficulty_index = min(base_difficulty + 1, 2)
            else:
                difficulty_index = base_difficulty
            
            yield self.difficulty_levels[difficulty_index]
    
    async def adaptive_problem_stream(self, user_performance: float) -> AsyncGenerator[Dict, None]:
        """Stream problems adapted to user performance"""
        while True:
            # Adjust difficulty based on performance
            if user_performance > 0.8:
                difficulty = "Hard"
            elif user_performance > 0.6:
                difficulty = "Medium"
            else:
                difficulty = "Easy"
            
            problem_data = {
                "difficulty": difficulty,
                "performance_based": True,
                "user_performance": user_performance,
                "timestamp": datetime.now().isoformat()
            }
            
            yield problem_data
            await asyncio.sleep(1)