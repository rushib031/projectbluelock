import React from 'react';

const AssignmentList = ({ course, assignments }) => {
    return (
        <div className="assignment-list">
            <h3>Assignments for {course.name}</h3>
            <ul>
                {assignments.map((assignment, index) => (
                    <li key={index}>
                        {assignment.name} - Due: {assignment.due_at}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentList;
