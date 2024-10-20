import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Primary color for buttons, links, etc.
        },
        secondary: {
            main: '#d32f2f', // Accent color for warnings or highlights
        },
        background: {
            default: '#f4f6f8', // Light background color for the entire app
            paper: '#ffffff', // Background for cards and sections
        },
        text: {
            primary: '#333333', // Main text color
            secondary: '#555555', // Secondary text color for details
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

export default theme;
