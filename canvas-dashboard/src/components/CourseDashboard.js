import React, { useState } from 'react';
import CourseSelector from './CourseSelector';
import AssignmentList from './AssignmentList';

const CourseDashboard = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
    };

    return (
        <div className="course-dashboard">
            <CourseSelector onCourseSelect={handleCourseSelect} />
            {selectedCourse && <AssignmentList course={selectedCourse} />}
        </div>
    );
};

export default CourseDashboard;
