from flask import Flask, request, jsonify, render_template
from prompt import process_prompt
from image_gen import generate_image
from removebg import remove_background
import socket
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

MAX_PROMPT_LENGTH = 2000  # limit in characters

def find_free_port(start_port=5000, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    return None

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
        logger.error(f"Error enhancing prompt: {e}")
        return jsonify({
            "error": "Failed to enhance prompt. Please try again."
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
        logger.error(f"Error generating image: {e}")
        return jsonify({
            "error": "Failed to generate image. Please try again."
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
        logger.error(f"Error removing background: {e}")
        return jsonify({
            "error": "Failed to remove background. Please try again."
        }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {e}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    try:
        # Find an available port
        port = find_free_port()
        
        if port is None:
            logger.error("Could not find an available port between 5000-5010")
            sys.exit(1)
        
        logger.info("=" * 70)
        logger.info("🚀 Bria AI Application Starting...")
        logger.info("=" * 70)
        logger.info(f"📍 Server running on: http://127.0.0.1:{port}")
        logger.info(f"📍 Also accessible at: http://localhost:{port}")
        logger.info("=" * 70)
        logger.info("Press CTRL+C to stop the server")
        logger.info("=" * 70)
        
        app.run(
            host='127.0.0.1',
            port=port,
            debug=True,
            use_reloader=True
        )
    except KeyboardInterrupt:
        logger.info("\n👋 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

