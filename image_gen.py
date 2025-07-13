import requests
import os
from dotenv import load_dotenv

load_dotenv()

BRIA_API_TOKEN = os.getenv("BRIA_API_TOKEN")

def generate_image(prompt_data):

    model_version = "2.3"
    url = "https://engine.prod.bria-api.com/v1/text-to-image/base/" + model_version

    max_result = 1;
    payload = {
    "prompt": prompt_data,
    "num_results": max_result,
    "sync": True
    }

    headers = {
    "Content-Type": "application/json",
    "api_token": BRIA_API_TOKEN
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    urls = [url for item in data.get("result", []) for url in item.get("urls", [])]
    return urls