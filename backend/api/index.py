from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from .logic import clone_and_process_repo

app = Flask(__name__)

# Set up CORS to allow requests from your frontend
CORS(app)

@app.route('/', methods=['GET'])
def home():
    print("Health check route hit")
    return jsonify({"status": "ok", "message": "Backend server is running!"})

@app.route('/api/generate', methods=['POST'])
def handle_generate():
    print("Generate route hit")

    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY is not set")
        return jsonify({"error": "GOOGLE_API_KEY environment variable not set."}), 500

    # --- Input Validation ---
    # Get the 'git_url' from the JSON body of the request
    body = request.get_json()
    if not body or 'git_url' not in body:
        print("Error: 'git_url' not in request body")
        return jsonify({"error": "git_url is required in the request body"}), 400

    git_url = body['git_url']
    print(f"Processing URL: {git_url}")

    # --- Run The Logic ---
    try:
        # This is where we call your main logic function from logic.py
        readme_content = clone_and_process_repo(git_url)
        
        # Success! Send the generated README back to the frontend
        return jsonify({"readme": readme_content})

    except ValueError as ve:
        # This catches errors like "No relevant code files found"
        print(f"Value error: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # This is a catch-all for any other error
        # (e.g., repository not found, LLM error, etc.)
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500

if __name__ == '__main__':
    # Load .env file for local development
    from dotenv import load_dotenv
    load_dotenv()
    print("Running in debug mode for local development...")
    # We set the port to 5001 so it doesn't conflict with your frontend on 3000
    app.run(port=5001)
