import requests
import os
from dotenv import load_dotenv
import logging

load_dotenv()

BRIA_API_TOKEN = os.getenv("BRIA_API_TOKEN")
logger = logging.getLogger(__name__)

def generate_image(prompt_data):
    """
    Generate images from text prompt using Bria AI API
    
    Args:
        prompt_data (str): The text prompt for image generation
        
    Returns:
        list: List of image URLs
        
    Raises:
        ValueError: If API token is missing
        requests.RequestException: If API request fails
    """
    if not BRIA_API_TOKEN:
        logger.error("BRIA_API_TOKEN is not set in environment variables")
        raise ValueError("API token is not configured. Please set BRIA_API_TOKEN in .env file")

    model_version = "2.3"
    url = "https://engine.prod.bria-api.com/v1/text-to-image/base/" + model_version

    max_result = 4  # Generate 4 images like Meta AI
    payload = {
        "prompt": prompt_data,
        "num_results": max_result,
        "sync": True
    }

    headers = {
        "Content-Type": "application/json",
        "api_token": BRIA_API_TOKEN
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()
        
        # Extract URLs from response
        urls = []
        if "result" in data:
            urls = [url for item in data.get("result", []) for url in item.get("urls", [])]
        elif "urls" in data:
            urls = data["urls"]
        else:
            logger.warning(f"Unexpected API response format: {data}")
            
        if not urls:
            logger.warning("No image URLs returned from API")
            
        return urls
        
    except requests.exceptions.Timeout:
        logger.error("API request timed out")
        raise requests.RequestException("Image generation timed out. Please try again.")
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error: {e}")
        if response.status_code == 401:
            raise ValueError("Invalid API token. Please check your BRIA_API_TOKEN")
        elif response.status_code == 429:
            raise requests.RequestException("Rate limit exceeded. Please try again later.")
        else:
            raise requests.RequestException(f"API error: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in image generation: {e}")
        raise