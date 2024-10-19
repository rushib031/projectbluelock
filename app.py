from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from React app

# Load environment variables
load_dotenv()
CANVAS_API_BASE_URL = 'https://osu.instructure.com/api/v1'
TOKEN = os.getenv('ACCESS_TOKEN')
HEADERS = {'Authorization': f'Bearer {TOKEN}'}


@app.route('/api/user', methods=['GET'])
def get_user():
    url = f"{CANVAS_API_BASE_URL}/users/self"
    response = requests.get(url, headers=HEADERS)
    if response.ok:
        return jsonify(response.json())
    return jsonify({'error': 'Unable to fetch user data'}), 500


@app.route('/api/courses', methods=['GET'])
def get_courses():
    user_id = request.args.get('user_id')
    url = f"{CANVAS_API_BASE_URL}/users/{user_id}/courses"
    response = requests.get(url, headers=HEADERS)
    if response.ok:
        return jsonify(response.json())
    return jsonify({'error': 'Unable to fetch courses'}), 500


@app.route('/api/assignments/<int:course_id>', methods=['GET'])
def get_course_assignments(course_id):
    url = f"{CANVAS_API_BASE_URL}/courses/{course_id}/assignments"
    response = requests.get(url, headers=HEADERS)
    if response.ok:
        return jsonify(response.json())
    return jsonify({'error': 'Unable to fetch assignments'}), 500


if __name__ == '__main__':
    app.run(debug=True)
