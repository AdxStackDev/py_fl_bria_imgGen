import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

BRIA_API_TOKEN = os.getenv("BRIA_API_TOKEN")

def process_prompt(text):
    url = "https://engine.prod.bria-api.com/v1/prompt_enhancer"

    payload = {
        "prompt": text
    }

    headers = {
        "Content-Type": "application/json",
        "api_token": BRIA_API_TOKEN
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    enhanced_prompt = data.get("prompt variations", text)
    return enhanced_prompt
