import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_CANVAS_API_BASE_URL;
const HEADERS = {
    'Authorization': `Bearer ${process.env.REACT_APP_ACCESS_TOKEN}`,
};

// Utility function for paginated GET requests
const paginatedGet = async (url) => {
    let results = [];
    while (url) {
        try {
            const response = await axios.get(url, { headers: HEADERS });
            results = results.concat(response.data);
            url = parseNextLink(response.headers.link);
        } catch (error) {
            console.error("Error fetching paginated data", error);
            break;
        }
    }
    return results;
};

// Utility function to parse the "next" link header
const parseNextLink = (linkHeader) => {
    if (!linkHeader) return null;
    const nextLink = linkHeader.split(',').find((s) => s.includes('rel="next"'));
    return nextLink ? nextLink.split(';')[0].replace('<', '').replace('>', '') : null;
};

// Fetch user data
export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/self`, { headers: HEADERS });
        return response.data;
    } catch (error) {
        console.error("Error fetching user", error);
        return null;
    }
};

// Fetch courses
export const getCourses = async (userId, enrollmentState) => {
    let url = `${API_BASE_URL}/users/${userId}/courses`;
    if (enrollmentState) url += `?enrollment_state=${enrollmentState}`;
    return await paginatedGet(url);
};

// Fetch assignments
export const getAssignments = async (courseId) => {
    const url = `${API_BASE_URL}/courses/${courseId}/assignments`;
    return await paginatedGet(url);
};

// Fetch enrollments for a course
export const getEnrollments = async (courseId) => {
    const url = `${API_BASE_URL}/courses/${courseId}/enrollments`;
    return await paginatedGet(url);
};
