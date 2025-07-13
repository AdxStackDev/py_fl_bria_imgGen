import requests
import os
from dotenv import load_dotenv

load_dotenv()

BRIA_API_TOKEN = os.getenv("BRIA_API_TOKEN")

def remove_background(
    image_file,
    preserve_partial_alpha=True,
    sync=True,
    content_moderation=False
):
    url = "https://engine.prod.bria-api.com/v1/background/remove"

    files = [
        ('file', (image_file.filename, image_file.stream, image_file.mimetype))
    ]

    data = {
        "preserve_partial_alpha": str(preserve_partial_alpha).lower(),
        "sync": str(sync).lower(),
        "content_moderation": str(content_moderation).lower()
    }

    headers = {
        "api_token": BRIA_API_TOKEN
    }

    response = requests.post(url, headers=headers, data=data, files=files)

    if response.status_code != 200:
        return {"error": f"Bria API error: {response.status_code}", "details": response.text}

    return response.json()
