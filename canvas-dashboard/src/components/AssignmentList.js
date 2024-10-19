import React, { useState, useEffect } from 'react';
import { getEnrollments } from '../api';

const AssignmentList = ({ course, assignments }) => {
    const [people, setPeople] = useState([]);

    useEffect(() => {
        const fetchPeople = async () => {
            const fetchedPeople = await getEnrollments(course.id);
            setPeople(fetchedPeople);
        };
        fetchPeople();
    }, [course]);

    const formatDueDate = (dueDate) => {
        try {
            const parsedTime = new Date(dueDate);
            return parsedTime.toLocaleString();
        } catch (error) {
            console.error('Error formatting due date:', error);
            return '';
        }
    };

    const isPastDue = (dueDate) => new Date(dueDate) < new Date();

    // Separate assignments into past due and upcoming
    const sortedAssignments = {
        pastDue: assignments.filter((assignment) => assignment.due_at && isPastDue(assignment.due_at)),
        upcoming: assignments.filter((assignment) => assignment.due_at && !isPastDue(assignment.due_at)),
    };

    return (
        <div className="assignment-list">
            <h3>Assignments for {course.name}</h3>

            {/* Past Due Assignments */}
            {sortedAssignments.pastDue.length > 0 && (
                <>
                    <h4>Past Due Assignments</h4>
                    <ul>
                        {sortedAssignments.pastDue.map((assignment, index) => (
                            <li key={index}>
                                <input type="checkbox" />
                                {assignment.name} - Due: {formatDueDate(assignment.due_at)}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Upcoming Assignments */}
            {sortedAssignments.upcoming.length > 0 && (
                <>
                    <h4>Upcoming Assignments</h4>
                    <ul>
                        {sortedAssignments.upcoming.map((assignment, index) => (
                            <li key={index}>
                                <input type="checkbox" />
                                {assignment.name} - Due: {formatDueDate(assignment.due_at)}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* People to Reach Out to */}
            <h3>Need Help? Reach out to these people!</h3>
            <ul>
                {people.length > 0 ? (
                    people.map((person, index) => (
                        <li key={index}>{person.name} ({person.role})</li>
                    ))
                ) : (
                    <li>No TAs or graders available for this course.</li>
                )}
            </ul>
        </div>
    );
};

export default AssignmentList;
