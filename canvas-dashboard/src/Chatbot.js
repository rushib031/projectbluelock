// src/App.js

import React from 'react';
import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import CourseDashboard from './components/CourseDashboard';
import ChatbotWidget from './Chatbot'; // Import the Chatbot component
import './App.css'; // Add some CSS for styling

const App = () => {
  return (
    <div className="App">
      {/* App Bar for the Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Canvas Course Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container sx={{ padding: 4 }}>
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Your Course Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your courses and assignments seamlessly. Click on a course to view details, assignments, and more!
          </Typography>
        </Box>

        {/* Course Dashboard Component */}
        <CourseDashboard />
      </Container>

      {/* Chatbot Integration */}
      <ChatbotWidget /> {/* Adds the chatbot button and widget */}
    </div>
  );
};

export default App;
