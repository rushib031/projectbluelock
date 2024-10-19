from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from React app

# Load environment variables
load_dotenv()
CANVAS_API_BASE_URL = 'https://osu.instructure.com/api/v1'
TOKEN = os.getenv('ACCESS_TOKEN')
HEADERS = {'Authorization': f'Bearer {TOKEN}'}

# Define TERM_MAP (replace with actual term mappings)
TERM_MAP = {
    160: 'Autumn 2021',
    161: 'Spring 2022',
    162: 'Summer 2022',
    163: 'Autumn 2022',
    164: 'Spring 2023',
    265: 'Summer 2023',
    266: 'Autumn 2023',
    267: 'Spring 2024',
    268: 'Summer 2024',
    269: 'Autumn 2024'
}

# Function to identify current term based on current date


def get_current_term_id():
    current_date = datetime.now()
    if current_date.month in [1, 2, 3, 4, 5]:  # Spring months
        return 267  # Replace with current Spring term ID for this year
    elif current_date.month in [6, 7, 8]:  # Summer months
        return 268  # Replace with current Summer term ID for this year
    else:  # Autumn months
        return 269  # Replace with current Autumn term ID for this year


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
        courses = response.json()
        current_term_id = get_current_term_id()  # Get the current term ID

        # Filter courses by current term
        current_courses = [
            course for course in courses
            if course.get('enrollment_term_id') == current_term_id
        ]

        return jsonify(current_courses)
    return jsonify({'error': 'Unable to fetch courses'}), 500


@app.route('/api/assignments/<int:course_id>', methods=['GET'])
def get_course_assignments(course_id):
    url = f"{CANVAS_API_BASE_URL}/courses/{course_id}/assignments"
    response = requests.get(url, headers=HEADERS)
    if response.ok:
        return jsonify(response.json())
    return jsonify({'error': 'Unable to fetch assignments'}), 500


@app.route('/api/enrollments/<int:course_id>', methods=['GET'])
def get_enrollments(course_id):
    url = f"{CANVAS_API_BASE_URL}/courses/{course_id}/enrollments"
    response = requests.get(url, headers=HEADERS)
    if response.ok:
        enrollments = response.json()
        relevant_people = [
            {
                'name': enrollment['user']['name'],
                'role': {
                    'TaEnrollment': 'TA',
                    'GraderEnrollment': 'Grader',
                    'StudentEnrollment': 'Student',
                    'TeacherEnrollment': 'Teacher'
                    # Fix key to match actual enrollment type key
                }.get(enrollment['type'], enrollment['type'])
            }
            for enrollment in enrollments if enrollment['type'] in ['TaEnrollment', 'GraderEnrollment']
        ]
        return jsonify(relevant_people)
    return jsonify({'error': 'Unable to fetch enrollments'}), 500


if __name__ == '__main__':
    app.run(debug=True)
