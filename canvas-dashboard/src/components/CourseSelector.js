import React from 'react';

const CourseSelector = ({ courses, onCourseSelect }) => {
    return (
        <div className="course-selector">
            <h3>Select a Course</h3>
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
