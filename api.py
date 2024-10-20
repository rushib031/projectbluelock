import os
import requests
import json
from datetime import datetime, timedelta

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

CANVAS_API_BASE_URL = 'https://osu.instructure.com/api/v1'
TOKEN = os.getenv('ACCESS_TOKEN')
HEADERS = {'Authorization': f'Bearer {TOKEN}'}

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


def paginated_get(url):
    results = []
    while url:
        response = requests.get(url, headers=HEADERS)
        if response.ok:
            results.extend(response.json())
            url = parse_next_link(response.headers.get('link'))
        else:
            handle_error(response)
            break
    return results


def parse_next_link(link_header):
    if not link_header:
        return None
    links = [link.split(';') for link in link_header.split(',')]
    next_link = next((link[0][1:-1]
                     for link in links if 'rel="next"' in link[1]), None)
    return next_link


def get_courses(user_id, enrollment_state=None):
    url = f"{CANVAS_API_BASE_URL}/users/{user_id}/courses"
    params = {}
    if enrollment_state:
        params['enrollment_state'] = enrollment_state
    if params:
        url += f"?{requests.compat.urlencode(params)}"

    courses = paginated_get(url)
    return [
        {
            'id': course['id'],
            'course_code': course['course_code'],
            'title': course['name'],
            'enrollment_term_id': course['enrollment_term_id'],
            'semester': TERM_MAP.get(course['enrollment_term_id'], 'Unknown Term')
        }
        for course in courses
        if course['course_code'] and course['name'] and TERM_MAP.get(course['enrollment_term_id'], 'Unknown Term') != 'Unknown Term'
    ]


def get_course_assignments(course_id):
    url = f"{CANVAS_API_BASE_URL}/courses/{course_id}/assignments"
    assignments = paginated_get(url)
    return [{'name': assignment['name'], 'due_at': assignment['due_at']} for assignment in assignments]


def get_current_user():
    url = f"{CANVAS_API_BASE_URL}/users/self"
    response = requests.get(url, headers=HEADERS)
    if response.ok:
        user_info = response.json()
        print(f"User ID: {user_info['id']}")
        print(f"User Name: {user_info['name']}")
        return user_info
    else:
        handle_error(response)
        return None


def handle_error(response):
    print(f"Error: {response.status_code} - {response.reason}")


def get_enrollments(course_id):
    url = f"{CANVAS_API_BASE_URL}/courses/{course_id}/enrollments"
    enrollments = paginated_get(url)
    return [
        {
            'name': enrollment['user']['name'],
            'role': {
                'TaEnrollment': 'TA',
                'GraderEnrollment': 'Grader',
                'StudentEnrollment': 'Student',
                'TeacherEnrollment': 'Teacher'
            }.get(enrollment['role'], enrollment['role'])
        }
        for enrollment in enrollments
    ]


def format_due_date(due_at):
    if not due_at:
        return ''
    try:
        parsed_time = datetime.strptime(due_at, '%Y-%m-%dT%H:%M:%SZ')
        adjusted_time = parsed_time - timedelta(hours=4)
        return adjusted_time.strftime('%m/%d/%Y %I:%M %p')
    except (ValueError, TypeError):
        return ''


def generate_html(course, assignments, course_name, append=False):
    mode = 'a' if append else 'w'
    with open("indexcompare.html", mode) as file:
        if not append:
            file.write("<body>\n")
        file.write(f"<h2>To-Do List for {course_name}</h2>\n")

        past_due, upcoming = [], []
        current_time = datetime.now()

        for assignment in assignments:
            due_date = assignment['due_at']
            try:
                parsed_due = datetime.strptime(due_date, '%Y-%m-%dT%H:%M:%SZ')
                if parsed_due < current_time:
                    past_due.append(assignment)
                else:
                    upcoming.append(assignment)
            except (ValueError, TypeError):
                continue

        past_due.sort(key=lambda x: datetime.strptime(
            x['due_at'], '%Y-%m-%dT%H:%M:%SZ'))
        upcoming.sort(key=lambda x: datetime.strptime(
            x['due_at'], '%Y-%m-%dT%H:%M:%SZ'))

        if past_due:
            file.write("<h3>Past Due</h3><table>\n")
            for assignment in past_due:
                due_date = format_due_date(assignment['due_at'])
                file.write(f"<tr><td style='width: 625px; padding-right: 20px;'>{
                           assignment['name']}</td><td>(Due: {due_date})</td><td><input type='checkbox'></td></tr>\n")
            file.write("</table>\n")

        if upcoming:
            file.write("<h3>Upcoming Assignments</h3><table>\n")
            for assignment in upcoming:
                due_date = format_due_date(assignment['due_at'])
                file.write(f"<tr><td style='width: 625px; padding-right: 20px;'>{
                           assignment['name']}</td><td>(Due: {due_date})</td><td><input type='checkbox'></td></tr>\n")
            file.write("</table>\n")

        file.write("<h3>Need Help? Reach out to these people!</h3>\n")
        enrollments = get_enrollments(course['id'])
        professors = ''
        count = 0
        for enrollment in enrollments:
            if enrollment['role'] in ['TA', 'Grader']:
                file.write(f"<li>{enrollment['name']} ({
                           enrollment['role']})</li>\n")
                count += 1
            else:
                professors = enrollment['name']

        if count == 0:
            file.write(
                f"<li>Sorry, there are no TAs or graders found for this class.</li>\n")
            file.write(f"<li>Contact course instructor {
                       professors} if you need any help.</li>\n")

        if not append:
            file.write("</body></html>\n")
    print(f"Assignments for '{course_name}' added to the HTML file.")


if __name__ == "__main__":
    current_user = get_current_user()
    if current_user:
        with open('indexcompare.html', 'w') as file:
            file.write(f"<html><head><title>{
                       current_user['name']}'s to-do list</title></head><h1>Welcome to {current_user['name']}'s to-do list</h1>")

        print("Welcome to the To-Do list maker!")
        print("Please choose the course you would like to make a To-Do list for.")

        current_courses = get_courses(current_user['id'], 'active')
        if not current_courses:
            print("No active courses found.")
        else:
            selected_courses = []
            while True:
                available_courses = [
                    course for course in current_courses if course not in selected_courses]
                if not available_courses:
                    print("All courses have been processed.")
                    break

                for i, course in enumerate(available_courses, 1):
                    print(f"{i}. {course['title']} ({course['semester']})")

                selected_index = int(
                    input("\nEnter the number for the course, or -1 for all courses: ")) - 1
                if selected_index == -2:
                    for course in available_courses:
                        selected_courses.append(course)
                        assignments = get_course_assignments(course['id'])
                        if assignments:
                            generate_html(
                                course, assignments, course['title'], append=bool(selected_courses))
                        else:
                            print(f"No assignments found for {
                                  course['title']}.")
                elif 0 <= selected_index < len(available_courses):
                    selected_course = available_courses[selected_index]
                    selected_courses.append(selected_course)
                    assignments = get_course_assignments(selected_course['id'])
                    if assignments:
                        generate_html(selected_course, assignments, selected_course['title'], append=bool(
                            selected_courses))
                    else:
                        print(f"No assignments found for {
                              selected_course['title']}.")
                else:
                    print("Invalid selection.")

                if input("Display another course's to-do list? (y/n): ").strip().lower() != 'y':
                    break
