import React, { useEffect, useState } from 'react';
import { getAssignments } from '../api';

const AssignmentList = ({ course }) => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            const fetchedAssignments = await getAssignments(course.id);
            setAssignments(fetchedAssignments);
        };
        fetchAssignments();
    }, [course]);

    return (
        <div className="assignment-list">
            <h3>Assignments for {course.name}</h3>
            <ul>
                {assignments.map((assignment) => (
                    <li key={assignment.id}>
                        {assignment.name} - Due: {assignment.due_at}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentList;
