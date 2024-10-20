import React, { useState, useEffect } from 'react';
import { getEnrollments } from '../api';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    Checkbox,
    Divider,
    Box,
    Avatar,
} from '@mui/material';

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
        if (!dueDate) return '';
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
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Assignments for {course.name}
            </Typography>

            {/* Past Due Assignments */}
            {sortedAssignments.pastDue.length > 0 && (
                <Card variant="outlined" sx={{ marginBottom: 2 }}>
                    <CardContent>
                        <Typography variant="h6" color="error">
                            Past Due Assignments
                        </Typography>
                        <List>
                            {sortedAssignments.pastDue.map((assignment, index) => (
                                <ListItem key={index}>
                                    <Checkbox />
                                    <Typography variant="body1">
                                        {assignment.name} - Due: {formatDueDate(assignment.due_at)}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* Upcoming Assignments */}
            {sortedAssignments.upcoming.length > 0 && (
                <Card variant="outlined" sx={{ marginBottom: 2 }}>
                    <CardContent>
                        <Typography variant="h6" color="primary">
                            Upcoming Assignments
                        </Typography>
                        <List>
                            {sortedAssignments.upcoming.map((assignment, index) => (
                                <ListItem key={index}>
                                    <Checkbox />
                                    <Typography variant="body1">
                                        {assignment.name} - Due: {formatDueDate(assignment.due_at)}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* People to Reach Out to */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Need Help? Reach out to these people!</Typography>
                    <List>
                        {people.length > 0 ? (
                            people.map((person, index) => (
                                <ListItem key={index} sx={{ alignItems: 'center' }}>
                                    <Avatar sx={{ marginRight: 2 }}>{person.name[0]}</Avatar>
                                    <Typography variant="body1">{person.name} ({person.role})</Typography>
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body1" color="textSecondary">
                                No TAs or graders available for this course.
                            </Typography>
                        )}
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AssignmentList;
