from flask import Flask, request, jsonify, render_template
import sys
import os

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prompt import process_prompt
from image_gen import generate_image
from removebg import remove_background

app = Flask(__name__, 
            template_folder='../templates',
            static_folder='../static')

MAX_PROMPT_LENGTH = 2000

@app.route('/')
def index():
    """Serve the main application page"""
    return render_template('index.html')

@app.route('/prompt/<string:text>', methods=['GET'])
def gen_prompt(text):
    """Enhance a text prompt using Bria AI"""
    try:
        if len(text) > MAX_PROMPT_LENGTH:
            return jsonify({
                "error": f"Prompt too long! Max length is {MAX_PROMPT_LENGTH} characters."
            }), 400

        enhanced_prompt = process_prompt(text)
        return jsonify({
            "original_prompt": text,
            "enhanced_prompt": enhanced_prompt
        })
    except Exception as e:
        return jsonify({
            "error": "Failed to enhance prompt. Please try again.",
            "details": str(e)
        }), 500

@app.route('/image/<string:text>', methods=['GET'])
def gen_image(text):
    """Generate an image from a text prompt using Bria AI"""
    try:
        if len(text) > MAX_PROMPT_LENGTH:
            return jsonify({
                "error": f"Prompt too long! Max length is {MAX_PROMPT_LENGTH} characters."
            }), 400

        image_urls = generate_image(text)
        return jsonify({
            "prompt": text,
            "image_urls": image_urls
        })
    except Exception as e:
        return jsonify({
            "error": "Failed to generate image. Please try again.",
            "details": str(e)
        }), 500

@app.route('/removebg', methods=['POST'])
def removebg():
    """Remove background from an uploaded image using Bria AI"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Missing image file"}), 400

        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Optional query params
        preserve_partial_alpha = request.form.get('preserve_partial_alpha', 'true').lower() == 'true'
        sync = request.form.get('sync', 'true').lower() == 'true'
        content_moderation = request.form.get('content_moderation', 'false').lower() == 'true'

        result = remove_background(
            image_file,
            preserve_partial_alpha=preserve_partial_alpha,
            sync=sync,
            content_moderation=content_moderation
        )

        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to remove background. Please try again.",
            "details": str(e)
        }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500

# Export the app for Vercel
# Vercel's Python runtime expects the WSGI app to be named 'app'
