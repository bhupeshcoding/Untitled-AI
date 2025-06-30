import time
import functools
import asyncio
from typing import Any, Callable, Dict, Optional
from datetime import datetime, timedelta
import logging
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

def timing_decorator(func: Callable) -> Callable:
    """Decorator to measure function execution time"""
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"{func.__name__} executed in {execution_time:.4f} seconds")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.4f} seconds: {str(e)}")
            raise
    
    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"{func.__name__} executed in {execution_time:.4f} seconds")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.4f} seconds: {str(e)}")
            raise
    
    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

def cache_result(ttl: int = 3600, key_prefix: str = ""):
    """Decorator to cache function results"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                logger.info(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, ttl)
            logger.info(f"Cache miss for {func.__name__}, result cached")
            return result
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            # For sync functions, use a simpler caching mechanism
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Simple in-memory cache for sync functions
            if not hasattr(sync_wrapper, '_cache'):
                sync_wrapper._cache = {}
                sync_wrapper._cache_times = {}
            
            current_time = datetime.now()
            if (cache_key in sync_wrapper._cache and 
                current_time - sync_wrapper._cache_times[cache_key] < timedelta(seconds=ttl)):
                logger.info(f"Cache hit for {func.__name__}")
                return sync_wrapper._cache[cache_key]
            
            result = func(*args, **kwargs)
            sync_wrapper._cache[cache_key] = result
            sync_wrapper._cache_times[cache_key] = current_time
            logger.info(f"Cache miss for {func.__name__}, result cached")
            return result
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

def rate_limit(max_calls: int = 100, window_seconds: int = 60):
    """Decorator to implement rate limiting"""
    def decorator(func: Callable) -> Callable:
        call_times = []
        
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            current_time = time.time()
            
            # Remove old calls outside the window
            call_times[:] = [t for t in call_times if current_time - t < window_seconds]
            
            if len(call_times) >= max_calls:
                raise Exception(f"Rate limit exceeded: {max_calls} calls per {window_seconds} seconds")
            
            call_times.append(current_time)
            return await func(*args, **kwargs)
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            current_time = time.time()
            
            # Remove old calls outside the window
            call_times[:] = [t for t in call_times if current_time - t < window_seconds]
            
            if len(call_times) >= max_calls:
                raise Exception(f"Rate limit exceeded: {max_calls} calls per {window_seconds} seconds")
            
            call_times.append(current_time)
            return func(*args, **kwargs)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

def retry(max_attempts: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """Decorator to retry failed function calls"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            current_delay = delay
            
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {str(e)}")
                        await asyncio.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
            
            raise last_exception
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            current_delay = delay
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {str(e)}")
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
            
            raise last_exception
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

def validate_input(schema: Dict[str, Any]):
    """Decorator to validate function input parameters"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Basic validation logic (can be extended with pydantic)
            for key, expected_type in schema.items():
                if key in kwargs:
                    if not isinstance(kwargs[key], expected_type):
                        raise ValueError(f"Parameter {key} must be of type {expected_type.__name__}")
            return await func(*args, **kwargs)
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            for key, expected_type in schema.items():
                if key in kwargs:
                    if not isinstance(kwargs[key], expected_type):
                        raise ValueError(f"Parameter {key} must be of type {expected_type.__name__}")
            return func(*args, **kwargs)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator