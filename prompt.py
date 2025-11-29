import requests
import os
from dotenv import load_dotenv
import logging

load_dotenv()  # Load variables from .env

BRIA_API_TOKEN = os.getenv("BRIA_API_TOKEN")
logger = logging.getLogger(__name__)

def process_prompt(text):
    """
    Enhance a text prompt using Bria AI API
    
    Args:
        text (str): The original prompt text
        
    Returns:
        str: The enhanced prompt
        
    Raises:
        ValueError: If API token is missing
        requests.RequestException: If API request fails
    """
    if not BRIA_API_TOKEN:
        logger.error("BRIA_API_TOKEN is not set in environment variables")
        raise ValueError("API token is not configured. Please set BRIA_API_TOKEN in .env file")
    
    url = "https://engine.prod.bria-api.com/v1/prompt_enhancer"

    payload = {
        "prompt": text
    }

    headers = {
        "Content-Type": "application/json",
        "api_token": BRIA_API_TOKEN
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()
        
        # Check if the response contains the expected data
        if "prompt variations" in data:
            enhanced_prompt = data["prompt variations"]
        elif "result" in data:
            enhanced_prompt = data["result"]
        else:
            logger.warning(f"Unexpected API response format: {data}")
            enhanced_prompt = text  # Return original if format is unexpected
            
        return enhanced_prompt
        
    except requests.exceptions.Timeout:
        logger.error("API request timed out")
        raise requests.RequestException("Request timed out. Please try again.")
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
        logger.error(f"Unexpected error: {e}")
        raise

