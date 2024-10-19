import React, { useState, useEffect } from 'react';
import { getUser, getCourses, getAssignments } from '../api';
import CourseSelector from './CourseSelector';
import AssignmentList from './AssignmentList';

const CourseDashboard = () => {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await getUser();
            setUser(userData);
            if (userData) {
                const fetchedCourses = await getCourses(userData.id);
                setCourses(fetchedCourses);
            }
        };
        fetchUserData();
    }, []);

    const handleCourseSelect = async (course) => {
        setSelectedCourse(course);
        const courseAssignments = await getAssignments(course.id);
        setAssignments(courseAssignments);
    };

    return (
        <div className="course-dashboard">
            <h1>Welcome to the Course Dashboard</h1>
            {user && <h2>Welcome, {user.name}</h2>}
            <CourseSelector courses={courses} onCourseSelect={handleCourseSelect} />
            {selectedCourse && <AssignmentList course={selectedCourse} assignments={assignments} />}
        </div>
    );
};

export default CourseDashboard;
