import React, { useState, useEffect } from 'react';
import { getCourses, getCurrentUser } from '../api';

const CourseSelector = ({ onCourseSelect }) => {
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
                const fetchedCourses = await getCourses(userData.id, 'active');
                setCourses(fetchedCourses);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="course-selector">
            <h2>Select a Course</h2>
            {user && <p>Welcome, {user.name}</p>}
            <ul>
                {courses.map((course) => (
                    <li key={course.id} onClick={() => onCourseSelect(course)}>
                        {course.name} ({course.semester})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseSelector;
