
# Flask Bria API Integration

This project demonstrates how to integrate the **Bria AI API** with a simple Flask backend.  
It provides endpoints for:

- ✅ **Prompt enhancement**
- ✅ **Image generation**
- ✅ **Background removal**

## 📂 Project Structure

```
├── app.py          # Main Flask server
├── prompt.py       # Handles Bria prompt enhancement
├── image_gen.py    # Handles Bria image generation
├── remove_bg.py    # Handles Bria background removal
├── .env            # Stores API keys securely (not committed)
└── README.md       # Project documentation
```
## 🚀 How It Works

**1️⃣ Prompt Enhancer**

- **Route:** `/prompt/<text>`
- Calls Bria’s prompt enhancement endpoint.
- Returns the enhanced prompt.

---

**2️⃣ Image Generator**

- **Route:** `/image/<text>`
- Uses the prompt to generate images with Bria’s image generation API.
- Returns a list of generated image URLs.

---

**3️⃣ Remove Background**

- **Route:** `/removebg` (POST)
- Upload an image file (`multipart/form-data`).
- Calls Bria’s background removal API.
- Returns the result as JSON.

---

## ⚙️ .env Configuration

Create a `.env` file:
BRIA_API_TOKEN=your_bria_api_key_here

**Add `.env` to `.gitignore** so you don’t accidentally push secrets.

---

## ▶️ How To Run

1️⃣ Install dependencies:
pip install flask python-dotenv requests

2️⃣ Start the server:
python app.py

3️⃣ Use **Postman**, **curl**, or any HTTP client to hit the routes.

---

## 📤 Example RemoveBG Request

curl -X POST http://127.0.0.1:5000/removebg \
  -F "image=@your_image.jpg" \
  -F "preserve_partial_alpha=true" \
  -F "sync=true" \
  -F "content_moderation=false"

---

## ✅ Good Practices

- Keep your `.env` secrets **private**.
- Validate input length (max 2000 chars for prompts).
- Use HTTPS for production.
- Add logging and error handling for real-world use.

---

## 📜 License

MIT — do what you like, but use responsibly.
