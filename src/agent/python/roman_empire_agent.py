import os
import json
from dotenv import load_dotenv
import requests

load_dotenv()

class RomanEmpireAgent:
    def __init__(self):
        self.tavus_api_key = os.getenv('TAVUS_API_KEY')
        self.grok_api_key = os.getenv('GROK_API_KEY')
        
    def generate_response(self, query):
        # Call Grok API for historical knowledge
        headers = {
            'Authorization': f'Bearer {self.grok_api_key}',
            'Content-Type': 'application/json'
        }
        
        grok_response = requests.post(
            'https://api.grok.ai/v1/completions',
            headers=headers,
            json={
                'prompt': f"As a Roman history expert: {query}",
                'max_tokens': 150
            }
        )
        
        # Generate avatar response using Tavus
        tavus_headers = {
            'Authorization': f'Bearer {self.tavus_api_key}',
            'Content-Type': 'application/json'
        }
        
        tavus_response = requests.post(
            'https://api.tavus.io/v1/generations',
            headers=tavus_headers,
            json={
                'text': grok_response.json()['choices'][0]['text'],
                'voice_id': 'default'  # Replace with your Tavus voice ID
            }
        )
        
        return {
            'text': grok_response.json()['choices'][0]['text'],
            'video_url': tavus_response.json()['video_url']
        }

if __name__ == "__main__":
    agent = RomanEmpireAgent()
    print(json.dumps({"status": "Agent initialized successfully"}))