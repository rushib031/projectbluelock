import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';  // URL for the Flask backend

// Fetch user data from the Flask backend
export const getUser = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user data from backend:", error);
        return null;
    }
};

// Fetch courses from the Flask backend
export const getCourses = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/courses`, {
            params: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching courses from backend:", error);
        return [];
    }
};

// Fetch assignments for a specific course from the Flask backend
export const getAssignments = async (courseId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/assignments/${courseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching assignments from backend:", error);
        return [];
    }
};
