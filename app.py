from flask import Flask, request, jsonify
from prompt import process_prompt
from image_gen import generate_image
from removebg import remove_background

app = Flask(__name__)

MAX_PROMPT_LENGTH = 2000  # limit in characters

@app.route('/prompt/<string:text>', methods=['GET'])
def gen_prompt(text):
    if len(text) > MAX_PROMPT_LENGTH:
        return jsonify({
            "error": f"Prompt too long! Max length is {MAX_PROMPT_LENGTH} characters."
        }), 400

    enhanced_prompt = process_prompt(text)
    return jsonify({
        "original_prompt": text,
        "enhanced_prompt": enhanced_prompt
    })

@app.route('/image/<string:text>', methods=['GET'])
def gen_image(text):
    if len(text) > MAX_PROMPT_LENGTH:
        return jsonify({
            "error": f"Prompt too long! Max length is {MAX_PROMPT_LENGTH} characters."
        }), 400

    image_urls = generate_image(text)
    return jsonify({
        "prompt": text,
        "image_urls": image_urls
    })


@app.route('/removebg', methods=['POST'])
def removebg():
    if 'image' not in request.files:
        return jsonify({"error": "Missing image file"}), 400

    image_file = request.files['image']

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



if __name__ == '__main__':
    app.run(debug=True)
